import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings
from accounts.models import Admin, Customer

User = settings.AUTH_USER_MODEL

class EventSite(models.Model):
    site_name = models.CharField(max_length=100)
    organizer = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='eventSite')
    class Meta:
        db_table = 'eventSite'

    def __str__(self):
        return f"{self.site_name} by {self.organizer.email}"

class FCMToken(models.Model):
    user = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="fcm_tokens")
    fcmtoken = models.TextField(unique=True)
    device_type = models.CharField(max_length=20, blank=True, null=True)  # android / ios
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_fcmToken'
    def __str__(self):
        return f"{self.user.username} - {self.token[:20]}"

class EventSiteLocations(models.Model):
    site = models.ForeignKey(EventSite, on_delete=models.CASCADE, related_name='eventSite_locations')
    location_name = models.CharField(max_length=100)
    longitude = models.FloatField()
    latitude = models.FloatField()
    class Meta:
        db_table = 'eventSite_locations'
    def __str__(self):
        return f"{self.location_name} at {self.site.site_name}"

class EventPlan(models.Model):
    # elements = models.JSONField() 
    metadata = models.JSONField(default=dict) 
    created_at = models.DateTimeField(auto_now_add=True)
    site = models.ForeignKey(EventSite, on_delete=models.CASCADE, related_name='eventPlan')
    class Meta:
        db_table = 'eventPlan'
    def __str__(self):
        return f"Event   Plan {self.id} by {self.site.organizer.email}"



from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class EventManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(organizer__is_deleted=False)

class Event(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    name = models.CharField(max_length=100)
    date = models.DateTimeField()
    venue = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    tickets_sold = models.PositiveIntegerField(default=0)
    image = models.ImageField(
        upload_to='event_image', 
        null=True, 
        blank=True, 
        help_text='Upload event image'
    )
    likes = models.ManyToManyField(
        Customer,
        related_name='liked_events',
        blank=True
    )
    average_rating = models.FloatField(default=0.0)
    total_ratings = models.PositiveIntegerField(default=0)
    organizer = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='event')

    base_ticket_price = models.FloatField(default=10.0)

    owner_percentage = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Percentage of ticket price that goes to the app owner (min 1%)."
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Event approval status"
    )
    objects = EventManager()

    class Meta:
        ordering = ['-date']

    def save(self, *args, **kwargs):
     # Ensure minimum 1% if entered
        if self.owner_percentage != 0 and self.owner_percentage < 1:
            self.owner_percentage = 1

    # Approval logic
        if self.owner_percentage == 0:
            self.status = 'pending'
        else:
            self.status = 'approved'

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} on {self.date.strftime('%Y-%m-%d')}"

class EventLocation(models.Model):
    # customer= models.ForeignKey(Customer, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    location_name = models.CharField(max_length=100)
    longitude = models.FloatField()
    latitude = models.FloatField()
    # created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'event_locations'
        unique_together = ('event', 'location_name')

class EventRating(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ratings')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='event_ratings')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 étoiles
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('event', 'customer') 

class PriceTier(models.Model):
    TICKET_TYPES = [
        ('VIP', 'VIP'),
        ('BRONZE', 'Bronze'),
        ('ARGENT', 'Argent'),
        ('PUBLIC', 'Public'),
    ]
    
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='price_tiers'
    )
    tier_type = models.CharField(
        max_length=10,
        # choices=TICKET_TYPES
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    available_quantity = models.PositiveIntegerField()

    class Meta:
        unique_together = ('event', 'tier_type')
        ordering = ['-price']
    @property
    def owner_earnings(self):
        return float(self.price) * (self.event.owner_percentage / 100)
    @property
    def organizer_earning(self):
        return float(self.price) - self.owner_earnings
    @property
    def final_price(self):
        return float(self.price)
    
    def __str__(self):
        return f"{self.tier_type} - ${self.price} ({self.event.name})"
class Ticket(models.Model):
    ticket_code = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    ticket_number = models.PositiveIntegerField()
    purchase_date = models.DateTimeField(auto_now_add=True)
    admin = models.ForeignKey(
            Admin,                        
            on_delete=models.CASCADE,
            related_name='admin_tickets',
            null=True,                     
            blank=True                     
        )
    customer = models.ForeignKey(
    Customer,
    on_delete=models.CASCADE,
    related_name='tickets',
    null=True,
    blank=True
)
    seat_id = models.CharField(max_length=50, null=False, default='')

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='tickets'
    )
    is_used = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    owner_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    organizer_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    price_tier = models.ForeignKey(
        PriceTier,
        on_delete=models.CASCADE,
        related_name="tickets",
        null=True
    )
    def is_expired(self):
        return timezone.now() > self.event.date

    def mark_used(self):
        self.is_used = True
        self.save()

    def __str__(self):
        return f"Ticket {self.ticket_code} for {self.event.name}"
    def validate_ticket(self):
        """
        Valide le ticket et le marque comme utilisé si possible
        Retourne un tuple (success, message)
        """
        if self.is_used:
            return False, "Ticket déjà utilisé"
        
        if self.is_expired():
            return False, "Ticket expiré"
        
        self.mark_used()
        return True, "Ticket validé avec succès"


class Payment(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    ticket = models.OneToOneField(
        Ticket,
        on_delete=models.CASCADE,
        related_name='payment'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[('success', 'Success'), ('failed', 'Failed')],
        default='success'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id}: {self.status} - {self.amount}"  

class VenuePlanManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(organizer__is_deleted=False)
    
class VenuePlan(models.Model):
    organizer = models.ForeignKey(
        Admin,
        on_delete=models.CASCADE,
        related_name="venue_plans"
    )

    site_name = models.CharField(max_length=100, unique=True)
    elements = models.JSONField() 
    metadata = models.JSONField(default=dict) 
    created_at = models.DateTimeField(auto_now_add=True)
    objects = VenuePlanManager()
    def __str__(self):
        return f"Venue Plan {self.id} by {self.organizer.email}"
    
class ViewEventLocation(models.Model):
    # columns from api_event (ae.*)
    id = models.AutoField(primary_key=True)                 # assumes api_event.id is int
    name = models.CharField(max_length=255)
    date = models.DateTimeField()                           # use DateField if your column is DATE
    description = models.TextField(null=True, blank=True)
    venue = models.CharField(max_length=255)
    tickets_sold = models.IntegerField(null=True, blank=True)
    image = models.ImageField(
        upload_to='event_image',
        null=True,
        blank=True,
        help_text='Upload event image'
    )
    organizer_id = models.IntegerField(null=True, blank=True)
    # columns added by the view
    # site_name = models.CharField(max_length=255)
    location_name = models.CharField(max_length=255)
    longitude = models.FloatField()
    latitude = models.FloatField()

    class Meta:
        managed = False                      # view is created via SQL, not by Django
        db_table ='view_future_event_locations'
        verbose_name = 'Event Location (view)'
        verbose_name_plural = 'Event Locations (view)'
        ordering = ['-date']

class FoodManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(created_by__is_deleted=False)
class FoodItem(models.Model):
    CATEGORY_CHOICES = [
        ('POPCORN', 'Popcorn'),
        ('DRINKS', 'Boissons'),
        ('CANDIES', 'Bonbons'),
        ('SNACKS', 'Snacks'),
        ('COMBO', 'Menus combo'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default=None)    
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
        related_name='food_items'
    )
    objects = FoodManager()
    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()}) - {self.price}MGA"

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
            