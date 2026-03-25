
from rest_framework import serializers

# from Backend.api.view_models import ViewEventLocation
from . import models
from accounts.models import Customer
from django.urls import reverse
import hashlib


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PriceTier
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    event_date = serializers.SerializerMethodField()
    ticket_number = serializers.SerializerMethodField()
    event_detail_url = serializers.SerializerMethodField()
    qr_data = serializers.SerializerMethodField()
    seat_id = serializers.SerializerMethodField()
    event_id = serializers.SerializerMethodField()
    event_name = serializers.SerializerMethodField()
    event_image = serializers.SerializerMethodField()
    event_venue = serializers.SerializerMethodField() 
    is_used = serializers.BooleanField(read_only=True)

    class Meta:
        model = models.Ticket
        fields = [
            'id',
            'title',
            'event_date',
            'ticket_number',
            'event_detail_url',
            'qr_data',
            'event_id',
            'event_name',
            'event_image',
            'event_venue',
            'is_used',
            'seat_id',
        ]

    def get_seat_id(self, obj):
        return obj.seat_id

    def get_title(self, obj):
        # titre lisible (priorité : event.name puis ticket-specific title)
        event = getattr(obj, 'event', None)
        return getattr(event, 'name', None) or getattr(obj, 'title', None) or f"Ticket {obj.id}"

    def get_event_date(self, obj):
        event = getattr(obj, 'event', None)
        dt = getattr(event, 'date', None)
        if dt:
            # renvoie ISO pour que le front puisse formater (ou adapte au format voulu)
            try:
                return dt.isoformat()
            except Exception:
                return str(dt)
        return None

    def get_ticket_number(self, obj):
        # utilise ticket_number si renseigné sinon ID
        return obj.ticket_number if getattr(obj, 'ticket_number', None) is not None else obj.id

    def get_event_detail_url(self, obj):
        request = self.context.get('request')
        event = getattr(obj, 'event', None)
        if not event:
            return None
        try:
            # adapte le nom de la route 'event-detail' si besoin
            path = reverse('event-detail', args=[event.id])
            return request.build_absolute_uri(path) if request else path
        except Exception:
            return None

    def get_qr_data(self, obj):
        # adapte selon ton modèle (ticket_code, uuid, etc.)
        return str(getattr(obj, 'ticket_code', getattr(obj, 'id', '')))

    # --- nouveaux getters ---
    def get_event_id(self, obj):
        event = getattr(obj, 'event', None)
        return event.id if event else None

    def get_event_name(self, obj):
        event = getattr(obj, 'event', None)
        return getattr(event, 'name', None) if event else None

    def get_event_image(self, obj):
        request = self.context.get('request', None)
        event = getattr(obj, 'event', None)
        if event and getattr(event, 'image', None):
            try:
                url = event.image.url
                return request.build_absolute_uri(url) if request else url
            except Exception:
                return None
        return None

    def get_event_venue(self, obj):
        """
        Retourne le lieu de l'événement. On essaie plusieurs attributs possibles
        (venue, location, place, address, lieu) pour être tolérant.
        """
        event = getattr(obj, 'event', None)
        # if not event:
        #     return None

        # for attr in ('venue', 'location', 'place', 'address', 'lieu'):
        #     val = getattr(event, attr, None)
        #     if val:
        #         return val
        if event :
            return event.eventlocation_set.first().location_name

        # si l'événement a un champ 'details' ou 'meta' contenant l'adresse, adapte ici
        return None

class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PriceTier
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    price_tiers = PriceSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    location_name = serializers.SerializerMethodField()
    class Meta:
        model = models.Event
        fields = [
            'id', 'name', 'date', 'venue', 'description', 'tickets_sold', 'image',
            'price_tiers', 'image_url', 'location_name', 'owner_percentage', 'status', 'organizer'
        ]

    def get_location_name(self, obj):
        location = obj.eventlocation_set.first()
        return location.location_name if location else None

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    def get_event_description(self, obj):
        if obj.event:
            return obj.event.description
        return ''
class Event_Serializer(serializers.ModelSerializer):
    price_tiers = PriceSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    location_name = serializers.SerializerMethodField()
    
    class Meta:
        model = models.Event
        fields = [
            'id', 'name', 'date', 'venue', 'description', 'tickets_sold', 'image',
            'price_tiers', 'image_url', 'average_rating', 'total_ratings', 
            'is_liked','location_name', 'owner_percentage', 'status'
        ]
    
    def get_location_name(self, obj):
        location = obj.eventlocation_set.first()
        return location.location_name if location else None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

