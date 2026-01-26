# utils/security.py
from itsdangerous import TimestampSigner
from django.conf import settings

signer = TimestampSigner(settings.SECRET_KEY)

def generate_secure_qr_data(ticket_id, user_id):
    return signer.sign(f"{ticket_id}:{user_id}").decode()
    