import uuid
from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from api.models import Event
from accounts.models import Customer
from django.contrib.auth import get_user_model

from django.db.models import Sum

USER_MODEL = settings.AUTH_USER_MODEL

class CinemaManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(
            organizer__is_deleted=False
        )
    
class Cinema(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    city = models.CharField(max_length=50)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    opening_hours = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    organizer = models.ForeignKey(
        "accounts.Admin", 
        on_delete=models.CASCADE, 
        related_name="cinemas",
        limit_choices_to={'role': 'organizer'}
    )
    objects = CinemaManager()
    class Meta:
        ordering = ['city', 'name']

    def __str__(self):
        return f"{self.name} ({self.city})"

class CinemaHallManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(
            cinema__organizer__is_deleted=False
        )
class CinemaHall(models.Model):
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE, related_name='halls')
    name = models.CharField(max_length=50)
    screen_type = models.CharField(
        max_length=20,
        choices=[('2D', '2D'), ('3D', '3D'), ('IMAX', 'IMAX'), ('4DX', '4DX')],
        default='2D'
    )
    base_price = models.DecimalField(max_digits=7, decimal_places=2, default=Decimal('0.00'))
    objects = CinemaHallManager()
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['cinema', 'name'], name='unique_hall_per_cinema'),
        ]

    def __str__(self):
        return f"{self.cinema.name} - {self.name}"

class MovieManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(
            created_by__is_deleted=False
        )
    
class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    release_date = models.DateField()
    genre = models.CharField(max_length=100, blank=True)
    director = models.CharField(max_length=100, blank=True)
    cast = models.TextField(help_text="Main cast members", blank=True)
    poster = models.ImageField(upload_to='movie_posters/', null=True, blank=True)
    trailer_url = models.URLField(blank=True)
    rating = models.CharField(
        max_length=10,
        choices=[('G', 'G'), ('PG', 'PG'), ('PG-13', 'PG-13'), ('R', 'R'), ('NC-17', 'NC-17')],
        default='G'
    )
    is_active = models.BooleanField(default=True)
    default_image = models.ImageField(
        upload_to='cinema_movie',
        blank=True,
        help_text='Uploads default movie image',
        null=True
    )
    created_by = models.ForeignKey(
        'accounts.Admin',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_movies"
    )
    objects = MovieManager()
    class Meta:
        ordering = ['-release_date', 'title']

    def __str__(self):
        return self.title
    
    def get_calendar_data(self):
        """Retourne les données pour le calendrier"""
        # Récupérer la prochaine session
        next_session = self.sessions.filter(
            start_time__gte=timezone.now()
        ).order_by('start_time').first()
        
        return {
            'id': self.id,
            'name': self.title,
            'date': next_session.start_time if next_session else self.release_date,
            'venue': next_session.hall.cinema.name if next_session else None,
            'image_url': self.poster.url if self.poster else (
                self.default_image.url if self.default_image else None
            ),
            'type': 'movie',
            'description': self.description,
            'session_id': next_session.id if next_session else None,
        }


