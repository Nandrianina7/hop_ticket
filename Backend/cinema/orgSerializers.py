from rest_framework import serializers
from .models import (
    Cinema,
    CinemaHall,
    Seat,
    Movie,
    MovieSession,
    RestaurantItem,
    Ticket,
    PromoCode, 
    PromoUsage,
    historiqueStock
)
from django.utils import timezone
class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = [
            "id",
            "rows",
            "cols",
            "seat_type",
            "price_multiplier",
            "totalSeats",
            "disabledSeats",
            "VIPSeats",
        ]


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "description",
            "duration",
            "release_date",
            "genre",
            "director",
            "cast",
            "poster",
            "trailer_url",
            "rating",
            "is_active",
            "default_image",
        ]


class MovieSessionSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)

    class Meta:
        model = MovieSession
        fields = ["id", "start_time", "end_time", "base_price", "movie"]


class CinemaHallSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    sessions = MovieSessionSerializer(many=True, read_only=True)

    class Meta:
        model = CinemaHall
        fields = ["id", "name", "screen_type", "base_price", "seats", "sessions"]


class CinemaSerializer(serializers.ModelSerializer):
    halls = CinemaHallSerializer(many=True, read_only=True)

    class Meta:
        model = Cinema
        fields = [
            "id",
            "name",
            "address",
            "city",
            "phone",
            "email",
            "opening_hours",
            "is_active",
            "halls",
        ]


class OrganizerSerializer(serializers.ModelSerializer):
    cinemas = CinemaSerializer(many=True, read_only=True)

    class Meta:
        model = Cinema.organizer.field.related_model
        fields = ["id", "username", "email", "cinemas"]


# from rest_framework import serializers
# from .models import Cinema, CinemaHall, Seat, Movie, MovieSession


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = [
            "id",
            "rows",
            "cols",
            "seat_type",
            "price_multiplier",
            "totalSeats",
            "disabledSeats",
            "VIPSeats",
        ]


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "description",
            "duration",
            "release_date",
            "genre",
            "director",
            "cast",
            "poster",
            "trailer_url",
            "rating",
            "is_active",
            "default_image",
        ]


class MovieSessionSerializer(serializers.ModelSerializer):
    movie = MovieSerializer(read_only=True)

    class Meta:
        model = MovieSession
        fields = ["id", "start_time", "end_time", "base_price", "movie"]


class CinemaHallSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    sessions = MovieSessionSerializer(many=True, read_only=True)

    class Meta:
        model = CinemaHall
        fields = ["id", "name", "screen_type", "base_price", "seats", "sessions"]


class CinemaSerializer(serializers.ModelSerializer):
    halls = CinemaHallSerializer(many=True, read_only=True)

    class Meta:
        model = Cinema
        fields = [
            "id",
            "name",
            "address",
            "city",
            "phone",
            "email",
            "opening_hours",
            "is_active",
            "halls",
        ]


class SnackItemCreateSerializer(serializers.ModelSerializer):
    category_choice = serializers.CharField(
        source="get_category_display", read_only=True
    )

    class Meta:
        model = RestaurantItem
        fields = [
            "name",
            "description",
            "category",
            "price",
            "image",
            "category_choice",
            "stock",
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value
    

class historiqueStockSerializer(serializers.ModelSerializer):
    # category_choice = serializers.CharField(
    #     source="get_category_display", read_only=True
    # )

    class Meta:
        model = historiqueStock
        fields = [
            "item",
            "quantity",
            "is_addition",
        ]

    # def validate_price(self, value):
    #     if value < 0:
    #         raise serializers.ValidationError("Price cannot be negative.")
    #     return value


class SnackItemListSerializer(serializers.ModelSerializer):
    # category_choice = serializers.CharField(source="item.category", read_only=True)
    # category_name = serializers.CharField(source="item.get_category_name")
     category = serializers.PrimaryKeyRelatedField(read_only=True)
    # human-readable name from FK
     category_name = serializers.CharField(source="category.category_name", read_only=True)
     class Meta:
        model = RestaurantItem
        fields = [
            "id",
            "name",
            "category",
            "category_name",
            "price",
            "image",
            "description",
            "stock",
        ]


class TicketListSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source="session.movie.title", read_only=True)
    hall_name = serializers.CharField(source="session.hall.name", read_only=True)
    cinema_name = serializers.CharField(
        source="session.hall.cinema.name", read_only=True
    )
    customer_email = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_code",
            "status",
            "price",
            "purchase_date",
            "movie_title",
            "hall_name",
            "cinema_name",
            "is_used",
            "customer_email",
        ]

    def get_customer_email(self, obj):
        if hasattr(obj.customer, "email") and obj.customer.email:
            return obj.customer.email
        if hasattr(obj.customer, "user") and obj.customer.user:
            return obj.customer.user.email
        return None


class PromoCodeSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    sessions_list = serializers.PrimaryKeyRelatedField(
        source='sessions',
        many=True,
        queryset=MovieSession.objects.all(),
        required=False
    )
    is_currently_valid = serializers.SerializerMethodField()
    remaining_uses = serializers.SerializerMethodField()

    class Meta:
        model = PromoCode
        fields = [
            'id',
            'code',
            'description',
            'discount_type',
            'discount_value',
            'valid_from',
            'valid_until',
            'is_active',
            'usage_limit',
            'used_count',
            'per_user_limit',
            'organizer',
            'organizer_name',
            'sessions_list',
            'seat_type',
            'min_tickets',
            'min_total_spent',
            'is_currently_valid',
        ]
        read_only_fields = [
            'id', 'used_count', 'organizer_name', 'is_currently_valid', 'remaining_uses' ]
        extra_kwargs = {
            'organizer': {'write_only': True},
            'code': {'help_text': 'Unique promotion code (e.g., SUMMER25)'},
            'discount_value': {'help_text': 'Percentage (0-100) or fixed amount based on discount_type'},
            'usage_limit': {'help_text': 'Leave empty for unlimited usage'},
        }

    def get_is_currently_valid(self, obj):
        """Check if promo code is currently valid"""
        now = timezone.now()
        return obj.is_active and obj.valid_from <= now <= obj.valid_until

    def get_remaining_uses(self, obj):
        """Calculate remaining uses"""
        if obj.usage_limit is None:
            return "Unlimited"
        return max(obj.usage_limit - obj.used_count, 0)

    def validate_code(self, value):
        """Validate code uniqueness (case insensitive)"""
        if self.instance and self.instance.code.lower() == value.lower():
            return value
            
        if PromoCode.objects.filter(code__iexact=value).exists():
            raise serializers.ValidationError("A promo code with this code already exists.")
        return value.upper()

    def validate_discount_value(self, value):
        """Validate discount value based on type"""
        discount_type = self.initial_data.get('discount_type')
        
        if discount_type == 'percent' and (value < 0 or value > 100):
            raise serializers.ValidationError("Percentage discount must be between 0 and 100.")
        
        if discount_type == 'fixed' and value < 0:
            raise serializers.ValidationError("Fixed amount discount cannot be negative.")
            
        return value

    def validate_dates(self, data):
        """Validate date logic"""
        valid_from = data.get('valid_from')
        valid_until = data.get('valid_until')

        if valid_from and valid_until and valid_from >= valid_until:
            raise serializers.ValidationError({
                'valid_until': 'Valid until must be after valid from date.'
            })

        if valid_until and valid_until < timezone.now():
            raise serializers.ValidationError({
                'valid_until': 'Valid until date cannot be in the past.'
            })

        return data

    def validate(self, data):
        """Overall validation"""
        data = self.validate_dates(data)
        request = self.context.get('request')
        if request and request.user.is_authenticated and 'organizer' not in data:
            if hasattr(request.user, 'admin_profile'):
                data['organizer'] = request.user.admin_profile
        
        return data

    def create(self, validated_data):
        """Create promo code with sessions"""
        sessions_data = validated_data.pop('sessions', [])
        promo_code = PromoCode.objects.create(**validated_data)
        
        if sessions_data:
            promo_code.sessions.set(sessions_data)
            
        return promo_code

    def update(self, instance, validated_data):
        """Update promo code with sessions"""
        sessions_data = validated_data.pop('sessions', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if sessions_data is not None:
            instance.sessions.set(sessions_data)
            
        return instance


class PromoCodeCreateSerializer(serializers.ModelSerializer):
    sessions = serializers.PrimaryKeyRelatedField(
        queryset=MovieSession.objects.all(), 
        required=False,
        allow_null=True
    )

    movie = serializers.PrimaryKeyRelatedField(
        queryset=Movie.objects.all(),
        required=False,
        allow_null=True,
    )
    class Meta:
        model = PromoCode
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'valid_from', 'valid_until', 'is_active', 'usage_limit', 'per_user_limit',
            'organizer', 'sessions', 'seat_type', 'min_tickets', 'min_total_spent', 'movie'
        ]
        read_only_fields = ['id']

    def validate_code(self, value):
        """Validate promo code uniqueness"""
        if not value:
            raise serializers.ValidationError("Promo code is required.")
        
        code_upper = value.upper().strip()
        
        if PromoCode.objects.filter(code__iexact=code_upper).exists():
            raise serializers.ValidationError("A promo code with this code already exists.")
        
        return code_upper

class PromoCodeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    is_currently_valid = serializers.SerializerMethodField()
    remaining_uses = serializers.SerializerMethodField()
    discount_display = serializers.SerializerMethodField()

    class Meta:
        model = PromoCode
        fields = [
            'id',
            'code',
            'description',
            'discount_type',
            'discount_value',
            'discount_display',
            'valid_from',
            'valid_until',
            'is_active',
            'used_count',
            'is_currently_valid',
            'remaining_uses',
        ]

    def get_discount_display(self, obj):
        if obj.discount_type == 'percent':
            return f"{obj.discount_value}%"
        return f"${obj.discount_value}"


class PromoCodeValidationSerializer(serializers.Serializer):
    """Serializer for validating promo code usage"""
    promo_code = serializers.CharField(max_length=50)
    user_id = serializers.IntegerField()
    seat_id = serializers.IntegerField()
    session_id = serializers.IntegerField(required=False)
    tickets_count = serializers.IntegerField(required=False, default=0)
    total_amount = serializers.DecimalField(max_digits=8, decimal_places=2, required=False, default=0)

    def validate(self, data):
        from django.shortcuts import get_object_or_404
        from accounts.models import Customer as User
        
        promo_code = data['promo_code']
        user = get_object_or_404(User, id=data['user_id'])
        seat = get_object_or_404(Seat, id=data['seat_id'])
        session = get_object_or_404(MovieSession, id=data['session_id']) if data.get('session_id') else None
        
        try:
            promo = PromoCode.objects.get(code__iexact=promo_code)
        except PromoCode.DoesNotExist:
            raise serializers.ValidationError({"promo_code": "Invalid promo code."})

        is_valid, message = promo.is_valid_for_user(
            user=user,
            seat=seat,
            session=session,
            tickets_count=data.get('tickets_count'),
            total_amount=data.get('total_amount')
        )

        if not is_valid:
            raise serializers.ValidationError({"promo_code": message})

        data['promo'] = promo
        data['user'] = user
        data['seat'] = seat
        data['session'] = session
        
        return data


class PromoUsageSerializer(serializers.ModelSerializer):
    """Serializer for promo code usage tracking"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    promo_code = serializers.CharField(source='promo.code', read_only=True)

    class Meta:
        model = PromoUsage
        fields = ['id', 'user', 'user_name', 'promo', 'promo_code', 'used_at']
        read_only_fields = ['id', 'used_at']