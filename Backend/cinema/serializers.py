from rest_framework import serializers
from accounts.models import Customer
from api.models import EventRating, Event
from .models import (
    Movie,
    Cinema,
    CinemaHall,
    RestaurantItemCategory,
    Seat,
    MovieSession,
    Ticket,
    Comment,
    MovieLike,
    SavedItem,
    RestaurantItem,
    FoodOrder,
    FoodOrderItem,
    Payment,
    Reservation,
)
from rest_framework import serializers
from django.utils import timezone


class CinemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cinema
        # List all fields except 'organizer' since we assign it automatically
        fields = ["id", "name", "address", "city", "phone", "email", "opening_hours"]

    def create(self, validated_data):
        organizer = self.context["request"].user
        return Cinema.objects.create(organizer=organizer, **validated_data)


class SeatsSerializeer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = "__all__"


class CInemaHallSerializer(serializers.ModelSerializer):
    class Meta:
        model = CinemaHall
        fields = "__all__"


class CinemaHallWithSerializer(serializers.ModelSerializer):
    seats = SeatsSerializeer(many=True, read_only=True)

    class Meta:
        model = CinemaHall
        fields = ["id", "name", "screen_type", "base_price", "seats"]


class CinemaWithHallsSerializers(serializers.ModelSerializer):
    halls = CinemaHallWithSerializer(many=True, read_only=True)

    class Meta:
        model = Cinema
        fields = ["id", "name", "city", "halls", "address", "opening_hours"]

        def get_duration_formatted(self, obj):
            hours = obj.duration // 60
            minutes = obj.duration % 60
            return f"{hours}h {minutes}min"


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = "__all__"
        read_only_fields = ["created_by"]
        extra_kwargs = {
            "default_image": {"required": False},
            "trailer_url": {"required": False},
            "title": {"required": True},
            "description": {"required": True},
            "duration": {"required": True},
            "release_date": {"required": True},
            "genre": {"required": True},
            "director": {"required": True},
            "cast": {"required": True},
            "poster": {"required": True},
        }


class MovieSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieSession
        fields = "__all__"


class MovieWithSessionSerializer(serializers.ModelSerializer):
    sessions = MovieSessionSerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "description",
            "genre",
            "duration",
            "release_date",
            "director",
            "poster",
            "cast",
            "trailer_url",
            "rating",
            "is_active",
            "sessions",
            "default_image",
        ]



# mobile Serializers



class MovieMobileSerializer(serializers.ModelSerializer):
    next_session = serializers.SerializerMethodField()
    session_count = serializers.SerializerMethodField()
    earliest_session = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    popularity_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'description', 'duration', 'duration_formatted',
            'release_date', 'genre', 'director', 'cast', 'poster', 
            'trailer_url', 'rating', 'is_active',
            'next_session', 'session_count', 'earliest_session', 'popularity_score'
        ]
        # SUPPRIMER 'rating_value' de la liste des champs

    def get_next_session(self, obj):
        now = timezone.now()
        next_session = obj.sessions.filter(
            start_time__gte=now
        ).order_by('start_time').first()
        
        if next_session:
            return MovieSessionMobileSerializer(next_session).data
        return None

    def get_session_count(self, obj):
        return obj.sessions.count()

    def get_earliest_session(self, obj):
        now = timezone.now()
        earliest = obj.sessions.filter(
            start_time__gte=now
        ).order_by('start_time').first()
        
        return earliest.start_time.isoformat() if earliest else None

    def get_duration_formatted(self, obj):
        hours = obj.duration // 60
        minutes = obj.duration % 60
        return f"{hours}h {minutes}min"

    def get_popularity_score(self, obj):
        # Score de popularité basé sur le nombre de sessions
        return obj.sessions.count()

class MovieSessionMobileSerializer(serializers.ModelSerializer):
    hall = CinemaHallWithSerializer(read_only=True)
    cinema_name = serializers.SerializerMethodField()
    cinema_city = serializers.SerializerMethodField()
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    
    class Meta:
        model = MovieSession
        fields = '__all__'
    
    def get_cinema_name(self, obj):
        return obj.hall.cinema.name if obj.hall and obj.hall.cinema else None
    
    def get_cinema_city(self, obj):
        return obj.hall.cinema.city if obj.hall and obj.hall.cinema else None
    

class TicketSerializer(serializers.ModelSerializer):
    session_info = serializers.SerializerMethodField()
    seat_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Ticket
        fields = ['id', 'ticket_code', 'session', 'session_info', 'seat', 'seat_info', 
                 'row', 'col', 'reserved_at', 'expires_at', 'status', 'price']
    
    def get_session_info(self, obj):
        return {
            'movie_title': obj.session.movie.title,
            'start_time': obj.session.start_time,
            'hall_name': obj.session.hall.name
        }
    
    def get_seat_info(self, obj):
        return {
            'row': obj.seat.rows,
            'col': obj.seat.cols,
            'seat_type': obj.seat.seat_type
        }
    

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'email']

class CommentSerializer(serializers.ModelSerializer):
    user = CustomerSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at', 'reply_to', 'parent_comment', 'replies', 'likes_count', 'user_liked']
    
    def get_replies(self, obj):
        # Get direct replies only (not nested)
        replies = Comment.objects.filter(parent_comment=obj).order_by('created_at')
        return CommentSerializer(replies, many=True).data
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

class EventFeedSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    average_rating = serializers.FloatField()
    user_liked = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    id = serializers.IntegerField()
    location_name = serializers.SerializerMethodField()
    user_saved = serializers.SerializerMethodField()  # This field is declared
    
    class Meta:
        model = Event
        fields = [
            'id', 'name', 'date', 'venue', 'description', 'image',
            'likes_count', 'comments_count', 'average_rating',
            'user_liked', 'user_rating', 'type', 'user_saved','location_name'
        ]
    
    def get_location_name(self, obj):
        location = obj.eventlocation_set.first()
        return location.location_name if location else None
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return Comment.objects.filter(event=obj).count()
    
    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = EventRating.objects.get(event=obj, customer=request.user)
                return rating.rating
            except EventRating.DoesNotExist:
                return None
        return None
    
    def get_type(self, obj):
        return 'event'
    
    def get_user_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedItem.objects.filter(
                user=request.user,
                content_type='event' if isinstance(obj, Event) else 'movie',
                content_id=obj.id
            ).exists()
        return False

# Dans serializers.py, modifiez MovieFeedSerializer
class MovieFeedSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    user_saved = serializers.SerializerMethodField()  
    type = serializers.SerializerMethodField()
    id = serializers.IntegerField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'release_date', 'description', 'genre',
            'director', 'poster', 'trailer_url', 'duration',
            'likes_count', 'comments_count', 'average_rating',
            'user_liked', 'user_rating', 'user_saved', 'type'  
        ]
    
    def get_likes_count(self, obj):
        return MovieLike.objects.filter(movie=obj).count()
    
    def get_comments_count(self, obj):
        return Comment.objects.filter(movie=obj).count()
    
    def get_average_rating(self, obj):
        # Pour les films, vous pouvez implémenter un système de rating similaire
        return 4.0  # Valeur par défaut, à adapter
    
    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return MovieLike.objects.filter(movie=obj, user=request.user).exists()
        return False
    
    def get_user_rating(self, obj):
        # Implémentez selon votre système de rating pour films
        return None
    
    def get_user_saved(self, obj):  
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedItem.objects.filter(
                user=request.user,
                content_type='movie',
                content_id=obj.id
            ).exists()
        return False
    
    def get_type(self, obj):
        return 'movie'

class FeedItemSerializer(serializers.Serializer):
    type = serializers.CharField()
    data = serializers.DictField()

class RestaurantItemCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantItemCategory
        fields = ['id', 'category_name']

# Dans serializers.py
class RestaurantItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantItem
        fields = '__all__'

class FoodOrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_category = serializers.CharField(source='item.category', read_only=True)
    item_id = serializers.IntegerField(source='item.id', read_only=True)  # Ajouter ce champ
    
    class Meta:
        model = FoodOrderItem
        fields = ['id', 'item', 'item_id', 'item_name', 'item_category', 'quantity', 'price_at_time', 'subtotal']

class FoodOrderSerializer(serializers.ModelSerializer):
    # Utiliser le related_name correct
    items = FoodOrderItemSerializer(many=True, read_only=True, source='order_items')
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    
    class Meta:
        model = FoodOrder
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class ReservationSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)
    food_orders = FoodOrderSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    movie_title = serializers.CharField(source='session.movie.title', read_only=True)
    session_time = serializers.DateTimeField(source='session.start_time', read_only=True)
    seats_display = serializers.SerializerMethodField()  # Nouveau champ
    ticket_code = serializers.SerializerMethodField()    # Code de la réservation
    
    class Meta:
        model = Reservation
        fields = '__all__'
    
    def get_seats_display(self, obj):
        """Retourne les sièges formatés (A1, A2, etc.)"""
        return obj.get_seats_display()
    
    def get_ticket_code(self, obj):
        """Retourne le code de réservation comme numéro de ticket"""
        return str(obj.reservation_code)

class FoodOrderDetailSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = FoodOrder
        fields = ['id', 'total_amount', 'status', 'items']
    
    def get_items(self, obj):
        items_data = []
        for order_item in obj.order_items.all():
            items_data.append({
                'name': order_item.item.name,
                'quantity': order_item.quantity,
                'price_at_time': float(order_item.price_at_time),
                'subtotal': float(order_item.subtotal)
            })
        return items_data

# serializers.py - Améliorer les serializers

class CalendarEventSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    type = serializers.CharField(default='event')
    date = serializers.DateTimeField(format='iso-8601')  # FORMAT EXPLICITE
    
    class Meta:
        model = Event
        fields = ['id', 'name', 'date', 'venue', 'image_url', 'type', 'description']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

class CalendarMovieSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='title')
    image_url = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    venue = serializers.SerializerMethodField()
    type = serializers.CharField(default='movie')
    session_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = ['id', 'name', 'date', 'venue', 'image_url', 'type', 'description', 'session_id']
    
    def get_image_url(self, obj):
        if obj.poster:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.poster.url) if request else obj.poster.url
        elif obj.default_image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.default_image.url) if request else obj.default_image.url
        return None
    
    def get_date(self, obj):
        # Retourne la date de la prochaine session ou la date de sortie
        next_session = obj.sessions.filter(
            start_time__gte=timezone.now()
        ).order_by('start_time').first()
        
        if next_session:
            return next_session.start_time
        return obj.release_date
    
    def get_venue(self, obj):
        next_session = obj.sessions.filter(
            start_time__gte=timezone.now()
        ).order_by('start_time').first()
        return next_session.hall.cinema.name if next_session else None
    
    def get_session_id(self, obj):
        next_session = obj.sessions.filter(
            start_time__gte=timezone.now()
        ).order_by('start_time').first()
        return next_session.id if next_session else None