class MovieSession(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='sessions')
    hall = models.ForeignKey(CinemaHall, on_delete=models.CASCADE, related_name='sessions')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(editable=False)
    base_price = models.DecimalField(max_digits=7, decimal_places=2)
    vip_price = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    class Meta:
        ordering = ['start_time']
        constraints = [
            models.UniqueConstraint(fields=['hall', 'start_time'], name='unique_session_start_in_hall'),
        ]

    def clean(self):
        overlap = MovieSession.objects.filter(
            hall=self.hall
        ).exclude(pk=self.pk).filter(
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        )
        if overlap.exists():
            raise ValidationError("Cette séance chevauche une autre séance dans la même salle.")

    def save(self, *args, **kwargs):
        self.end_time = self.start_time + timezone.timedelta(minutes=self.movie.duration)
        if (self.base_price is None or self.base_price == Decimal('0.00')) and self.hall:
            self.base_price = self.hall.base_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.movie.title} — {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    def seats_total(self):
        return self.hall.seats.count()

    def seats_booked(self):
        from django.db.models import Q
        return Ticket.objects.filter(session=self, status__in=['purchased', 'used']).count()

    def seats_available(self):
        return self.seats_total() - self.seats_booked()

    def available_seats(self):
        booked_seats = Ticket.objects.filter(session=self).values_list('seat_id', flat=True)
        return self.hall.seats.exclude(id__in=booked_seats)


class Seat(models.Model):
    hall = models.ForeignKey(CinemaHall, on_delete=models.CASCADE, related_name='seats')
    rows = models.CharField(max_length=4)
    cols = models.CharField(max_length=2, blank=True, default='')
    totalSeats = models.IntegerField(blank=True, default=0)
    disabledSeats = models.JSONField(
        blank=True,
        default=list,
        help_text="Liste des sièges désactivés au format [row,col]"
    )
    VIPSeats = models.JSONField(
        blank=True,
        default=list,
        help_text="Liste des sièges VIP au format [row,col]"
    )
    seat_type = models.CharField(
        max_length=20,
        choices=[('REGULAR', 'Regular'), ('VIP', 'VIP'), ('COUPLE', 'Couple'), ('HANDICAP', 'Handicap')],
        default='REGULAR'
    )
    price_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('1.00'))

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['hall', 'rows', 'cols'], name='unique_seat_in_hall')
        ]
        ordering = ['rows', 'cols']

    def __str__(self):
        return f"{self.hall.name} R{self.rows}C{self.cols}"

    def compute_price(self, base_price):
        return (base_price * self.price_multiplier).quantize(Decimal('0.01'))

class IndividualSeat(models.Model):
    hall = models.ForeignKey(CinemaHall, on_delete=models.CASCADE, related_name='individual_seats')
    seat_config = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='individual_seats')
    row = models.PositiveIntegerField()
    col = models.PositiveIntegerField()
    seat_type = models.CharField(
        max_length=20,
        choices=[('REGULAR', 'Regular'), ('VIP', 'VIP'), ('COUPLE', 'Couple'), ('HANDICAP', 'Handicap')],
        default='REGULAR'
    )
    is_disabled = models.BooleanField(default=False)
    is_vip = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['hall', 'row', 'col'], name='unique_individual_seat')
        ]
        ordering = ['row', 'col']
    
    def __str__(self):
        return f"{self.hall.name} R{self.row}C{self.col}"
    
    def compute_price(self, base_price):
        multiplier = Decimal('1.5') if self.is_vip else Decimal('1.0')
        return (base_price * multiplier).quantize(Decimal('0.01'))


