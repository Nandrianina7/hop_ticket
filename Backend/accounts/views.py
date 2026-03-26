from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .serializers import (
    AdminSerialiser, 
    CustomerRegistrationSerializer, 
    CustomizerSerializer, 
    OrganizerRegistrationSerializer, 
    EventOrganizerRegistrationSerializer
)
from . import models
from rest_framework.views import APIView
from accounts.models import Customer, AuthToken, Admin
import uuid
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from api.auth import UUIDAuthentication 


@api_view(["POST"])
def register_admin(request):
    try:
        print('Incoming request', request.data)
        email = request.data.get('email')
        password = request.data.get('password')
        fullname = request.data.get('full_name')
        phone = request.data.get('phone')

        if not all([email, password, fullname, phone]):
            return Response({"message": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if Admin.objects.filter(email=email).exists():
            print('cette email est deja utilise')
            return Response(
                {'error': 'Email already exists, try a new one'},
                status=status.HTTP_409_CONFLICT
            )

        user = Admin.objects.create(
            email=email,
            full_name=fullname,
            phone=phone,
            role="admin",
            is_staff=True,
            is_superuser=True
        )
        user.set_password(password)
        user.save()

        return Response(
            {"message": f"Admin {email} created successfully"},
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {"error": f"An error occurred when creating admin -> {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
class OrganizerRegisterView(APIView):
    def post(self, request):
        serializer = OrganizerRegistrationSerializer(data=request.data)
        print('receved data', request.data)
        if serializer.is_valid():
            organizer = serializer.save(role="organizer")
            refresh = RefreshToken.for_user(organizer)
            
            response = Response({
                "message": "Organizer registered successfully",
                "organizer_id": organizer.id,
                "user_role": organizer.role,
                "success": True,
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
            }, status=status.HTTP_201_CREATED)
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=False,  # better True in production
                secure=False,
                samesite="Lax",
                max_age=60 * 2
            )
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=False,
                secure=False,
                samesite="Lax",
                max_age=60 * 60 * 24 * 7
            )
            response.set_cookie(
                key="user_role",
                value=organizer.role,
                httponly=False,
                secure=False,
                samesite="Lax",
                max_age=60 * 60 * 24 * 7
            )

            return response
        print('error', serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EventOrganizerRegisterView(APIView):
    def post(self, request):
        print('receved data', request.data)
        serializer = EventOrganizerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(role='event_organizer')
            return Response({'message': 'User register successfully'}, status=status.HTTP_201_CREATED)
        else:
            print('error',serializer.errors)
            return Response({'error': 'Failed to save user'}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
def admin_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    print('Incoming request', request.data)
    try:
        if not all([email, password]):
            print('missing required field')
            return Response({"message": "All are required", "success": False}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        user = models.Admin.objects.get(email=email)

        if not user.is_active:
            return Response({
                'message': 'This accounts has been desactivated. Please contact the Amdin',
                'success': False,
            }, status=status.HTTP_401_UNAUTHORIZED)


        if user.check_password(password):
            print('user logged')
            refresh = RefreshToken.for_user(user)
            response = Response({
                "message": "Admin logged successfully",
                "admin_id": user.id,
                "user_role": "admin",
                "success": True
                },status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                httponly=False,
                secure=False,
                samesite='Lax',
                max_age=60*2
            )
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=False,
                secure=False,
                samesite='Lax',
                max_age=60 * 60 *24 * 7
            )
            response.set_cookie(
                key="user_role",
                value=user.role,
                httponly=False,
                secure=False,
                samesite="Lax",
                max_age=60 * 60 * 24 * 7
            )
            return response
        else:
            return Response({"message": "Incorrect password", "success": False})
    except models.Admin.DoesNotExist:
        pass
    return Response({'message': 'Invalid credentials', 'success': False})
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

class CookieRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {"error": "No refresh token found"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken(refresh_token)
            user_id = refresh.payload.get('user_id')

            if user_id:
                try:
                    user = models.Admin.objects.get(id=user_id)

                    if not user.is_active:
                        return Response({
                            'error': 'Account desactivated',
                            'message': 'This account has been desactivated.Please contact the administrator',
                            'success': False
                        }, status=status.HTTP_401_UNAUTHORIZED)
                except models.Admin.DoesNotExist:
                    return Response({
                        "error": 'Not found',
                        "message": 'USer not found'
                    }, status=status.HTTP_404_NOT_FOUND)

            request.data['refresh'] = refresh_token
            response = super().post(request, *args, **kwargs)
        
            if response.status_code == 200:
                response.set_cookie(
                    key='access_token',
                    value=response.data['access'],
                    httponly=False,
                    secure=False,
                    samesite='Lax',
                    max_age=60 * 15
                )
                if 'refresh' in response.data:
                    response.set_cookie(
                        key='refresh_token',
                        value=response.data['refresh'],
                        httponly=False,
                        secure=False,
                        samesite='Lax',
                        max_age=60 * 60 * 24 * 7
                    )
                
            return response
        except TokenError as e:
            return Response({
                'message': 'Token refresh error',
                'success': False,
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({
                'message': 'Server error',
                'error': str(e),
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    print(f"[DEBUG] user {request.user}")
    user_email = request.user if isinstance(request.user, str) else request.user.email

    admin = get_object_or_404(models.Admin, email=user_email)
    if admin.is_superuser:
        serialiazer = AdminSerialiser(admin)
        return Response({
            "id": admin.id,
            "data": serialiazer.data ,
        })
    elif admin.role == 'organizer' or admin.role == 'event_organizer':
        serialiazer = AdminSerialiser(admin)
        return Response({
            'data': serialiazer.data, 
            'message': 'The user is an organizer'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'message': 'The user is nor an admin and nor an orgnaizer'
        }, status=status.HTTP_401_UNAUTHORIZED)
        
    

class CustomizerListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Non autorisé'}, status=status.HTTP_401_UNAUTHORIZED)

        customizers = models.Customer.objects.all()
        serializer = CustomizerSerializer(customizers, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)


class CustomerInfoView(APIView):
    def get(self, request, pk):
        if not pk:
            return Response({
                'message': 'No customer was selected', 
                'success': False
                }, status=status.HTTP_401_UNAUTHORIZED)
        customer = Customer.objects.get(id=pk)
        serializer = CustomizerSerializer(customer)
        return Response({
            'status': True,
            'message': 'Successfully loaded',
            'data': serializer.data
        })

class EventOrganizerListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_email = request.user
        user = Admin.objects.get(email=user_email)

        if not user.is_superuser:
            return Response({
                'success': True,
                'message': 'User not permetted to perform this action'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        org_list = Admin.objects.filter(role='event_organizer')
        serializer = AdminSerialiser(org_list, many=True)
        return Response({
            'data': serializer.data,
            'success': True,
            'message': 'Successfully loaded'
        }, status=status.HTTP_200_OK)
    
class SelectedOrganizerView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        user_email = request.user
        user = Admin.objects.get(email=user_email)

        if not user.is_superuser:
            return Response({
                'message': 'This user is not authorized',
                'success': False,
            })
        organizer_data = Admin.objects.get(id=pk)
        serializer = AdminSerialiser(organizer_data)

        return Response({
            'message': 'Organizer data loaded',
            'success': True,
            'data': serializer.data
        })

class UpdateOrganizerDataView(APIView):
    def put(self, request, pk):
        user_email = request.user
        try:
            user = Admin.objects.get(email=user_email)
        except Admin.DoesNotExist:
            return Response({
                'message': 'User not found',
                'success': False,
            }, status=status.HTTP_404_NOT_FOUND)

        if not user.is_superuser:
            return Response({
                'message': 'This user is not authorized',
                'success': False,
            }, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email')
        phone = request.data.get('phone')
        full_name = request.data.get('full_name')
        is_active = request.data.get('is_active')

        try:
            organizer = Admin.objects.get(id=pk)
        except Admin.DoesNotExist:
            return Response({
                'message': 'Organizer not found',
                'success': False,
            }, status=status.HTTP_404_NOT_FOUND)
        
        if email and email != organizer.email:
            if Admin.objects.filter(email=email).exclude(id=pk).exists():
                return Response({
                    'message': 'This email is already in use',
                    'success': False,
                }, status=status.HTTP_400_BAD_REQUEST)
            
            
            if not self.is_valid_email(email):
                return Response({
                    'message': 'Invalid email format',
                    'success': False,
                }, status=status.HTTP_400_BAD_REQUEST)
            
            organizer.email = email

        if phone and phone != organizer.phone:
            if Admin.objects.filter(phone=phone).exclude(id=pk).exists():
                return Response({
                    'message': 'This phone number is already in use',
                    'success': False,
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not self.is_valid_phone(phone):
                return Response({
                    'message': 'Invalid phone number format',
                    'success': False,
                }, status=status.HTTP_400_BAD_REQUEST)
            
            organizer.phone = phone

        if full_name:
            organizer.full_name = full_name
        if organizer.id == user.id and not is_active:
            return Response({
                'message': 'You cannot deactivate your own account',
                'success': False,
            }, status=status.HTTP_400_BAD_REQUEST)
        
        organizer.is_active = is_active

        try:
            organizer.save()
  
            return Response({
                'message': 'Organizer updated successfully',
                'success': True,
                'data': {
                    'id': organizer.id,
                    'full_name': organizer.full_name,
                    'email': organizer.email,
                    'phone': organizer.phone,
                    'role': organizer.role,
                    'is_superuser': organizer.is_superuser,
                    'created_at': organizer.created_at,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': f'Error updating organizer: {str(e)}',
                'success': False,
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def is_valid_email(self, email):
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def is_valid_phone(self, phone):
        """Validate phone number format"""
        import re
        pattern = r'^[\d\s\+\-\(\)]{8,}$'
        return re.match(pattern, phone) is not None
    
    
# mobile
class CustomerRegisterView(APIView):
    def post(self, request):
        serializer = CustomerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Créer l'utilisateur avec le mot de passe hashé
                user = serializer.save()
                return Response({
                    'detail': 'Inscription réussie',
                    'user_id': user.id,
                    'email': user.email
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'detail': f'Erreur lors de la création: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = Customer.objects.get(email=email)
            if not user.check_password(password):
                return Response({'detail': 'Mot de passe invalide'}, status=status.HTTP_401_UNAUTHORIZED)
        except Customer.DoesNotExist:
            return Response({'detail': 'Email invalide'}, status=status.HTTP_401_UNAUTHORIZED)

        # Récupérer ou créer sans sauvegarder immédiatement
        try:
            auth_token = AuthToken.objects.get(user=user)
        except AuthToken.DoesNotExist:
            auth_token = AuthToken.objects.create(user=user, access_token="", refresh_token="", access_expiry=timezone.now(), refresh_expiry=timezone.now())

        # Générer les tokens
        auth_token.generate_tokens()

        return Response({
            'access_token': auth_token.access_token,
            'refresh_token': auth_token.refresh_token,
            'access_expires_at': auth_token.access_expiry.isoformat(),
            'refresh_expires_at': auth_token.refresh_expiry.isoformat(),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'number':user.phone
            }
        }, status=status.HTTP_200_OK)

    

class RefreshTokenView(APIView):
    permission_classes = []

    def post(self, request):
        refresh_token = request.data.get('refresh_token')

        if not refresh_token:
            return Response({'detail': 'Refresh token requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_obj = AuthToken.objects.get(refresh_token=refresh_token)

            if timezone.now() > token_obj.refresh_expiry:
                return Response({'detail': 'Refresh token expiré'}, status=status.HTTP_401_UNAUTHORIZED)

            # Générer un nouveau access_token
            new_access_token = str(uuid.uuid4())
            token_obj.access_token = new_access_token
            token_obj.access_expiry = timezone.now() + timedelta(days=30)
            token_obj.save()

            return Response({
                'access_token': new_access_token,
                'access_expires_at': token_obj.access_expiry.isoformat(),
            }, status=status.HTTP_200_OK)

        except AuthToken.DoesNotExist:
            return Response({'detail': 'Refresh token invalide'}, status=status.HTTP_401_UNAUTHORIZED)
        
class CheckDualUserAPIView(APIView):
    authentication_classes = [UUIDAuthentication]  # Utilisez UUIDAuthentication au lieu de JWTAuthentication
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        print(f"Request user: {request.user}")
        print(f"Request user type: {type(request.user)}")
        print(f"Request auth: {request.auth}")
        
        # Pour JWT, request.user devrait être un objet User
        email = getattr(request.user, "email", None)
        
        if not email:
            # Essayez de récupérer l'email depuis le token si request.user n'a pas d'email
            try:
                if request.auth:
                    access_token = AccessToken(str(request.auth))
                    user_id = access_token['user_id']
                    User = get_user_model()
                    user = User.objects.get(id=user_id)
                    email = user.email
            except Exception as e:
                print(f"Error getting email from token: {e}")
                return Response({
                    "allowed": False,
                    "admin_exists": False,
                    "customer_exists": False,
                    "error": f"Could not extract email: {str(e)}"
                }, status=400)

        if not email:
            return Response({
                "allowed": False,
                "admin_exists": False,
                "customer_exists": False,
                "error": "No email could be determined from user or token"
            }, status=400)

        admin_exists = Admin.objects.filter(email__iexact=email).exists()
        customer_exists = Customer.objects.filter(email__iexact=email).exists()

        print(f"Check for email: {email}, admin: {admin_exists}, customer: {customer_exists}")

        return Response({
            "allowed": bool(admin_exists and customer_exists),
            "admin_exists": admin_exists,
            "customer_exists": customer_exists,
            "email_checked": email,
        })

from django.db.models import Count
class AllOrganisatorView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AdminSerialiser
    def get_queryset(self):
        user = self.request.user

        if not (user.is_superuser or user.is_staff):
            return Admin.objects.none()
        return Admin.objects.filter(
                role__in=['Organizer', 'Event_organizer']
            ).annotate(event_count=Count('event')).prefetch_related('event', 'cinemas', 'eventSite')
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        return Response({
            "success": True,
            "data": response.data,
            "message": "Organizers retrieved successfully",
            "count": len(response.data)
        })
       

