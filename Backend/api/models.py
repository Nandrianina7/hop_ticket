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




class Event(models.Model):
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
    organizer = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='event', default=1)
    def update_rating(self, new_rating):
        """Met à jour la note moyenne de l'événement"""
        total_score = self.average_rating * self.total_ratings
        self.total_ratings += 1
        self.average_rating = (total_score + new_rating) / self.total_ratings
        self.save()
    class Meta:
        ordering = ['-date']

    def update_availability(self):
        self.tickets_sold = self.tickets.count()
        self.save()

    def __str__(self):
        return f"{self.name} on {self.date.strftime('%Y-%m-%d')}"

    def get_calendar_data(self):
        """Retourne les données pour le calendrier"""
        return {
            'id': self.id,
            'name': self.name,
            'date': self.date,
            'venue': self.venue,
            'image_url': self.image.url if self.image else None,
            'type': 'event',
            'description': self.description,
        }

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
    # TICKET_TYPES = [
    #     ('VIP', 'VIP'),
    #     ('BRONZE', 'Bronze'),
    #     ('ARGENT', 'Argent'),
    #     ('PUBLIC', 'Public'),
    # ]
    
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