class PromoCode(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percent', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]

    SEAT_TYPE_CHOICES = [
        ('ALL', 'All seats'),
        ('VIP', 'VIP only'),
        ('REGULAR', 'Regular only'),
    ]

    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=6, decimal_places=2)

    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    usage_limit = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Max uses globally (null = unlimited)"
    )
    used_count = models.PositiveIntegerField(default=0)
    per_user_limit = models.PositiveIntegerField(default=1)

    organizer = models.ForeignKey(
        'accounts.Admin', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='promocodes'
    )
    movie = models.ForeignKey(
        Movie, 
        blank=True, 
        default=None, 
        on_delete=models.CASCADE, 
        null=True,
        related_name='promocodes'
    )
    sessions = models.ForeignKey(
        MovieSession, 
        blank=True, 
        related_name='promocodes', 
        on_delete=models.CASCADE, 
        default=None,
        null=True
    )

    seat_type = models.CharField(max_length=20, choices=SEAT_TYPE_CHOICES, default='ALL')
    min_tickets = models.PositiveIntegerField(default=0, help_text="Minimum previous tickets required")
    min_total_spent = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        default=0, 
        help_text="Minimum previous spending required"
    )

    def __str__(self):
        return f"{self.code} ({self.discount_type} {self.discount_value})"

    def apply_discount(self, price):
        """Apply discount to a given price."""
        if self.discount_type == 'percent':
            return max(price * (1 - self.discount_value / 100), 0)
        return max(price - self.discount_value, 0)

    def mark_used(self, user=None):
        """Increment usage and optionally record per-user usage."""
        self.used_count += 1
        self.save()
        if user:
            PromoUsage.objects.create(user=user, promo=self)

    def is_valid_for_user(self, user, seat, session=None, tickets_count=None, total_amount=None):
        """
        seat: instance of Seat
        session: MovieSession
        """
        now = timezone.now()

        if not self.is_active:
            return False, "Promo code is not active."
        if self.valid_from > now or self.valid_until < now:
            return False, "Promo code not valid now."
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False, "Promo code usage limit reached."

        # Determine the actual seat type
        seat_identifier = f"{seat.rows}-{seat.cols}"
        actual_seat_type = "VIP" if seat_identifier in [f"{s}" for s in seat.VIPSeats] else "REGULAR"

        # Seat type restriction
        if self.seat_type != "ALL" and actual_seat_type != self.seat_type:
            return False, f"Promo valid only for {self.seat_type} seats."

        # Session restriction
        if self.sessions.exists():
            if not session or session not in self.sessions.all():
                return False, "Promo not valid for this session."

        # Loyalty checks
        user_tickets_count = tickets_count or Ticket.objects.filter(
            customer=user, 
            status__in=['purchased','used']
        ).count()
        user_total_spent = total_amount or Ticket.objects.filter(
            customer=user, 
            status__in=['purchased','used']
        ).aggregate(total=Sum('price'))['total'] or 0

        if user_tickets_count < self.min_tickets:
            return False, f"You need at least {self.min_tickets} previous tickets."
        if user_total_spent < self.min_total_spent:
            return False, f"You need to have spent at least {self.min_total_spent}."

        # Per-user usage limit
        user_usage = PromoUsage.objects.filter(user=user, promo=self).count()
        if user_usage >= self.per_user_limit:
            return False, "You have already used this promo the maximum allowed times."

        return True, "Promo code is valid."

class PromoUsage(models.Model):
    """Tracks which users have used a promo code."""
    promo = models.ForeignKey(PromoCode, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(USER_MODEL, on_delete=models.CASCADE)
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('promo', 'user')  # enforce per-user limit


class BonusReward(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    seat_type = models.CharField(max_length=20, choices=[
        ('ALL', 'Tous'),
        ('REGULAR', 'Regular'),
        ('VIP', 'VIP'),
        ('COUPLE', 'Couple'),
        ('HANDICAP', 'Handicap'),
    ], default='ALL')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Bonus: {self.name} ({self.seat_type})"
    bonus_image = models.ImageField(upload_to='bonus/', blank=True, null=True)

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('reserved', 'Reserved'), 
        ('purchased', 'Purchased'), 
        ('refunded', 'Refunded'), 
        ('used', 'Used'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired')
    ]

    ticket_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    session = models.ForeignKey(MovieSession, on_delete=models.CASCADE, related_name='tickets')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='tickets')
    row = models.IntegerField(default=0)
    col = models.IntegerField(default=0)
    customer = models.ForeignKey(
        'accounts.Customer', 
        on_delete=models.CASCADE, 
        related_name='cinema_tickets',
        null=True, 
        blank=True
    )
    purchase_date = models.DateTimeField(auto_now_add=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_used = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='reserved')
    
    # Nouveaux champs pour remplacer Reservation
    reserved_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    reservation = models.ForeignKey(
    'Reservation', 
    on_delete=models.SET_NULL, 
    null=True, 
    blank=True,
    related_name='ticket_reservations'
    )
    
    # Champs promotionnels
    promo_code = models.ForeignKey(PromoCode, null=True, blank=True, on_delete=models.SET_NULL, related_name='tickets')
    bonus_reward = models.ForeignKey(BonusReward, null=True, blank=True, on_delete=models.SET_NULL, related_name='tickets')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['session', 'seat', 'row', 'col'], name='unique_ticket_per_seat_position_session')
        ]

    def __str__(self):
        return f"Ticket {self.ticket_code} — {self.session.movie.title}"

    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    def mark_used(self):
        if not self.is_used:
            self.is_used = True
            self.status = 'used'
            self.save()

    def validate_and_mark(self):
        if self.is_used:
            return False, "Ticket déjà utilisé"
        if self.is_expired():
            return False, "Ticket expiré"
        self.mark_used()
        return True, "Ticket validé"

    def final_price(self):
        if self.promo_code and self.promo_code.is_valid():
            return self.promo_code.apply_discount(self.price)
        return self.price

    def assign_bonus(self):
        if not self.bonus_reward:
            bonus = BonusReward.objects.filter(
                is_active=True
            ).filter(
                models.Q(seat_type='ALL') | models.Q(seat_type=self.seat.seat_type)
            ).first()
            if bonus:
                self.bonus_reward = bonus
                self.save()

    def save(self, *args, **kwargs):
        # Définir la date d'expiration si le statut est 'reserved'
        if self.status == 'reserved' and not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        
        # Appliquer la promotion si un code promo est valide
        if self.promo_code and self.promo_code.is_valid():
            self.price = self.promo_code.apply_discount(self.price)
            self.promo_code.mark_used()
        
        super().save(*args, **kwargs)
        self.assign_bonus()
        
    def is_expired(self):
        if self.status != 'reserved':
            return False
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    def expire_if_needed(self):
        if self.is_expired() and self.status == 'reserved':
            self.status = 'expired'
            self.save()
    
    # Ajoutez cette méthode pour nettoyer les réservations expirées
    @classmethod
    def cleanup_expired_reservations(cls):
        expired_tickets = cls.objects.filter(
            status='reserved',
            expires_at__lt=timezone.now()
        )
        for ticket in expired_tickets:
            ticket.status = 'expired'
            ticket.save()

