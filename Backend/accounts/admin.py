from django.contrib import admin
from django.contrib.auth.hashers import make_password
from .models import Admin, Customer

# 1. Admin Configuration
class AdminAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'phone')
    search_fields = ('email', 'full_name')
    
    # Prevent password from being shown in plain text
    fields = ('email', 'password', 'full_name', 'phone')
    
    # Auto-hash passwords when saving from admin
    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.password = make_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)

admin.site.register(Admin, AdminAdmin)

# 2. Customer Configuration
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'phone_verified')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('phone_verified',)
    
    # Group fields in sections
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'birth_date', 'phone')}),
        ('Verification', {'fields': ('phone_verified',)}),
        ('App Data', {'fields': ('qr_code', 'favorite_events')}),
    )
    
    # Auto-hash passwords
    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.password = make_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)

admin.site.register(Customer, CustomerAdmin)