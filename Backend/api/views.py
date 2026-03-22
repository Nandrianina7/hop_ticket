from curses import raw
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

# from Backend.api.utils.MvolaClass import MvolaClass
from .utils.MvolaClass import MvolaClass

# from Backend.utils.MvolaClass import MvolaClass


from . import serializers
import logging
from . import models
from rest_framework import generics
from accounts.models import Admin, Customer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from .models import (
   Event, 
   EventPlan, 
   EventSite, 
   FCMToken, 
   Ticket, 
   PriceTier, 
   EventRating, 
   VenuePlan, 
   ViewEventLocation, 
   FoodItem
)
from .security import generate_secure_qr_data 
from .serializers import (
   EVentLocationSerializer, 
   EventPlanSerializer, 
   EventSerializer, 
   EventSiteLocationsSerializer, 
   EventSiteSerializer, 
   FCMTokenSerializer, 
   TicketSerializer, 
   TicketWebSerializer, 
   EventRatingSerializer, 
   Event_Serializer, 
   VenuePlanSerializer, 
   VenuePlanSerializer, 
   PriceSerializer, 
   ViewEventLocationSerializer,
   FoodItemCreateSerializer,
)
from django.utils import timezone
from rest_framework.generics import RetrieveAPIView
from api.auth import UUIDAuthentication
from api.permissions import IsCustomerAuthenticated
from django.core.files.storage import default_storage
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser
import json
from django.db import transaction, IntegrityError
from django.db.models import F, Sum
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


def hello_world(request):
    print("Hello World")
    return HttpResponse("Hello World")

@api_view(['GET'])
def test_get_all_events(request):
   tickets = Ticket.objects.all()
   serializer = TicketSerializer(tickets, many=True, context={'request': request})
   return Response(serializer.data)