class Comment(models.Model):
    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, null=True, blank=True)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    reply_to = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='thread_replies')
    likes = models.ManyToManyField(Customer, related_name='liked_comments', blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if self.reply_to:
            if self.reply_to.parent_comment:
                self.parent_comment = self.reply_to.parent_comment
            else:
                self.parent_comment = self.reply_to
        super().save(*args, **kwargs)

class MovieLike(models.Model):
    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'movie']

class SavedItem(models.Model):
    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    content_type = models.CharField(max_length=10, choices=[('event', 'Event'), ('movie', 'Movie')])
    content_id = models.PositiveIntegerField()
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'content_type', 'content_id']
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.email} saved {self.content_type} #{self.content_id}"


class RestaurantItemCategory(models.Model):
    category_name = models.CharField(max_length=50, unique=True)
    # description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'cinema_restaurantitem_category'
        ordering = ['category_name']
    
    def __str__(self):
        return self.name

class RestaurantManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(created_by__is_deleted=False)
class RestaurantItem(models.Model):
    CATEGORY_CHOICES = [
        ('POPCORN', 'Popcorn'),
        ('DRINKS', 'Boissons'),
        ('CANDIES', 'Bonbons'),
        ('SNACKS', 'Snacks'),
        ('COMBO', 'Menus combo'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    # category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    category = models.ForeignKey(
        'RestaurantItemCategory', 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='snack_items'
    )
    
    price = models.DecimalField(max_digits=9, decimal_places=2)
    image = models.ImageField(upload_to='restaurant_items/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    stock = models.IntegerField(default=0)
    created_by = models.ForeignKey(
        'accounts.Admin', 
        default=1, 
        on_delete=models.CASCADE, 
        related_name='snack_items'
    )

    objects = RestaurantManager()
    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()}) - {self.price}MGA"

    def get_category_name(self):
        """Retourne le nom de la catégorie"""
        if self.category:
            return RestaurantItemCategory.objects.get(id=self.category.id).category_name
        return "Uncategorized"

    def reduce_stock(self, quantity):
        """Réduire le stock après achat"""
        if self.stock >= quantity:
            self.stock -= quantity
            if self.stock == 0:
                self.is_available = False
            self.save()
            return True
        return False

    def addition_stock(self, quantity):
        """Ajouter au stock"""
        self.stock += quantity
        self.is_available = True
        self.save()
        return True     
            


