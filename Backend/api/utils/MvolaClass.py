from datetime import datetime, time, timezone
import uuid
from mvola import Mvola
from mvola.tools import Transaction
import requests

from .config import CLIENT_ID, CLIENT_SECRET

# from Backend.utils.config import CLIENT_ID, CLIENT_SECRET 
# CUSTOMER_MSISDN, OAUTH_URL, PARTNER_MSISDN, PARTNER_NAME, PAY_URL

class MvolaClass:
    def __init__(self):
        self.api = Mvola(CLIENT_ID, CLIENT_SECRET)

    def get_access_token(self):
        res = self.api.generate_token()
        if res.success :
            token = res.response  # Extract the actual token from the response
            print(f"Token generated successfully: {res.response}")
            return token 
        else :
            print(f"Status_code[{res.status_code}] \n {res.error}")
            return None

            # === STEP 2: Initiate a payment ===

    def initiate_payment(self, access_token):
       origin_ref = f"TRNX_{time().strftime('%s')}"
       request_datee = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
       print(request_datee)
       transaction = Transaction(
            token=access_token, # [Token] Required fields - now using the actual token string
            user_language="FR", # MG or FR
            user_account_identifier="0343500003", # [UserAccountIdentifier] Requiered fields 
            partner_name="Marketbot", # Name of your application
            amount="1500",
            x_callback_url="https://24b8310942e9.ngrok-free.app/mvola/callback", # Webhook link for client , Mvola sends requests in this links once the transaction is finished
            currency="Ar",
            original_transaction_reference=str(origin_ref), # Unique reference for this transaction
            # Possible Values : Ar only
            requesting_organisation_transaction_reference=str(origin_ref), # Unique reference for this transaction
            description_text="Unedescription", # String (len<40Characters)without special character
            request_date=request_datee, # Respect the consraints as in this example
            debit="0343500003", # [Debit] Required fields | Phone number of subscriber .In preprod it’s fixed: 034350003 or 0343500004
            credit="0343500004",  # [Credit] Required fields | Phone number of merchant. In preprod it’s fixed: 034350003 or 0343500004
        )

       resp = self.api.init_transaction(transaction)

       if resp.success :
            print(resp.response)
       else :
            print(f"Status_code [{resp.status_code}] \n {resp.error}")


# if __name__ == "__main__":
#     token = get_access_token()
#     if token:
#         initiate_payment(token)