# Ajoutez aussi un sérialiseur pour les ratings
class EventRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.EventRating
        fields = ['event', 'rating', 'created_at']


class TicketWebSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    event_date = serializers.SerializerMethodField()
    ticket_number = serializers.SerializerMethodField()
    seat_id= serializers.SerializerMethodField()    
    event_detail_url = serializers.SerializerMethodField()
    qr_data = serializers.SerializerMethodField()
    customer = CustomerSerializer(read_only=True)
    event_description = serializers.SerializerMethodField()
    event = EventSerializer(read_only=True)

    def get_seat_id(self, obj):
        return obj.seat_id
    class Meta:
        model = models.Ticket
        fields = '__all__'

    def get_title(self, obj):
        return obj.event.name if obj.event else ''

    def get_event_date(self, obj):
        if obj.event and obj.event.date:
            return obj.event.date.strftime('%Y-%m-%d %H:%M')
        return ''

    def get_ticket_number(self, obj):
        return str(obj.ticket_code)

    def get_event_detail_url(self, obj):
        request = self.context.get('request')
        if obj.event:
            return request.build_absolute_uri(reverse('api-event-detail', kwargs={'pk': obj.event.id})) if request else ''
        return ''

    def get_qr_data(self, obj):
        data = f"{obj.id}:{obj.ticket_code}:{obj.event.id}"
        hashed = hashlib.sha256(data.encode()).hexdigest()
        return hashed
    def get_customer_info(self, obj):
        if obj.customer:
            return {
                'id': obj.customer.id,
                'name': obj.customer.name,
                'email': obj.customer.email
            }
        return None
    def get_event_description(self, obj):
        if obj.event:
            return obj.event.description
        return ''


class EventSiteLocationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.EventSiteLocations
        fields = ["id", "site", "location_name", "longitude", "latitude"]
        read_only_fields = ["id"]

class ViewEventLocationSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = models.ViewEventLocation
        fields = [
            "id", "name", "date", "description", "venue", "tickets_sold",
            "image", "organizer_id","location_name",
            "longitude", "latitude", "image_url"
        ]
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class VenuePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.VenuePlan
        fields = ["id", "organizer", "elements", "metadata", "created_at", "site_name"]
        read_only_fields = ["id", "created_at"]

class FCMTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.FCMToken
        fields = ["id", "user", "fcmtoken", "device_type"]

class EVentLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.EventLocation
        fields = ["id", "event", "location_name", "longitude", "latitude"]
        read_only_fields = ["id"]
class EventSiteSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.full_name', read_only=True)
    class Meta:
        model = models.EventSite
        fields = ["id","site_name","organizer", "organizer_name"]
        read_only_fields = ["id"]

class EventPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.EventPlan
        fields = ["id","metadata","created_at","site"]
        read_only_fields = ["id","created_at"]

class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.PriceTier
        fields = '__all__'


class VenuePlanListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour la liste des plans de salle"""
    organizer_email = serializers.SerializerMethodField()
    element_count = serializers.SerializerMethodField()
    
    class Meta:
        model = models.VenuePlan
        fields = [
            'id', 
            'site_name', 
            'organizer_email',
            'element_count',
            'metadata',
            'created_at'
        ]
    
    def get_organizer_email(self, obj):
        return obj.organizer.email if obj.organizer else None
    
    def get_element_count(self, obj):
        return len(obj.elements) if obj.elements else 0



class FoodItemCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.FoodItem
        fields = [
            "id",
            "name",
            "description",
            "category",
            "price",
            "image",
            "stock",
            "is_available",
            "created_by",
        ]
        read_only_fields = ["id", "is_available"]

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["is_available"] = validated_data.get("stock", 0) > 0
        validated_data["created_by"] = request.user
        return super().create(validated_data)


class CommissionSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source='event.name')
    tier = serializers.CharField(source='price_tier.tier_type', default=None, read_only=True)
    event_id = serializers.IntegerField(source='event.id', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    customer_id = serializers.IntegerField(source='customer.id', read_only=True)
    class Meta:
        model = models.Ticket
        fields = [
            'id',
            'event_name',
            'tier',
            'price',
            'owner_earnings',
            'organizer_earnings',
            'purchase_date',
            'customer_email',
            'customer_name',
            'customer_id',
            'event_id'
        ]