class historiqueStock(models.Model):
    item = models.ForeignKey(RestaurantItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    is_addition = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class FoodOrder(models.Model):
    ORDER_STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('PREPARING', 'En préparation'),
        ('READY', 'Prêt'),
        ('DELIVERED', 'Livré'),
        ('CANCELLED', 'Annulé'),
    ]
    
    customer = models.ForeignKey(
        'accounts.Customer', 
        on_delete=models.CASCADE, 
        related_name='food_orders'
    )
    session = models.ForeignKey(
        'MovieSession', 
        on_delete=models.CASCADE, 
        related_name='food_orders',
        null=True,
        blank=True
    )
    items = models.ManyToManyField(
        'RestaurantItem', 
        through='FoodOrderItem',
        related_name='orders'
    )
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='PENDING')
    pickup_time = models.DateTimeField(null=True, blank=True)
    special_instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} - {self.total_amount}MGA - {self.get_status_display()}"

class FoodOrderItem(models.Model):
    order = models.ForeignKey('FoodOrder', on_delete=models.CASCADE)
    item = models.ForeignKey('RestaurantItem', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=9, decimal_places=2)

    class Meta:
        unique_together = ['order', 'item']

    def __str__(self):
        return f"{self.quantity}x {self.item.name} - {self.order}"
    
    @property
    def subtotal(self):
        return self.price_at_time * self.quantity
    
class Reservation(models.Model):
    RESERVATION_STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('CONFIRMED', 'Confirmée'),
        ('CANCELLED', 'Annulée'),
        ('COMPLETED', 'Terminée'),
    ]
    
    reservation_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    customer = models.ForeignKey(
        'accounts.Customer',
        on_delete=models.CASCADE, 
        related_name='reservations'
    )
    session = models.ForeignKey(
        'MovieSession', 
        on_delete=models.CASCADE, 
        related_name='reservations'
    )
    tickets = models.ManyToManyField('Ticket', related_name='reservations')
    food_orders = models.ManyToManyField('FoodOrder', related_name='reservations')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=RESERVATION_STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Reservation {self.reservation_code} - {self.total_amount}MGA"

    def calculate_total(self):
        """Calculer le total de la réservation"""
        ticket_total = sum(ticket.final_price() for ticket in self.tickets.all())
        food_total = sum(order.total_amount for order in self.food_orders.all())
        return ticket_total + food_total

    def save(self, *args, **kwargs):
        if not self.total_amount:
            self.total_amount = self.calculate_total()
        super().save(*args, **kwargs)

    def get_seats_display(self):
        """Retourne la liste des sièges formatés (ex: A1, A2, B3)"""
        seats_display = []
        for ticket in self.tickets.all():
            try:
                # Convertir le numéro de ligne en lettre (0 -> A, 1 -> B, etc.)
                row_letter = chr(65 + int(ticket.row))  # 65 = 'A' en ASCII
                seat_number = f"{row_letter}{int(ticket.col) + 1}"
                seats_display.append(seat_number)
            except (ValueError, TypeError):
                # En cas d'erreur de conversion, utiliser les valeurs brutes
                seats_display.append(f"R{ticket.row}C{ticket.col}")
        return sorted(seats_display) 
    

class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('CARD', 'Carte bancaire'),
        ('PAYPAL', 'PayPal'),
        ('APPLE_PAY', 'Apple Pay'),
        ('GOOGLE_PAY', 'Google Pay'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('COMPLETED', 'Complété'),
        ('FAILED', 'Échoué'),
        ('REFUNDED', 'Remboursé'),
    ]
    
    customer = models.ForeignKey(
        'accounts.Customer', 
        on_delete=models.CASCADE, 
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Référence à la réservation (optionnel)
    reservation = models.ForeignKey(
        'Reservation', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='payments'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} - {self.amount}MGA - {self.get_status_display()}"