@csrf_exempt # MVola will not send CSRF token
@api_view(['PUT'])
def mvola_callback(request):
    try:
        if request.method not in ["POST", "PUT"]:
            return JsonResponse({"error": "Invalid HTTP method"}, status=405)

        # Read JSON body
        print("Received MVola callback",request.body)
        data = json.loads(request.body.decode("utf-8"))
        logging.info(f"✅ Received MVola callback: {data}")

        # Extract fields
        transaction_status = data.get("transactionStatus")
        amount = data.get("amount")
        transaction_ref = data.get("transactionReference")

        # Example usage:
        # update_payment_status(transaction_ref, transaction_status)

        print(f"Transaction {transaction_ref} status: {transaction_status} (amount: {amount})")

        return JsonResponse({"message": "Callback received"}, status=200)

    except Exception as e:
        logging.error(f"❌ Error handling callback: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


class OrganizerEventsView(APIView):
    """
        Cette api est utilisee a obtebir les evenements creer par un organisateur selectiionne
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, creator):
       
       try:
          organizatir = Admin.objects.get(id=creator)
          if not organizatir:
             return Response({
                'message': 'Maybe the selected orgnaizer is not an event organizator',
                'sucess': False
             }, status=status.HTTP_401_UNAUTHORIZED)
          try:
             events = Event.objects.filter(organizer= organizatir.id)
             serializer = Event_Serializer(events, many=True)
             if not serializer.data:
                return Response({
                   'message': 'No event found',
                   'success': False
                }, status=status.HTTP_204_NO_CONTENT)
             return Response({
                'message': 'Successfully load data',
                'data': serializer.data,
                'success': True
             }, status=status.HTTP_200_OK)
          except Exception as inner_e:
             return Response({
                'message': 'error to load data',
                'error': str(inner_e),
                'success': False
             })
          
       except Admin.DoesNotExist as not_f:
          return Response({
             'message': 'The selected admin is not exist',
             'error': str(not_f),
             'success': False
          }) 
       except Exception as e:
          return Response({
             'message': 'Something went wrong',
             'error': str(e),
             'success': False
          })



          
      
@api_view(['POST'])
@permission_classes([IsAuthenticated])
# @parser_classes([MultiPartParser, FormParser])
def add_addEvent(request):
  try:
    print(f'received data {request.data}')
    
    user_email = request.user
    admin = Admin.objects.get(email=user_email)

    name = request.data.get("name")
    date = request.data.get("date")
    description = request.data.get("description")
    venue = request.data.get("venue")
    image = request.data.get("file")
    percent = request.data.get("owner_percentage")

    if not all([name, date, venue]):
      return Response(
        {"message": "All fields are required"},
        status=status.HTTP_400_BAD_REQUEST
      )

    data = {
      "name": name,
      "date": date,
      "description": description,
      "venue": venue,
      "image": image,
      "organizer": admin.id, 
      "owner_percentage": int(percent)
    }

    serializer = serializers.EventSerializer(data=data)

    if not serializer.is_valid():
      print(f'Error {serializer.errors}')
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    event = serializer.save(tickets_sold=0)

    return Response({
      "message": "Event created successfully",
      "event": serializer.data
    }, status=status.HTTP_201_CREATED)

  except Exception as e:
    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
  
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getAllEvent(request):
    if not request.user:
      return Response({"message": "No user found"})
    try:
      user = Admin.objects.get(email=request.user)
      if user.is_superuser or user.is_staff:
        events = models.Event.objects.all()
      else:
        events = models.Event.objects.filter(organizer=user.id)
      serializer = serializers.EventSerializer(events, many=True)
      if not serializer.data:
        return Response({"message": "No data saved yet"},
                status=status.HTTP_204_NO_CONTENT)
      return Response({
          "message": "Data found",
          "success": True,
          "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
      print(f"An error occurred -> {str(e)}")
      return Response({
          "message": "Server error",
          "success": False,
          "data": []
      }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def updateEvent(request, id):
  if not id:
    return Response({"message": "No id selected"}, status=status.HTTP_401_UNAUTHORIZED)
  try:
    event = models.Event.objects.get(id=id)
    event.name = request.data.get('name', event.name)
    event.date = request.data.get('date', event.date)
    event.description = request.data.get('description', event.description)
    event.venue = request.data.get('venue', event.venue)
    if 'image' in request.FILES:
      if event.image:
        default_storage.delete(event.image.path)
      event.image = request.FILES['image']
    event.save()
    event.update_availability()
    return Response({'message': 'Upated successfully'}, status=status.HTTP_201_CREATED)
  except Exception as e:
    return Response({"error": "Failed to update event"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_event(request, id):
    if not id:
      return Response({"message": "No id selected"})
    
    print('selected id:', id)
    try:
      event = models.Event.objects.get(id=id)
      print('event to delete:', event.name)
        
      try:
        event.delete()
        print('event deleted successfully')
      except Exception as inner_e:
        print('Inner delete error:', str(inner_e))  # DEBUG
        return Response({"error": f"Failed to delete: {str(inner_e)}"}, status=500)

      return Response({"message": "Deleted successfully"}, status=status.HTTP_200_OK)

    except models.Event.DoesNotExist:
      return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
      print('Outer error:', str(e))  # DEBUG
      return Response({"error": f"Unexpected error: {str(e)}"}, status=500)

@api_view(["GET"])
def getAllTicket():
  ticket = models.Ticket.objects.all()
  serializer = serializers.TicketWebSerializer(ticket, many=True)
  return Response({"data": serializer.data})


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def add_image_and_price(request, id_event):
  print(f"Raw request data: {request.data}")
  print(f"Files received: {request.FILES}")

  try:
    event = models.Event.objects.get(id=id_event)
  except models.Event.DoesNotExist:
    return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

  if 'image' in request.FILES:
      event.image = request.FILES['image']
      event.save()
  try:
    price_data = request.data.get('prices_tiers')
    if isinstance(price_data, str):
      try:
        price_data = json.loads(price_data)
      except json.JSONDecodeError:
        return Response(
              {"error": "Invalid JSON format in price tiers"},
                status=status.HTTP_400_BAD_REQUEST
            )
    if isinstance(price_data, list) and len(price_data) == 1:
      try:
        price_data = json.loads(price_data[0])
      except (json.JSONDecodeError, TypeError):
        pass 
    if not isinstance(price_data, list):
      return Response(
          {"error": "Price tiers must be an array"},
          status=status.HTTP_400_BAD_REQUEST
      )

    print(f"Processing price data: {price_data}")

    models.PriceTier.objects.filter(event=event).delete()

    created_tiers = []
    for tier_data in price_data:
      try:
        tier_data['event'] = event.id
        tier_data['tier_type'] = tier_data['tier_type'].upper()
        tier_data['price'] = float(tier_data['price']) 
        tier_data['available_quantity'] = int(tier_data['available_quantity'])
                
        serializer = serializers.PriceSerializer(data=tier_data)
        if serializer.is_valid():
          serializer.save()
          created_tiers.append(serializer.data)
        else:
          print("Serializer validation errors:", serializer.errors)
          raise ValueError(serializer.errors)
      except (KeyError, ValueError, TypeError) as e:
        models.PriceTier.objects.filter(event=event).delete()
        return Response(
            {"error": f"Invalid tier data: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response({
      "message": "Successfully updated image and prices",
      "image_updated": 'image' in request.FILES,
      "price_tiers": created_tiers
  }, status=status.HTTP_201_CREATED)

  except Exception as e:
    print(f"Error processing request: {str(e)}")
    return Response(
      {"error": f"Server error: {str(e)}"},
      status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
  
@api_view(['PUT', 'PATCH'])
@parser_classes([MultiPartParser, FormParser])
def update_image_and_price(request, id_event):
  print(f"Raw request data: {request.data}, id: {id_event}")
  try:
    event = models.Event.objects.get(id=id_event)
  except models.Event.DoesNotExist:
    return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)

  try:
    partial = request.method == 'PATCH'
        
    event_serializer = serializers.EventSerializer(
      event, 
      data=request.data, 
      partial=partial
    )
        
    if not event_serializer.is_valid():
      print("Event serializer errors:", event_serializer.errors)
      return Response(
          {"error": event_serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
          )
        
    updated_event = event_serializer.save()
    print(f"Event updated: {updated_event.name}")
    image_updated = False
    if 'image' in request.FILES:
      event.image = request.FILES['image']
      event.save()
      image_updated = True
    
    price_tiers_updated = False
    created_tiers = []
    if 'prices_tiers' in request.data:
      price_data = request.data.get('prices_tiers')
            
      if isinstance(price_data, str):
        try:
          price_data = json.loads(price_data)
        except json.JSONDecodeError:
          return Response(
                {"error": "Invalid JSON format in price tiers"},
                  status=status.HTTP_400_BAD_REQUEST
              )
                    
      if isinstance(price_data, list) and len(price_data) == 1:
        try:
          price_data = json.loads(price_data[0])
        except (json.JSONDecodeError, TypeError):
          pass 

      if not isinstance(price_data, list):
        return Response(
            {"error": "Price tiers must be an array"},
              status=status.HTTP_400_BAD_REQUEST
          )

      models.PriceTier.objects.filter(event=event).delete()
            
      for tier_data in price_data:
        try:
          tier_data['event'] = event.id
          tier_data['tier_type'] = tier_data['tier_type'].upper()
          tier_data['price'] = float(tier_data['price']) 
          tier_data['available_quantity'] = int(tier_data['available_quantity'])
                  
          serializer = serializers.PriceSerializer(data=tier_data)
          if serializer.is_valid():
            serializer.save()
            created_tiers.append(serializer.data)
          else:
            raise ValueError(serializer.errors)
        except (KeyError, ValueError, TypeError) as e:
          models.PriceTier.objects.filter(event=event).delete()
          return Response(
                {"error": f"Invalid tier data: {str(e)}"},
                   status=status.HTTP_400_BAD_REQUEST
              )
            
      price_tiers_updated = True

    return Response({
      "message": "Event updated successfully",
      "event": event_serializer.data,
      "image_updated": image_updated,
      "price_tiers_updated": price_tiers_updated,
      "price_tiers": created_tiers if price_tiers_updated else None
    }, status=status.HTTP_200_OK)

  except Exception as e:
    print(f"Error updating event: {str(e)}")
    return Response(
        {"error": f"Server error: {str(e)}"},
          status=status.HTTP_500_INTERNAL_SERVER_ERROR

      )


class RegisterFCMToken(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get("token")
        device_type = request.data.get("device_type", "android")
        user_id = request.data.get("user_id")
        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        customer= Customer.objects.filter(id=user_id).first()
        if not customer:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        # update or create token
        fcm_token, created = FCMToken.objects.update_or_create(
            fcmtoken=token,
            defaults={"user": customer, "device_type": device_type}
        )

        return Response({
            "message": "Token saved",
            "created": created
        }, status=status.HTTP_200_OK)
       

class SendPushNotificationView(APIView):

    def post(self, request):
        # 1. Récupérer title, body et extraData du request
        title = request.data.get("title")
        body = request.data.get("body")
        extra_data = request.data.get("extraData", {})

        if not title or not body:
            return Response(
                {"error": "title and body are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Récupérer tous les tokens depuis la base
        tokens = list(FCMToken.objects.values_list("token", flat=True))

        if not tokens:
            return Response({"error": "No FCM tokens found"}, status=404)

        # 3. Construire le payload pour ta Cloud Function
        payload = {
            "tokens": tokens,
            "title": title,
            "body": body,
            "extraData": extra_data,
        }

        # 4. Headers identiques à ton cURL
        headers = {
            "Content-Type": "application/json",
            "x-api-key": settings.FCM_CLOUD_FUNCTION_KEY,
        }

        # 5. URL de ta Firebase Cloud Function
        url = "https://us-central1-ticketevent-5b140.cloudfunctions.net/sendPushNotification"

        # 6. Appel POST
        response = request.post(url, json=payload, headers=headers)

        # 7. Retourner la réponse de la Cloud Function
        return Response({
            "status_code": response.status_code,
            "firebase_response": response.json()
        })
   

class TicketListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            user = None

            # Case 1: request.user is just an email string
            if isinstance(request.user, str):
                user = Admin.objects.filter(email=request.user).first()
                if not user:
                    return Response(
                        {"message": "User not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            # Case 2: request.user is already an Admin object
            else:
                user = request.user

            # Now user is guaranteed to be an Admin instance
            if user.is_superuser or user.is_staff:
                tickets = models.Ticket.objects.all()
            else:
                tickets = models.Ticket.objects.filter(
                    event__organizer=user
                ).select_related("event", "customer")

            serializer = serializers.TicketWebSerializer(
                tickets, many=True, context={"request": request}
            )
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            print("ERROR:", str(e))
            traceback.print_exc()  # will give full error in console
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TicketCreateView(APIView):
  permission_classes = [IsAuthenticated]
  def post(self, request):
    try:
      serializer = serializers.TicketWebSerializer(data=request.data, context={'request': request})
      if serializer.is_valid():
        serializer.save()
        return Response({"data": serializer.data}, status=status.HTTP_201_CREATED)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
      return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TicketDeleteView(APIView):
  permission_classes = [IsAuthenticated]
  def delete(self, request, ticket_id):
    try:
      ticket = models.Ticket.objects.filter(id=ticket_id)
      if not ticket:
        return Response({"message": "No ticket found"}, status=status.HTTP_404_NOT_FOUND)
      ticket.delete()
      return Response({"message": "Event deleted successfully"}, status=status.HTTP_200_OK)
    except models.Ticket.DoesNotExist:
      return Response({"error": "No data found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
      return Response({"error": "Server error"}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR
                      )

class TicketUpdateView(APIView):
  permission_classes= [IsAuthenticated]
  def update(self, request, ticket_id):
    try:
      ticket = models.Ticket.objects.filter(id=ticket_id)
      if not ticket:
        return Response({"message": "no data found"}, status=status.HTTP_404_NOT_FOUND)
      serializer = serializers.TicketWebSerializer(ticket, data=request.data, partial=True)
      if serializer.is_valid():
        serializer.save()
        return Response({"message": "Ticket updated successfully", "data": serializer.data}, 
                        status=status.HTTP_200_OK)
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:  
      return Response({"error": "Server error"}, 
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR
                      )

class EventSiteLocationsInsertView(APIView):
   permission_classes = [IsAuthenticated]

   def post(self, request):
      try:
        
        data = request.data.copy()
       

        serializer = EventSiteLocationsSerializer(data=data)

        if serializer.is_valid():
          eventSiteLoc = serializer.save()
          return Response({"message": "event location added successfully"}, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      except Admin.DoesNotExist:
         return Response({'error': 'No user found'}, status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print(str(e))
         return Response({"error": "Failed to save venue, server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VenuePlanInsertView(APIView):
   permission_classes = [IsAuthenticated]

   def post(self, request):
      try:
        organizer = Admin.objects.get(email=request.user)
        data = request.data.copy()
        data['organizer'] = organizer.id

        serializer = VenuePlanSerializer(data=data)

        if serializer.is_valid():
          serializer.save()
          return Response({"message": "Venue added successfully"}, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      except Admin.DoesNotExist:
         return Response({'error': 'No user found'}, status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print(str(e))
         return Response({"error": "Failed to save venue, server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EventSiteView(APIView):
   permission_classes = [IsAuthenticated]
   def get(self, request):
     try:
        user_email = str(request.user)
        user = Admin.objects.get(email=user_email)
        if user.is_superuser or user.is_staff:
          eventSite = EventPlan.objects.all()
        else:
          eventSite = EventSite.objects.filter(organizer=user.id)
        serializer2=EventSiteSerializer(eventSite, many=True)
        # serializer = EventPlanSerializer(plans, many=True)
        return Response({'data': serializer2.data}, status=status.HTTP_200_OK)
     except Admin.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
     except Exception as e:
        print('error', str(e))
        return Response({'error': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EventPlanNewInsertion(APIView):
   def post(self, request):
      try:
        organizer = Admin.objects.get(email=request.user)
        data = request.data.copy()
        data_site = dict()
        data_eventPlan= dict()
        data_site['site_name'] = data.get('name', 'Default Site')
        data_site['organizer'] = organizer.id
        eventSite = EventSite.objects.get(site_name=data_site['site_name'])
        if eventSite:
         data_eventPlan['metadata'] = data
         data_eventPlan['site'] = eventSite.id
         eventPlanSerializer = EventPlanSerializer(data=data_eventPlan)
         if eventPlanSerializer.is_valid():
            eventPlanSerializer.save()
            return Response({"message": "Event added successfully", "data": eventPlanSerializer.data}, status=status.HTTP_201_CREATED)
        print(eventPlanSerializer.errors)
        return Response(eventPlanSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
      except Admin.DoesNotExist:
         return Response({'error': 'No user found'}, status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print(str(e))
         return Response({"error": "Failed to save venue, server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SelectedOragnizerEventPlanView(APIView):
   def get(self, request, org_id):
     try:
        user_email = str(request.user)
        user = Admin.objects.get(id=org_id)
        if user.is_superuser or user.is_staff:
          eventSite = EventPlan.objects.all()
        else:
          eventSite = EventSite.objects.filter(organizer=user.id)
        serializer2=EventSiteSerializer(eventSite, many=True)
        # serializer = EventPlanSerializer(plans, many=True)
        return Response({'data': serializer2.data}, status=status.HTTP_200_OK)
     except Admin.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
     except Exception as e:
        print('error', str(e))
        return Response({'error': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EventPlanView(APIView):
   permission_classes = [IsAuthenticated]
   def get(self, request,site_name):
     try:
        user_email = str(request.user)
        user = Admin.objects.get(email=user_email)

        if user.is_superuser or user.is_staff:
          plans = EventPlan.objects.all()
        else:
          print({})
          eventSite = EventSite.objects.get(organizer=user.id,site_name=site_name)
          plans = EventPlan.objects.filter(site=eventSite)
          # serializer2=EventPlanSerializer(eventSite)
        serializer = EventPlanSerializer(plans, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)
     except Admin.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
     except Exception as e:
        print('error', str(e))
        return Response({'error': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

   def post(self, request):
      try:
        organizer = Admin.objects.get(email=request.user)
        data = request.data.copy()
        data_site = dict()
        data_eventPlan= dict()
        data_site['site_name'] = data.get('name', 'Default Site')
        data_site['organizer'] = organizer.id

        
        serializer = EventSiteSerializer(data=data_site)

      

        if serializer.is_valid():
          site=serializer.save()
          data_eventPlan['metadata'] = data.get('metaData')
          data_eventPlan['site'] = site.id
          eventPlanSerializer = EventPlanSerializer(data=data_eventPlan)
          if eventPlanSerializer.is_valid():
            eventPlanSerializer.save()
            return Response({"message": "Event added successfully", "data": eventPlanSerializer.data}, status=status.HTTP_201_CREATED)
          print(eventPlanSerializer.errors)
          return Response(eventPlanSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      except Admin.DoesNotExist:
         return Response({'error': 'No user found'}, status=status.HTTP_404_NOT_FOUND)
      except Exception as e:
         print(str(e))
         return Response({"error": "Failed to save venue, server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class EventPlanView(APIView):
 


class VenuPlanView(APIView):
  def get(self, request):
     try:
        user_email = str(request.user)
        user = Admin.objects.get(email=user_email)

        if user.is_superuser or user.is_staff:
          plans = VenuePlan.objects.all()
        else:
          plans = VenuePlan.objects.filter(organizer=user)
        serializer = VenuePlanSerializer(plans, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)
     except Admin.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
     except Exception as e:
        print('error', str(e))
        return Response({'error': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VenuePlanDeleteView(APIView):
   def delete(self, request, pk):
      if not pk:
         print('No selected id')
         return Response({'error': 'No venue plan was selected'}, status=status.HTTP_406_NOT_ACCEPTABLE)
      try:
        venue_Plan = EventPlan.objects.get(id=pk)
        if not venue_Plan:
           return Response({'message': 'venue plan not found'}, status=status.HTTP_404_NOT_FOUND)
        venue_Plan.delete()
        return Response({'message': 'Venue plan deleted successfully'}, status=status.HTTP_200_OK)
      except Exception as e:
         return Response({'error': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

class VenuePlanUpdateView(APIView):
    def put(self, request, pk):
        print('received data', request.data)
        venue = get_object_or_404(VenuePlan, id=pk)
        user = Admin.objects.get(email=request.user)
        data = request.data.copy()
        data['organizer'] = user.id
        site_name = request.data.get('site_name', '')
        if site_name == '':
          data['site_name'] = venue.site_name
        serializer = VenuePlanSerializer(venue, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from rest_framework.pagination import PageNumberPagination
class FoodPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class FoodItemListCreateView(APIView):

    def get(self, request):
        foods = FoodItem.objects.all().order_by("-id")

        paginator = FoodPagination()
        result_page = paginator.paginate_queryset(foods, request)

        serializer = FoodItemCreateSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = FoodItemCreateSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()
            print(serializer.data)
            return Response(serializer.data, status=201)
        print(serializer.errors)
        return Response(serializer.errors, status=400)



# mobile
class EventListView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request):
        # Récupérer les paramètres de pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        event_type = request.query_params.get('type', 'recent')
        
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        
        if event_type == 'recent':
            events = Event.objects.filter(date__gte=timezone.now()).order_by('date')[start_index:end_index]
        elif event_type == 'old':
            events = Event.objects.filter(date__lt=timezone.now()).order_by('-date')[start_index:end_index]
        else:
            events = Event.objects.all().order_by('-date')[start_index:end_index]
        
        # Utiliser le nouveau sérialiseur avec le contexte de requête
        serializer = Event_Serializer(events, many=True, context={'request': request})
        
        # Calculer correctement has_more
        total_count = 0
        if event_type == 'recent':
            total_count = Event.objects.filter(date__gte=timezone.now()).count()
        elif event_type == 'old':
            total_count = Event.objects.filter(date__lt=timezone.now()).count()
        else:
            total_count = Event.objects.all().count()
            
        has_more = (page * page_size) < total_count
        
        return Response({
            'events': serializer.data,
            'page': page,
            'page_size': page_size,
            'has_more': has_more
        })

class HomeEventListView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request):
        recent_events = Event.objects.filter(date__gte=timezone.now()).order_by('date')[:6]
        old_events = Event.objects.filter(date__lt=timezone.now()).order_by('-date')[:6]
        
        # Utiliser le nouveau sérialiseur
        return Response({
            'recent': Event_Serializer(recent_events, many=True, context={'request': request}).data,
            'old': Event_Serializer(old_events, many=True, context={'request': request}).data,
        })

class EventDetailView(RetrieveAPIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes     = [IsCustomerAuthenticated]
    queryset               = Event.objects.all()
    serializer_class       = Event_Serializer 


class MyTicketsAPIView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes     = [IsCustomerAuthenticated]

    def get(self, request):
        # Filtrer seulement les tickets non utilisés
        tickets    = Ticket.objects.filter(customer=request.user, is_used=False)
        serializer = TicketSerializer(tickets, many=True, context={'request': request})
        return Response(serializer.data)


class MobileSeatIdsByEventAPIView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request, event_id: int):
        seat_ids = list(
            Ticket.objects
            .filter(event_id=event_id, seat_id__isnull=False)
            .exclude(seat_id='')
            .values_list('seat_id', flat=True)
        )
        return Response({"event_id": event_id, "seat_ids": seat_ids})

class EventPlanNewInsertionCustomer(APIView):
   authentication_classes = [UUIDAuthentication]
   permission_classes = [IsCustomerAuthenticated]
   def post(self, request):
      try:
        # organizer = Admin.objects.get(email=request.user)
        data = request.data.copy()
        data_site = dict()
        data_eventPlan= dict()
        data_site['site_name'] = data.get('name', 'Default Site')
        # data_site['organizer'] = organizer.id
        eventSite = EventSite.objects.get(site_name=data_site['site_name'])
        if eventSite:
         data_eventPlan['metadata'] = data
         data_eventPlan['site'] = eventSite.id
         eventPlanSerializer = EventPlanSerializer(data=data_eventPlan)
         if eventPlanSerializer.is_valid():
            eventPlanSerializer.save()
            return Response({"message": "Event added successfully", "data": eventPlanSerializer.data}, status=status.HTTP_201_CREATED)
        print(eventPlanSerializer.errors)
        return Response(eventPlanSerializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
      except Exception as e:
         print(str(e))
         return Response({"error": "Failed to save venue, server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class BuyTicketView(APIView):
    """
    Achète un ou plusieurs tickets pour un event / tier donné.
    Supporte l'achat de plusieurs sièges différents en une seule transaction.
    Bloque l'achat si tickets_sold >= capacité initiale ou si siège déjà réservé.
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def post(self, request, *args, **kwargs):
        event_id = request.data.get('event_id')
        tier_id = request.data.get('tier_id')
        seat_id = request.data.get('seat_id')
        quantity = int(request.data.get('quantity', 1))  # Nouveau paramètre pour la quantité

        if not event_id or not tier_id:
            return Response({"detail": "event_id et tier_id sont requis."},
                            status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            return Response({"detail": "La quantité doit être supérieure à 0."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Lock event
                event = Event.objects.select_for_update().get(id=event_id)

                # Lock all tiers to calculate remaining tickets safely
                total_remaining = (
                    PriceTier.objects
                    .select_for_update()
                    .filter(event=event)
                    .aggregate(total=Sum('available_quantity'))['total'] or 0
                )

                initial_capacity = (event.tickets_sold or 0) + (total_remaining or 0)

                if (event.tickets_sold or 0) >= initial_capacity:
                    return Response(
                        {"detail": "Événement sold out (capacité atteinte)."},
                        status=status.HTTP_409_CONFLICT
                    )

                # récupère et lock le tier spécifique
                tier = PriceTier.objects.select_for_update().get(id=tier_id, event=event)

                if tier.available_quantity < quantity:
                    return Response(
                        {"detail": f"Stock insuffisant. Seulement {tier.available_quantity} tickets disponibles pour ce type."},
                        status=status.HTTP_409_CONFLICT
                    )

                # calcule next ticket_number de façon sûre
                last_ticket = (
                    Ticket.objects.select_for_update()
                    .filter(event=event)
                    .order_by('-ticket_number')
                    .first()
                )
                next_ticket_number = 1 if not last_ticket else last_ticket.ticket_number + 1

                # Decrement tier quantity and increment sold tickets
                tier.available_quantity = F('available_quantity') - quantity
                tier.save(update_fields=['available_quantity'])

                event.tickets_sold = F('tickets_sold') + quantity
                event.save(update_fields=['tickets_sold'])

                # Create tickets
                tickets = []
                for i in range(quantity):
                    ticket = Ticket.objects.create(
                        admin=None,
                        customer=request.user,
                        event=event,
                        ticket_number=next_ticket_number + i,
                        seat_id=seat_id
                    )
                    tickets.append(ticket)

                # Refresh DB values
                tier.refresh_from_db()
                event.refresh_from_db()

                total_remaining_after = (
                    PriceTier.objects.filter(event=event).aggregate(total=Sum('available_quantity'))['total'] or 0
                )
                sold_out = (total_remaining_after <= 0)

                return Response({
                    "tickets": [{
                        "id": ticket.id,
                        "ticket_number": ticket.ticket_number,
                        "ticket_code": str(ticket.ticket_code)
                    } for ticket in tickets],
                    "quantity": quantity,
                    "total_price": float(tier.price) * quantity,
                    "remaining_quantity_for_tier": tier.available_quantity,
                    "total_remaining_for_event": total_remaining_after,
                    "sold_out": sold_out
                }, status=status.HTTP_201_CREATED)

        except Event.DoesNotExist:
            return Response({"detail": "Événement non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        except PriceTier.DoesNotExist:
            return Response({"detail": "Type de ticket non trouvé pour cet événement."}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError:
            return Response({"detail": "Erreur de concurrence, réessayez."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PreviewTicketView(APIView):
    """
    API pour prévisualiser un ticket via son code QR sans le valider
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def post(self, request):
        qr_data = request.data.get('qr_data')
        
        if not qr_data:
            return Response({"error": "QR code data required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Chercher le ticket par son code UUID
            ticket = get_object_or_404(Ticket, ticket_code=qr_data)
            location = ticket.event.eventlocation_set.first()

            # Vérifier si le ticket est valide sans le marquer comme utilisé
            if ticket.is_used:
                return Response({
                    "success": False,
                    "message": "Ticket déjà utilisé",
                    "ticket": {
                        "id": ticket.id,
                        "event_name": ticket.event.name,
                        "ticket_number": ticket.ticket_number,
                        "customer_name": f"{ticket.customer.first_name} {ticket.customer.last_name}" if ticket.customer else "N/A",
                        "event_date": ticket.event.date,
                        "venue": ticket.event.venue,
                        "seat_id": ticket.seat_id,
                        "event_image": request.build_absolute_uri(ticket.event.image.url) if ticket.event.image else None,
                        "ticket_code": str(ticket.ticket_code)
                    }
                })
                
            if ticket.is_expired():
                return Response({
                    "success": False,
                    "message": "Ticket expiré",
                    "ticket": {
                        "id": ticket.id,
                        "event_name": ticket.event.name,
                        "ticket_number": ticket.ticket_number,
                        "customer_name": f"{ticket.customer.first_name} {ticket.customer.last_name}" if ticket.customer else "N/A",
                        "event_date": ticket.event.date,
                        "venue": ticket.event.venue,
                        "seat_id": ticket.seat_id,
                        "event_image": request.build_absolute_uri(ticket.event.image.url) if ticket.event.image else None,
                        "ticket_code": str(ticket.ticket_code)
                    }
                })
                
            # Ticket valide pour prévisualisation
            return Response({
                "success": True,
                "message": "Ticket valide",
                "ticket": {
                    "id": ticket.id,
                    "event_name": ticket.event.name,
                    "ticket_number": ticket.ticket_number,
                    "customer_name": f"{ticket.customer.first_name} {ticket.customer.last_name}" if ticket.customer else "N/A",
                    "event_date": ticket.event.date,
                    "venue": location.location_name,
                    "seat_id": ticket.seat_id,
                    "event_image": request.build_absolute_uri(ticket.event.image.url) if ticket.event.image else None,
                    "ticket_code": str(ticket.ticket_code)
                }
            })
                
        except ValueError:
            return Response({
                "success": False,
                "message": "Format de code QR invalide"
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Erreur lors de la prévisualisation: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ValidateTicketView(APIView):
    """
    API pour valider définitivement un ticket via son code QR
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def post(self, request):
        qr_data = request.data.get('qr_data')
        
        if not qr_data:
            return Response({"error": "QR code data required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Chercher le ticket par son code UUID
            ticket = get_object_or_404(Ticket, ticket_code=qr_data)
            
            # Valider le ticket et le marquer comme utilisé
            success, message = ticket.validate_ticket()
            
            if success:
                return Response({
                    "success": True,
                    "message": message,
                    "ticket": {
                        "id": ticket.id,
                        "event_name": ticket.event.name,
                        "ticket_number": ticket.ticket_number,
                        "customer_name": f"{ticket.customer.first_name} {ticket.customer.last_name}" if ticket.customer else "N/A",
                        "event_date": ticket.event.date,
                        "venue": ticket.event.venue,
                        "seat_id": ticket.seat_id,
                        "event_image": request.build_absolute_uri(ticket.event.image.url) if ticket.event.image else None
                    }
                })
            else:
                return Response({
                    "success": False,
                    "message": message,
                    "ticket": {
                        "id": ticket.id,
                        "event_name": ticket.event.name if ticket.event else "N/A",
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError:
            return Response({
                "success": False,
                "message": "Format de code QR invalide"
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Erreur lors de la validation: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class LikeEventView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            user = request.user
            
            if event.likes.filter(id=user.id).exists():
                event.likes.remove(user)
                liked = False
            else:
                event.likes.add(user)
                liked = True
                
            return Response({
                'liked': liked,
                'likes_count': event.likes.count()
            })
            
        except Event.DoesNotExist:
            return Response({"detail": "Événement non trouvé."}, status=status.HTTP_404_NOT_FOUND)

class EventlocationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        event_id = request.data.get('event_id')
        location = request.data.get('location')
        try:
            event = Event.objects.get(id=event_id)
            if event:
               location = {
                'event':event_id,
                'location_name':location['name'],
                'latitude': location['lat'],
                'longitude': location['lon'],
              }
               eventLocationSerilizer = EVentLocationSerializer(data=location)
               if eventLocationSerilizer.is_valid():
                    eventLocationSerilizer.save()
            print("Event location insertion success:", location)
            return Response({"message":"eventLocation insertion success","data":location})
        except Event.DoesNotExist:
            return Response({"detail": "Événement non trouvé."}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            location = {
                'venue': event.venue,
                'address': event.address,
                'city': event.city,
                'country': event.country,
                'latitude': event.latitude,
                'longitude': event.longitude,
            }
            return Response(location)
        except Event.DoesNotExist:
            return Response({"detail": "Événement non trouvé."}, status=status.HTTP_404_NOT_FOUND)

class RateEventView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def post(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            user = request.user
            rating_value = request.data.get('rating')
            
            if not rating_value or not (1 <= int(rating_value) <= 5):
                return Response({"detail": "La note doit être entre 1 et 5."}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Créer ou mettre à jour la notation
            event_rating, created = EventRating.objects.get_or_create(
                event=event, 
                customer=user,
                defaults={'rating': rating_value}
            )
            
            if not created:
                event_rating.rating = rating_value
                event_rating.save()
            
            # Mettre à jour la note moyenne
            event.update_rating(int(rating_value))
            
            return Response({
                'rating': rating_value,
                'average_rating': event.average_rating,
                'total_ratings': event.total_ratings
            })
            
        except Event.DoesNotExist:
            return Response({"detail": "Événement non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        
class UsedTicketsAPIView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes     = [IsCustomerAuthenticated]

    def get(self, request):
        # Filtrer seulement les tickets utilisés
        tickets    = Ticket.objects.filter(customer=request.user, is_used=True)
        serializer = TicketSerializer(tickets, many=True, context={'request': request})
        return Response(serializer.data)
    
class EventPriceTiersView(APIView):
    """
    API pour récupérer les price tiers d'un événement spécifique
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            price_tiers = PriceTier.objects.filter(event=event)
            
            serializer = PriceSerializer(price_tiers, many=True)
            
            return Response({
                'event_id': event.id,
                'event_name': event.name,
                'price_tiers': serializer.data
            })
            
        except Event.DoesNotExist:
            return Response(
                {"detail": "Événement non trouvé."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Erreur serveur: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CustomerVenuePlansView(APIView):
    """
    API pour récupérer les plans de salle accessibles aux clients
    Filtrage par nom de site ou lieu d'événement
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request):
        try:
            # Récupérer le paramètre de recherche
            search_query = request.query_params.get('search', '').lower()
            venue_plans = VenuePlan.objects.all()
            
            if search_query:
                # Filtrer les plans dont le nom de site contient la recherche
                # ou qui correspondent au lieu d'un événement
                venue_plans = venue_plans.filter(
                    Q(site_name__icontains=search_query) |
                    Q(site_name__in=Event.objects.filter(
                        venue__icontains=search_query
                    ).values_list('venue', flat=True))
                )
            
            serializer = VenuePlanSerializer(venue_plans, many=True)
            
            return Response({
                'count': venue_plans.count(),
                'venue_plans': serializer.data
            })
            
        except Exception as e:
            return Response(
                {"detail": f"Erreur lors de la récupération des plans: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
  
class MobileEventLikes(APIView):
     authentication_classes = [UUIDAuthentication]
     permission_classes = [IsCustomerAuthenticated]
    
     def post(self, request):
        try:
            event = Event.objects.get(id=request.data.get('event_id'))
            user = request.data.get('customer_id')
            
            if event.likes.filter(customer=user).exists():
                event.likes.remove(user)
                liked = False
            else:
                event.likes.add(user)
                liked = True
                
            return Response({
                'liked': liked,
                'likes_count': event.likes.count()
            })
            
        except Event.DoesNotExist:
            return Response({"detail": "Événement non trouvé."}, status=status.HTTP_404_NOT_FOUND)
   
class MobileEventPlansView(APIView):
    """
    API pour récupérer les plans de salle accessibles aux clients
    Filtrage par nom de site ou lieu d'événement
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request):
     try:
        search_query = request.query_params.get('search', '').lower()

        if search_query:
            eventSite = EventSite.objects.get(site_name=search_query)
            plans = EventPlan.objects.filter(site=eventSite)
            # serializer2=EventPlanSerializer(eventSite)
        serializer = EventPlanSerializer(plans, many=True)
        return Response({'data': serializer.data}, status=status.HTTP_200_OK)
     except Admin.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
     except Exception as e:
        print('error', str(e))
        return Response({'error': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FutureEventLocationListAPIView(APIView):
    # authentication_classes = [UUIDAuthentication]
    # permission_classes = [IsCustomerAuthenticated]
    """
    Retrieve all future Event Locations (date >= now).
    """
    def get(self, request):
      try:
        now = timezone.now()
        events = ViewEventLocation.objects.filter(date__gte=now).order_by('date')
        serializer = ViewEventLocationSerializer(events, many=True)
        return Response({'data':serializer.data}, status=status.HTTP_200_OK)
      except Exception as e:
          return Response({"detail": f"Erreur serveur: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MvolaView(APIView):
   
   def get (self,request):
      try:
         mv=MvolaClass()
         token=mv.get_access_token()
         mv.initiate_payment(token)
         return Response({'data':token}, status=status.HTTP_200_OK)
      except Exception as e:
        return Response({"detail": f"Erreur serveur: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

logger = logging.getLogger(__name__)

# @method_decorator(csrf_exempt, name="dispatch")
# class MvolaCallbackView(APIView):
#     authentication_classes: list = []          # no auth for webhook
#     permission_classes = [AllowAny]

#     def _handle(self, request):
#         # Try DRF parsing first
#         try:
#                 raw = request.body
#                 data = json.loads(str(raw))
#                 metyve=request.data
#                 print("Metyve data:", metyve)
#                 print("Callback received:", data)
#         except Exception:
#               data = {"raw_body": request.body.decode("utf-8", errors="ignore")}
#               print("Error parsing MVola callback:", data)
#         logger.info("MVola callback: %s", data)

#         transaction_status = data.get("transactionStatus")
#         amount = data.get("amount")
#         transaction_ref = (
#             data.get("transactionReference")
#             or data.get("originalTransactionReference")
#             or data.get("requestingOrganisationTransactionReference")
#         )
#         print("MVola callback received:", transaction_ref, transaction_status, amount)
#         # TODO: update DB with transaction_ref, transaction_status, amount

#         # Return plain OK to avoid proxy quirks
#         return HttpResponse("OK", content_type="text/plain", status=200)

#     def put(self, request):
#         raw = request.data# bytes
#         # print("MVola Callback PUT received",args,kwargs)
#         print("RAW REQUEST BODY:", raw)
#         try:
#             return self._handle(request)
#         except Exception as e:
#             logger.exception("Error handling MVola PUT callback")
#             return HttpResponse("OK", content_type="text/plain", status=200)  # still acknowledge

#     def post(self, request, *args, **kwargs):
#         return self.put(request, *args, **kwargs)