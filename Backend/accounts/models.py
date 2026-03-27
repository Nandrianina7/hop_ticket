from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta
import uuid


class AdminManager(BaseUserManager):
    def create_user(self, email, password=None, role='organizer',**extra_fields):
        if not email:
            raise ValueError('The Email must be set')

        if ('full_name' not in extra_fields or 'phone' not in extra_fields) and role != 'admin':
            raise ValueError("full_name and phone are required")

        email = self.normalize_email(email)
        user = self.model(email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)  # Ensure superuser status
        user = self.create_user(email, password, role='admin',**extra_fields)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user
class Admin(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('Admin', 'admin'),
        ('Organizer', 'organizer'),
        ('Event_organizer', 'event_organizer')
    )

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='organizer')
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False) 
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = AdminManager()

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return self.is_staff
class Customer(models.Model):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    phone_verified = models.BooleanField(default=False)
    password = models.CharField(max_length=128) 
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_date = models.DateField(null=True, blank=True)
    auth_token = models.CharField(max_length=255, blank=True, null=True)

    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_authenticated(self):
        """Toujours retourner True pour les utilisateurs authentifiés"""
        return True
    
    @property
    def is_anonymous(self):
        """Toujours retourner False pour les utilisateurs authentifiés"""
        return False


class AuthToken(models.Model):
    user = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name="auth_tokens")
    access_token = models.CharField(max_length=255, unique=True)
    refresh_token = models.CharField(max_length=255, unique=True)
    access_expiry = models.DateTimeField()
    refresh_expiry = models.DateTimeField()

    def generate_tokens(self):
        self.access_token = str(uuid.uuid4())
        self.refresh_token = str(uuid.uuid4())
        # Access token valable 30 jours, refresh token 90 jours
        self.access_expiry = timezone.now() + timedelta(days=30)
        self.refresh_expiry = timezone.now() + timedelta(days=90)
        self.save()

class DeletedAccount(models.Model):
    user = models.ForeignKey(
        Admin,
        on_delete=models.CASCADE,
        related_name='deleted_users'
    )
    deleted_by = models.ForeignKey(
        Admin,
        on_delete=models.CASCADE,
        related_name='deleted_by_admin'
    )
    deleted_on = models.DateTimeField(auto_now_add=True)

class Notifications(models.Model):
    notif_for = models.ForeignKey(
        Admin, 
        on_delete=models.CASCADE, 
        related_name='notification_for_admin'
    )
    content = models.CharField(max_length=500)
    is_read = models.BooleanField(default=False, db_index=True)
    notif_from = models.ForeignKey(
        Admin,
        on_delete=models.CASCADE,
        related_name='notification_is_from',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    target_id = models.IntegerField(default=0)
    target_content = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notif_from} -> {self.notif_for} : {self.content}"