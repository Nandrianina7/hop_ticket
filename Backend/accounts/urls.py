from django.urls import path
from . import views
from .views import (
  CookieRefreshView, 
  CustomerRegisterView, 
  LoginView, 
  RefreshTokenView, 
  CustomizerListView, 
  CheckDualUserAPIView, 
  OrganizerRegisterView,
  EventOrganizerRegisterView,
  AllOrganisatorView
)

urlpatterns = [
  path("login/", views.admin_login, name='login'),
  path("register/", views.register_admin, name='admin-register'),
  path('token_refresh/', CookieRefreshView.as_view() , name='token_refresh'),
  path('getCurrentUser/', views.current_user, name='current_user'),
  path('allCustomers/', CustomizerListView.as_view(), name='all_customers'),
  path('organizer/register/', OrganizerRegisterView.as_view(), name='organizer_register'),
  path('event_organizer/signup/', EventOrganizerRegisterView.as_view(), name='organizer_signup'),
  path('all_organizers/', AllOrganisatorView.as_view(), name='list_organizators'),
  path('customer_info/<int:pk>/', views.CustomerInfoView.as_view(), name='custoemr_info'),
  path('org_lst/', views.EventOrganizerListView.as_view(), name='organizer_list'),
  
  # mobile urls
  path('mobile/register/', CustomerRegisterView.as_view(), name='customer-register'),
  path('mobile/login/', LoginView.as_view(), name='login'),
  path('mobile/token/refresh/', RefreshTokenView.as_view(), name='mobile-token-refresh'),
  path('mobile/check_dual_user/', CheckDualUserAPIView.as_view(), name='check_dual_user'),
  
]