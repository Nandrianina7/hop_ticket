from rest_framework.permissions import BasePermission
from accounts.models import Customer

class IsCustomerAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return isinstance(request.user, Customer)
