from django.contrib.auth.backends import ModelBackend
from .models import Customer, Admin

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # essaie d'authentifier d'abord en tant qu'Admin, puis Customer
        UserModel = Admin if Admin.objects.filter(email=username).exists() else Customer
        try:
            user = UserModel.objects.get(email=username)
        except UserModel.DoesNotExist:
            return None
        return user if user.check_password(password) and self.user_can_authenticate(user) else None
