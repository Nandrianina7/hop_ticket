from rest_framework import serializers
from . import models
from .models import Customer
from api.models import Event, EventSite
from cinema.models import Cinema, CinemaHall, Movie
from rest_framework import serializers

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "date",
            "venue",
            "tickets_sold",
            "average_rating",
            "description",
        ]

class EventSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSite
        fields = ["id", "site_name"]

class CinemaDashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cinema
        fields = [
            "id",
            "name",
            "city",
            "phone",
            "email",
            "is_active",
        ]
class AdminSerialiser(serializers.ModelSerializer):
  event_count = serializers.IntegerField(read_only=True)
  event = EventSerializer(many=True, read_only=True)
  eventSite = EventSiteSerializer(many=True, read_only=True)
  cinemas = CinemaDashboardSerializer(many=True, read_only=True)
  total_halls = serializers.SerializerMethodField()
  total_movies_with_sessions = serializers.SerializerMethodField()

  class Meta:
    model = models.Admin
    fields = [
        'id', 
        'email', 
        'full_name', 
        'phone', 
        'role', 
        'created_at', 
        'event_count', 
        'event', 
        'eventSite',
        'cinemas',
        "total_halls",
        "total_movies_with_sessions",
        'is_active',
        'is_deleted'

    ]

  def get_total_halls(self, obj):
        return CinemaHall.objects.filter(
            cinema__organizer=obj
        ).count()

  def get_total_movies_with_sessions(self, obj):
        return Movie.objects.filter(
            sessions__hall__cinema__organizer=obj
        ).distinct().count()


class CustomerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Customer
        fields = ['email', 'phone', 'first_name', 'last_name', 'birth_date', 'password']

    def create(self, validated_data):
        pwd = validated_data.pop('password')
        user = Customer(**validated_data)
        user.set_password(pwd)
        user.save()
        return user
    
class CustomizerSerializer(serializers.ModelSerializer):
   class Meta:
      model = Customer
      fields = '__all__'


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = models.Admin
        fields = ["id", "email", "full_name", "phone", "role", "password"]
        extra_kwargs = {
            "role": {"required": True},  # must provide "admin" or "organizer"
        }
    def validate_email(self, value):
        if models.Admin.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use. Please choose another one.")
        return value
    
    def create(self, validated_data):
        password = validated_data.pop("password")
        user = models.Admin(**validated_data)
        user.set_password(password)
        user.save()
        return user
class OrganizerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = models.Admin
        fields = ["id", "email", "full_name", "phone", "password"]

    def validate_email(self, value):
        if models.Admin.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use. Please choose another one.")
        return value
    def create(self, validated_data):
        user = models.Admin.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data.get("full_name"),
            phone=validated_data.get("phone"),
            role="organizer"
        )
        return user
    
class EventOrganizerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = models.Admin
        fields = ["id", "email","full_name", "phone", "password"]

    def create(self, validated_data):
        user = models.Admin.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data.get("full_name"),
            phone=validated_data.get("phone"),
            role="event_organizer"
        )

        return user

class NotificationSerializer(serializers.ModelSerializer):
    organizer_email = serializers.CharField(source='notif_from.email', read_only=True)
    organizer_id = serializers.IntegerField(source='notif_from.id', read_only=True)
    class Meta:
        model = models.Notifications
        fields = [
            'id',
            'content',
            'notif_for_id',
            'notif_from',
            'created_at',
            'organizer_email',
            'organizer_id',
            'target_content',
            'target_id',
        ]
        