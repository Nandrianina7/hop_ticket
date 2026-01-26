# api/auth.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from accounts.models import AuthToken, Customer

class UUIDAuthentication(BaseAuthentication):
    """
    Authentifie à la fois 
    - les en-têtes 'Bearer <uuid>' 
    - et    'Token  <uuid>' 
    afin de capter te tokens avant que TokenAuthentication ne s'en charge.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        # On accepte 'Bearer ' ou 'Token ' comme préfixe
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()
        elif auth_header.startswith('Token '):
            token = auth_header.split(' ', 1)[1].strip()
        else:
            return None

        # Recherche dans ton modèle AuthToken
        try:
            token_obj = AuthToken.objects.get(access_token=token)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed('Token invalide')

        # Vérification d’expiration
        if token_obj.access_expiry < timezone.now():
            raise AuthenticationFailed('Token expiré')

        # On renvoie l’instance de Customer (ton user)
        return (token_obj.user, None)
