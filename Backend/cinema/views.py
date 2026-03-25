from django.http import JsonResponse
from .models import (
    Movie,
    Cinema,
    CinemaHall,
    RestaurantItemCategory,
    Seat,
    MovieSession,
    Ticket,
    MovieLike,
    Comment,
    SavedItem,
    Reservation,
    RestaurantItem,
    FoodOrder,
    FoodOrderItem,
    Payment,
)
from api.models import Event, EventRating
from accounts.models import Customer, Admin
from rest_framework import viewsets
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    MovieSerializer,
    CommentSerializer,
    EventFeedSerializer,
    MovieFeedSerializer,
    RestaurantItemCategorySerializer,
    TicketCommandSerializer,
)
from rest_framework import status, generics
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    MovieSerializer,
    CinemaSerializer,
    CinemaWithHallsSerializers,
    MovieWithSessionSerializer,
    MovieSessionSerializer,
    MovieMobileSerializer,
    MovieSessionMobileSerializer,
    ReservationSerializer,
    RestaurantItemSerializer,
    CalendarEventSerializer,
    CalendarMovieSerializer,
)
from api.auth import UUIDAuthentication
from rest_framework.decorators import api_view, permission_classes, parser_classes
from api.permissions import IsCustomerAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db import transaction
import json
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.authentication import JWTAuthentication
from .orgSerializers import (
    SnackItemCreateSerializer,
    SnackItemListSerializer,
    TicketListSerializer,
    PromoCodeCreateSerializer,
    historiqueStockSerializer,
)
from decimal import Decimal
from django.db import models 


@api_view(['GET'])
def test_get_all_events(request):
    events = Event.objects.all()
    serializer = EventFeedSerializer(events, many=True)
    return JsonResponse(serializer.data, safe=False)

class MovieInserttView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            print("received data", request.data)
            print("user", request.user)
            email = str(request.user)
            user = Admin.objects.get(email=email)

            serializer = MovieSerializer(data=request.data)

            if serializer.is_valid():
                movie = serializer.save(created_by=user)

                return Response(
                    {
                        "message": "Movie created successfully",
                        "data": MovieSerializer(movie).data,
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                print(serializer.errors)
                return Response(
                    {"error": "Validation failed  ", "data": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Admin.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"server error {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CinemaAddView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("user", request.user)
        print("received data", request.data)
        serializer = CinemaSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            try:
                cinema = serializer.save()
                return Response(
                    {"message": "Cinema added successfully", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                print(e)
                return Response(
                    {"error": "failed to save data"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CinemaListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        try:
            cinemas = Cinema.objects.all()
            serializer = CinemaSerializer(
                cinemas, many=True, context={"request": request}
            )
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({"error": f"{str(e)}"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_halls_seats(request):
    if not request.user:
        return Response({"message": "User not authentificated"})
    try:
        print("received data", request.data)
        cinema_id_req = request.data.get("cinema")
        cinema = Cinema.objects.get(id=cinema_id_req)
        name = request.data.get("name")
        screen_type = request.data.get("screen_type")
        base_price = request.data.get("base_price")
        rows = request.data.get("rows")
        cols = request.data.get("cols")
        disabledSeats = request.data.get("disabledSeats")
        VIPSeats = request.data.get("VIPSeats")

        if not all([cinema_id_req, name, screen_type, rows, cols]):
            return Response(
                {"message": "All field are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cinemaHall = CinemaHall.objects.create(
            cinema=cinema, name=name, screen_type=screen_type, base_price=base_price
        )
        seat = Seat.objects.create(
            hall=cinemaHall,
            rows=str(rows),
            cols=str(cols),
            disabledSeats=disabledSeats,
            VIPSeats=VIPSeats,
            totalSeats=str(rows * cols),
        )
        cinemaHall.save()
        seat.save()
        return Response(
            {"message": "Data saved successfully"}, status=status.HTTP_201_CREATED
        )
    except Exception as e:
        print(str(e))
        return Response(
            {"error": f"{str(e)}, Server error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class CinemaDeleteView(APIView):
    def delete(self, request, id):
        if not id:
            return Response(
                {"error": "No id selected"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            print("selected id", id)
            cinema = Cinema.objects.get(id=id)
            print("cinema to delete", cinema.name)
            try:
                cinema.delete()
                return Response(
                    {"message": "cinema delete successfully"}, status=status.HTTP_200_OK
                )
            except Exception as inner_e:
                print("inner error", inner_e)
                return Response(
                    {"error": "Failed to delete cinema"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        except Cinema.DoesNotExist:
            return Response(
                {"error": "Cinema not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": "Failed to delete cinema"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CinemaHallUpdateView(APIView):
    def put(self, request, hall_id):
        if not hall_id:
            return Response(
                {"error": "No id selectedd"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            print("selected id", hall_id)
            print("received data", request.data)
            hall = CinemaHall.objects.get(id=hall_id)
            hall.name = request.data.get("name", hall.name)
            hall.screen_type = request.data.get("screen_type", hall.screen_type)
            try:
                seat = Seat.objects.get(hall_id=hall_id)
                seat.rows = request.data.get("rows", seat.rows)
                seat.cols = request.data.get("cols", seat.cols)
                seat.disabledSeats = request.data.get(
                    "disabledSeats", seat.disabledSeats
                )
                seat.VIPSeats = request.data.get("VIPSeats", seat.VIPSeats)
                hall.save()
                seat.save()

                return Response(
                    {"message": "Hall and seat updates successfully"},
                    status=status.HTTP_200_OK,
                )
            except Seat.DoesNotExist:
                return Response(
                    {"message": "Seat not found"}, status=status.HTTP_404_NOT_FOUND
                )
        except CinemaHall.DoesNotExist:
            return Response(
                {"message": "cinema hall not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"error {str(e)}")
            return Response(
                {"error": "Failed to do the action"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CinemaWithHallsListView(APIView):
    def get(self, request, cinema_id):
        try:
            cinema = Cinema.objects.get(id=cinema_id)
            serializer = CinemaWithHallsSerializers(cinema)
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Cinema.DoesNotExist:
            return Response(
                {"error": "Data not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CinemaHallView(APIView):
    def get(self, request):
        try:
            hall = Cinema.objects.all()
            serializer = CinemaWithHallsSerializers(hall, many=True)
            return Response(
                {"messege": "Data fetched", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print(f"Error fetching halls {str(e)}")
            return Response(
                {"error": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MovieSessionBluckCreateView(APIView):
    def post(self, request):
        sessions_data = request.data
        if not isinstance(sessions_data, list):
            return Response(
                {"error": "Excepted a list of sessions"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            print("data received", sessions_data)
            serializer = MovieSessionSerializer(data=sessions_data, many=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Movie sessions successfully added"})
            else:
                print(serializer.errors)
                return Response(
                    {"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            print(f"server error {str(e)}")
            return Response(
                {"error": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MoviesListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            email = str(request.user)
            user = Admin.objects.get(email=email)

            if user.role == "organizer":
                movies = Movie.objects.filter(
                    Q(created_by_id=user.id) | Q(sessions__hall__cinema__organizer=user)
                ).distinct()
            elif user.is_superuser:
                movies = Movie.objects.all()
            else:
                return Response({
                    'success': False,
                    'message': 'This user is not authorzed to do this acton',
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            serializer = MovieWithSessionSerializer(movies, many=True)
            print('movies', serializer.data)
            return Response(
                {"message": "Movies fetched successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )

        except Admin.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error to fetch movie {str(e)}")
            return Response(
                {"error": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MovieSessionDetailView(APIView):
    def get(self, request, id):
        if not id:
            return Response(
                {"error": "No selcted id"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            session = MovieSession.objects.get(movie=id)
            serializer = MovieSessionSerializer(data=session)
            if serializer.is_valid():
                return Response(
                    {"message": "Data found", "data": serializer.data},
                    status=status.HTTP_200_OK,
                )
            else:
                print(serializer.errors)
                return Response(
                    {"error": "Failed to fetch session movie"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        except MovieSession.DoesNotExist:
            return Response(
                {"message": "data not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error to fetched movie session {str(e)}")
            return Response(
                {"error": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MovieDeleteView(APIView):
    def delete(self, request, id):
        if not id:
            return Response(
                {"error": "No movie selected"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            movie = Movie.objects.get(id=id)
            print("Movie to delete", movie)
            try:
                movie.delete()
                return Response(
                    {"message": "Movie deleted successfully"}, status=status.HTTP_200_OK
                )
            except Exception as inner_e:
                print(f"Error {str(inner_e)}")
                return Response(
                    {"error": "Failed to delete movie"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        except Movie.DoesNotExist:
            return Response(
                {"error": "Movie selected not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Error {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MovieUpdateView(APIView):
    def put(self, request, id):
        if not id:
            return Response(
                {"error": "No movie was selected"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            movie = Movie.objects.get(id=id)
            movie.title = request.data.get("title", movie.title)
            movie.genre = request.data.get("genre", movie.genre)
            movie.description = request.data.get("description", movie.description)
            movie.default_image = request.data.get("default_image", movie.default_image)
            movie.director = request.data.get("director", movie.director)
            movie.duration = request.data.get("duration", movie.duration)
            movie.poster = request.data.get("poster", movie.poster)
            movie.trailer_url = request.data.get("trailer_url", movie.trailer_url)
            movie.cast = request.data.get("cast", movie.cast)
            movie.save()
            return Response(
                {"message": "Movie updated successfully"}, status=status.HTTP_200_OK
            )
        except Movie.DoesNotExist:
            return Response(
                {"error": "selected movie not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Failed to update {str(e)}")
            return Response(
                {"error": "Failed to update movie"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class OrganizerCinemaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(f"[User] {request.user}")
        try:
            user = Admin.objects.get(email=request.user)
            cinema = Cinema.objects.filter(organizer_id=user.id)
            serializer = CinemaSerializer(cinema, many=True)
            print(f"data {serializer.data}")
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Cinema.DoesNotExist:
            return Response(
                {"message": "Cinema not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": "Failed to get cinema"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class SelectedOrganizerCinemaView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, org_id):
        print(f"[User] {request.user}")
        try:
            user = Admin.objects.get(id=org_id)
            cinema = Cinema.objects.filter(organizer_id=user.id)
            serializer = CinemaSerializer(cinema, many=True)
            print(f"data {serializer.data}")
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Cinema.DoesNotExist:
            return Response(
                {"message": "Cinema not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": "Failed to get cinema"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class SelectedOrganizerHall(APIView):
    def get(self, request, org_id):
        try:
            user = Admin.objects.get(id=org_id)
        except Admin.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if user.role == "organizer":
            cinemas = Cinema.objects.filter(organizer=user)
        else:
            cinemas = Cinema.objects.all()

        serializer = CinemaWithHallsSerializers(cinemas, many=True)
        print("data", serializer.data)
        return Response(
            {"message": "Data fetched", "data": serializer.data}, status=200
        )
    
class OrganizerCinemaHall(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            user = Admin.objects.get(email=request.user)
        except Admin.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if user.role == "organizer":
            cinemas = Cinema.objects.filter(organizer=user)
        else:
            cinemas = Cinema.objects.all()

        serializer = CinemaWithHallsSerializers(cinemas, many=True)
        print("data", serializer.data)
        return Response(
            {"message": "Data fetched", "data": serializer.data}, status=200
        )

class ConcessionAddStockView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, pk):
        print("Received PK:", pk)
        # if not pk:
        #     return Response(
        #         {"error": "No selected data found"}, status=status.HTTP_401_UNAUTHORIZED
        #     )
        try:
            concenssion = RestaurantItem.objects.get(id=pk)
            additional_quantity = int(request.data.get("quantity", 0))
            if additional_quantity <= 0:
                return Response(
                    {"error": "Quantity must be greater than zero"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            concenssion.addition_stock(additional_quantity)

            data_historique = historiqueStockSerializer(data={
                "item": concenssion.id,
                "quantity": additional_quantity,
                "is_addition": True
            })
            if data_historique.is_valid():
                data_historique.save()

            return Response(
                {"message": "Stock updated successfully"},
                status=status.HTTP_200_OK,
            )
        except RestaurantItem.DoesNotExist:
            return Response(
                {"error": "Concenssion not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"error -> {str(e)}")
            return Response(
                {"error": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ConcenssionCreateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            print("received data", request.data)
            user = Admin.objects.get(email=request.user)
            concenssion = request.data
            serializer = SnackItemCreateSerializer(data=concenssion)

            if serializer.is_valid():
                print("concenssion saved successfully")
                concenssion = serializer.save(created_by=user)
                print("Concenssion created:", concenssion.id)
                data_historique = historiqueStockSerializer(data={
                    "item": concenssion.id,
                    "quantity": concenssion.stock,
                    "category": concenssion.category,
                    "is_addition": True
                })
                if data_historique.is_valid():
                    data_historique.save()
                return Response(
                    {"message": "Concenssion saved successfully"},
                    status=status.HTTP_201_CREATED,
                )
            else:
                print(serializer.errors)
                print("Missing some required field")
                return Response(
                    {"error": "Missing required field"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            print("FAiled to save data", str(e))
            return Response(
                {"error": "Failed to save data, server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SnackPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page = 100


class ConcenssionListView(APIView):
    def get(self, request):
        try:
            user = Admin.objects.get(email=request.user)

            concenssions = RestaurantItem.objects.filter(created_by=user.id).order_by(
                "-id"
            )

            paginator = SnackPagination()
            result_page = paginator.paginate_queryset(concenssions, request)
            serializer = SnackItemListSerializer(result_page, many=True)

            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            print(str(e))
            return Response(
                {"error": "Failed to fetch concenssion"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ConcenssionDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, pk):
        if not pk:
            return Response(
                {"error": "No selected id found"}, status=status.HTTP_404_NOT_FOUND
            )
        try:
            concenssion = RestaurantItem.objects.get(id=pk)
            concenssion.delete()

            return Response(
                {"message": "Concenssion deleted successfully"},
                status=status.HTTP_200_OK,
            )
        except RestaurantItem.DoesNotExist:
            return Response(
                {"error": "Selected concenssion not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            print(f"error -> {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ConcenssionUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def put(self, request, pk):
        if not pk:
            return Response(
                {"error": "No selected data found"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            concenssion = RestaurantItem.objects.get(id=pk)

            concenssion.name = request.data.get("name", concenssion.name)
            concenssion.description = request.data.get(
                "description", concenssion.description
            )
            concenssion.category = request.data.get("category", concenssion.category)
            concenssion.price = request.data.get("price", concenssion.price)
            concenssion.image = request.data.get("image_url", concenssion.image)
            concenssion.stock = request.data.get("stock",concenssion.stock)

            concenssion.save()

            return Response(
                {"message": "concenssion update successfully"},
                status=status.HTTP_200_OK,
            )
        except RestaurantItem.DoesNotExist:
            return Response(
                {"error": "Concenssion not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"error -> {str(e)}")
            return Response(
                {"error": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RestaurantItemCategoryView(APIView):
    def get(self, request):
        try:
            items = RestaurantItemCategory.objects.all()
            serializer = RestaurantItemCategorySerializer(items, many=True)
            return Response(
                {"message": "fetched successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print("error", str(e))
            return Response(
                {"error": "Failed to load data"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class TicketOrganizerView(APIView):
    def get(self, request):
        try:
            user_email = request.user
            user = Admin.objects.get(email=user_email)

            tickets = Ticket.objects.filter(
                session__movie__created_by=user.id
            ).select_related("session__movie", "customer")

            serializer = TicketListSerializer(tickets, many=True)
            return Response(
                {"message": "fetched successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )

        except Admin.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print("error", str(e))
            return Response(
                {"error": "Faield to load data"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TickeSoldUpcomingSessionView(APIView):
    def get(self, request):
        try:
            user_email = str(request.user)
            user = Admin.objects.get(email=user_email)

            now = timezone.now()

            tickets = Ticket.objects.filter(
                session__movie__created_by=user.id, session__start_time__gte=now
            ).select_related("session__movie", "customer")

            serializer = TicketListSerializer(tickets, many=True)
            return Response(
                {"message": "fetched successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )

        except Admin.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print("error", str(e))
            return Response(
                {"error": "Failed to load data"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class SessionSeatsWebView(APIView):

    def get(self, request, session_id):
        try:
            session = get_object_or_404(MovieSession, id=session_id)
            seats = Seat.objects.filter(hall=session.hall)
            individual_seats = []
            
            # Récupérer tous les tickets existants pour cette session
            existing_tickets = Ticket.objects.filter(
                session=session,
                status__in=['purchased', 'used', 'reserved']
            )
            
            # Créer un set des positions de sièges déjà pris
            taken_seat_positions = set()
            reserved_seat_positions = set()
            seat_ticket_map = {}  # Dictionary to map seat_id to ticket object
            
            for ticket in existing_tickets:
                # Vérifier si la réservation est expirée
                if ticket.status == 'reserved' and ticket.is_expired():
                    continue  # Ignorer les réservations expirées
                
                # Construire l'ID composite du siège
                seat_id = f"{ticket.seat_id}-{ticket.row}-{ticket.col}"
                taken_seat_positions.add(seat_id)

                # Store ticket in the map
                seat_ticket_map[seat_id] = ticket
                
                # Marquer les sièges réservés spécifiquement
                if ticket.status == 'reserved':
                    reserved_seat_positions.add(seat_id)
            
            for seat_config in seats:
                rows = int(seat_config.rows)
                cols = int(seat_config.cols)
                
                for row in range(rows):
                    for col in range(cols):
                        # Generate composite seat ID: "configId-row-col"
                        seat_id = f"{seat_config.id}-{row}-{col}"
                        
                        # Check if seat is taken using the set for faster lookup
                        is_taken = seat_id in taken_seat_positions
                        is_reserved = seat_id in reserved_seat_positions
                        ticket_obj = seat_ticket_map.get(seat_id)
                        
                        # Check if seat is disabled
                        disabled_seats = seat_config.disabledSeats or []
                        # Convertir les disabledSeats en format cohérent
                        disabled_seats_formatted = [f"{item}" for item in disabled_seats]
                        disabled = f"{row}-{col}" in disabled_seats_formatted
                        
                        # Check if seat is VIP
                        vip_seats = seat_config.VIPSeats or []
                        # Convertir les VIPSeats en format cohérent
                        vip_seats_formatted = [f"{item}" for item in vip_seats]
                        is_vip = f"{row}-{col}" in vip_seats_formatted
                        
                        # Calculer le prix réel du siège
                        base_price = float(session.base_price)
                        seat_price = base_price * float(seat_config.price_multiplier)
                        if is_vip:
                            seat_price *= 1.5  # Majoration VIP
                        
                        # Seat is available if not taken AND not disabled
                        is_available = not is_taken and not disabled
                        
                        individual_seats.append({
                            'id': seat_id,  # Composite ID: "configId-row-col"
                            'rows': str(row),
                            'cols': str(col),
                            'seat_type': seat_config.seat_type,
                            'price_multiplier': float(seat_config.price_multiplier),
                            'calculated_price': float(seat_price),  # Prix calculé
                            'is_available': is_available,
                            'is_vip': is_vip,
                            'is_disabled': disabled,
                            'is_reserved': is_reserved,
                            'ticket_id': ticket_obj.id if ticket_obj else None,  # Now correctly gets the ticket ID
                        })
            
            return Response({
                'session': MovieSessionMobileSerializer(session).data,
                'seats': individual_seats,
                'cinema_name': session.hall.cinema.name if session.hall.cinema else None,
                'cinema_city': session.hall.cinema.city if session.hall.cinema else None,
                'base_price': float(session.base_price)  # Prix de base pour les calculs
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in SessionSeatsView: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )      

class PromoCodeCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None): 
        try:
            print('received data', request.data)
            try:
                user = Admin.objects.get(email=request.user)
            except Admin.DoesNotExist:
                return Response(
                    {'error': 'Admin profile not found'}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            data = dict(request.data)
            data['organizer'] = user.id
            if pk:
                try:
                    session = MovieSession.objects.get(id=pk)
                    data['sessions'] = session.id 
                except MovieSession.DoesNotExist:
                    return Response(
                        {'error': 'Movie session not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            print('final data', data)
            serializer = PromoCodeCreateSerializer(
                data=data,
                context={'request': request} 
            )
        
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {'message': 'Promotion code successfully added', 'data': serializer.data},
                    status=status.HTTP_201_CREATED
                )
            else:
                print('Validation errors:', serializer.errors)
                return Response(
                    {'error': 'Invalid data', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            print('Error creating promo code:', str(e))
            return Response(
                {'error': 'Server error: ' + str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class PromoCodeCreateWithMovieView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None): 
        try:
            print('received data', request.data)
            try:
                user = Admin.objects.get(email=request.user)
            except Admin.DoesNotExist:
                return Response(
                    {'error': 'Admin profile not found'}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            data = dict(request.data)
            data['organizer'] = user.id
            if pk:
                try:
                    movie = Movie.objects.get(id=pk)
                    data['movie'] = movie.id 
                except MovieSession.DoesNotExist:
                    return Response(
                        {'error': 'Movie session not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            print('final data', data)
            serializer = PromoCodeCreateSerializer(
                data=data,
                context={'request': request} 
            )
        
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {'message': 'Promotion code successfully added', 'data': serializer.data},
                    status=status.HTTP_201_CREATED
                )
            else:
                print('Validation errors:', serializer.errors)
                return Response(
                    {'error': 'Invalid data', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            print('Error creating promo code:', str(e))
            return Response(
                {'error': 'Server error: ' + str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

from rest_framework import viewsets
from rest_framework.decorators import action


class TicketCommandsView(APIView):
    def get(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)
        serializer = TicketCommandSerializer(ticket)
    
        return Response({
            'success': True,
            'data': serializer.data
        })

    # mobile -----------------------------------------------------------------------------------------------------------------



class MovieListView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request):
        try:
            now = timezone.now()
            print(f"[DEBUG] Current time: {now}")
            print(f"[DEBUG] Request params: {request.GET}")
            
            # Récupère tous les films qui ont au moins une session future
            movies = Movie.objects.filter(
                sessions__start_time__gte=now
            ).distinct()
            
            print(f"[DEBUG] Initial movies count with future sessions: {movies.count()}")
            
            # Log des sessions futures pour debug
            from django.db import connection
            print(f"[DEBUG] SQL query: {str(movies.query)}")
            
            # Filtrage par date si spécifié
            date_filter = request.GET.get('date_filter', None)
            if date_filter:
                today = timezone.now().date()
                print(f"[DEBUG] Date filter: {date_filter}, Today: {today}")
                
                if date_filter == 'today':
                    movies_today = movies.filter(
                        sessions__start_time__date=today
                    ).distinct()
                    print(f"[DEBUG] Movies with sessions today: {movies_today.count()}")
                    
                    # Log des sessions d'aujourd'hui
                    for movie in movies_today:
                        sessions_today = movie.sessions.filter(start_time__date=today)
                        print(f"[DEBUG] Movie '{movie.title}' has {sessions_today.count()} sessions today")
                    
                    movies = movies_today
                    
                elif date_filter == 'tomorrow':
                    tomorrow = today + timezone.timedelta(days=1)
                    movies_tomorrow = movies.filter(
                        sessions__start_time__date=tomorrow
                    ).distinct()
                    print(f"[DEBUG] Movies with sessions tomorrow: {movies_tomorrow.count()}")
                    movies = movies_tomorrow
            
            # Gestion de l'onglet "popular" - version simple
            tab = request.GET.get('tab', 'popular')
            print(f"[DEBUG] Tab: {tab}")
            
            if tab == 'popular':
                # Trier par nombre de sessions futures
                movies = movies.annotate(
                    future_session_count=models.Count(
                        'sessions',
                        filter=Q(sessions__start_time__gte=now)
                    )
                ).filter(future_session_count__gt=0).order_by('-future_session_count', '-release_date')
                print(f"[DEBUG] After popular filter: {movies.count()} movies")
            else:
                # Tri par date de sortie pour les autres onglets
                movies = movies.order_by('-release_date')
                print(f"[DEBUG] After date ordering: {movies.count()} movies")
            
            # Filtrage par genre
            genre_filter = request.GET.get('genre', None)
            if genre_filter and genre_filter != 'Tous':
                movies = movies.filter(genre__icontains=genre_filter)
                print(f"[DEBUG] After genre filter '{genre_filter}': {movies.count()} movies")
            
            # Log détaillé des films trouvés
            print(f"[DEBUG] === FINAL MOVIES QUERYSET ===")
            print(f"[DEBUG] Total movies: {movies.count()}")
            
            if movies.count() == 0:
                print("[DEBUG] No movies found! Checking why...")
                # Vérifier si le problème vient des sessions
                all_movies = Movie.objects.all()
                print(f"[DEBUG] Total movies in DB: {all_movies.count()}")
                for movie in all_movies:
                    future_sessions = movie.sessions.filter(start_time__gte=now)
                    print(f"[DEBUG] Movie '{movie.title}': {future_sessions.count()} future sessions")
                    for session in future_sessions:
                        print(f"[DEBUG]   Session: {session.start_time} (movie: {session.movie.title})")
            
            for movie in movies:
                future_sessions = movie.sessions.filter(start_time__gte=now)
                session_count = future_sessions.count()
                print(f"[DEBUG] Movie: '{movie.title}' (ID: {movie.id})")
                print(f"[DEBUG]   - Genre: {movie.genre}")
                print(f"[DEBUG]   - Release date: {movie.release_date}")
                print(f"[DEBUG]   - Future sessions: {session_count}")
                for session in future_sessions[:3]:  # Log seulement les 3 premières sessions
                    print(f"[DEBUG]     Session: {session.start_time} -> {session.end_time}")
            
            # Pagination
            paginator = PageNumberPagination()
            page_size = request.GET.get("page_size", 20)
            try:
                paginator.page_size = int(page_size)
            except ValueError:
                paginator.page_size = 20

            result_page = paginator.paginate_queryset(movies, request)
            print(f"[DEBUG] Paginated results: {len(result_page)} movies")
            
            serializer = MovieMobileSerializer(result_page, many=True)
            
            # Log des données sérialisées
            print(f"[DEBUG] === SERIALIZED DATA ===")
            print(f"[DEBUG] Serialized {len(serializer.data)} movies")
            
            for i, movie_data in enumerate(serializer.data):
                print(f"[DEBUG] Movie {i+1}:")
                print(f"[DEBUG]   - Title: {movie_data.get('title')}")
                print(f"[DEBUG]   - ID: {movie_data.get('id')}")
                print(f"[DEBUG]   - Session count: {movie_data.get('session_count')}")
                print(f"[DEBUG]   - Next session: {movie_data.get('next_session')}")
                print(f"[DEBUG]   - Popularity: {movie_data.get('popularity_score')}")

            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            print(f"[ERROR] Error in MovieListView: {str(e)}")
            import traceback
            print(f"[ERROR] Traceback: {traceback.format_exc()}")
            return Response(
                {"error": f"Erreur lors du chargement des films: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MovieDetailView(APIView):
    """
    API View pour récupérer les détails d'un film spécifique
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request, pk):
        try:
            # On renvoie seulement les films actifs
            movie = get_object_or_404(Movie, pk=pk)
            serializer = MovieMobileSerializer(movie)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Dans views.py - modifier SessionSeatsView pour mieux gérer les sièges
class SessionSeatsView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request, session_id):
        try:
            session = get_object_or_404(MovieSession, id=session_id)
            seats = Seat.objects.filter(hall=session.hall)
            individual_seats = []
            
            # Récupérer tous les tickets existants pour cette session
            existing_tickets = Ticket.objects.filter(
                session=session,
                status__in=['purchased', 'used', 'reserved']
            )
            
            # Créer un set des positions de sièges déjà pris
            taken_seat_positions = set()
            reserved_seat_positions = set()
            
            for ticket in existing_tickets:
                # Vérifier si la réservation est expirée
                if ticket.status == 'reserved' and ticket.is_expired():
                    continue  # Ignorer les réservations expirées
                
                # Construire l'ID composite du siège
                seat_id = f"{ticket.seat_id}-{ticket.row}-{ticket.col}"
                taken_seat_positions.add(seat_id)
                
                # Marquer les sièges réservés spécifiquement
                if ticket.status == 'reserved':
                    reserved_seat_positions.add(seat_id)
            
            for seat_config in seats:
                rows = int(seat_config.rows)
                cols = int(seat_config.cols)
                
                for row in range(rows):
                    for col in range(cols):
                        # Generate composite seat ID: "configId-row-col"
                        seat_id = f"{seat_config.id}-{row}-{col}"
                        
                        # Check if seat is taken using the set for faster lookup
                        is_taken = seat_id in taken_seat_positions
                        is_reserved = seat_id in reserved_seat_positions
                        
                        # Check if seat is disabled
                        disabled_seats = seat_config.disabledSeats or []
                        # Convertir les disabledSeats en format cohérent
                        disabled_seats_formatted = [f"{item}" for item in disabled_seats]
                        disabled = f"{row}-{col}" in disabled_seats_formatted
                        
                        # Check if seat is VIP
                        vip_seats = seat_config.VIPSeats or []
                        # Convertir les VIPSeats en format cohérent
                        vip_seats_formatted = [f"{item}" for item in vip_seats]
                        is_vip = f"{row}-{col}" in vip_seats_formatted
                        
                        # Calculer le prix réel du siège
                        base_price = float(session.base_price)
                        seat_price = base_price * float(seat_config.price_multiplier)
                        if is_vip:
                            seat_price *= 1.5  # Majoration VIP
                        
                        # Seat is available if not taken AND not disabled
                        is_available = not is_taken and not disabled
                        
                        individual_seats.append({
                            'id': seat_id,  # Composite ID: "configId-row-col"
                            'rows': str(row),
                            'cols': str(col),
                            'seat_type': seat_config.seat_type,
                            'price_multiplier': float(seat_config.price_multiplier),
                            'calculated_price': float(seat_price),  # Prix calculé
                            'is_available': is_available,
                            'is_vip': is_vip,
                            'is_disabled': disabled,
                            'is_reserved': is_reserved  # Nouveau champ pour les sièges réservés
                        })
            
            return Response({
                'session': MovieSessionMobileSerializer(session).data,
                'seats': individual_seats,
                'cinema_name': session.hall.cinema.name if session.hall.cinema else None,
                'cinema_city': session.hall.cinema.city if session.hall.cinema else None,
                'base_price': float(session.base_price)  # Prix de base pour les calculs
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in SessionSeatsView: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class SessionDetailView(APIView):
    """
    API View pour récupérer les détails d'une session spécifique
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request, session_id):
      try:
        session = get_object_or_404(MovieSession, id=session_id)
        serializer = MovieSessionMobileSerializer(session)
        return Response(serializer.data)
      except Exception as e:
        return Response(
          {"error": str(e)},
          status=status.HTTP_500_INTERNAL_SERVER_ERROR
      )

class MovieSessionsView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request, movie_id):
        try:
            # Récupérer toutes les sessions futures pour ce film
            now = timezone.now()
            sessions = MovieSession.objects.filter(
                movie_id=movie_id,
                start_time__gte=now
            ).select_related(
                'hall__cinema'
            ).order_by('start_time')
            
            serializer = MovieSessionMobileSerializer(sessions, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RestaurantItemsView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request):
        try:
            # Récupérer tous les articles disponibles
            items = RestaurantItem.objects.filter(is_available=True)
            
            # Retourner les données sans gestion de stock
            items_data = []
            for item in items:
                items_data.append({
                    'id': item.id,
                    'name': item.name,
                    'description': item.description,
                    'category': item.category.id,
                    'category_name': item.category.category_name,
                    'price': float(item.price),
                    'image': request.build_absolute_uri(item.image.url) if item.image else None,
                    'is_available': item.is_available,
                    'stock': item.stock
                })
            
            return Response(items_data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error fetching restaurant items: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreateReservationView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def post(self, request):
        reservation = None  # Initialiser la variable
        try:
            session_id = request.data.get('session')
            seat_ids = request.data.get('seats', [])
            food_items = request.data.get('food_items', [])
            taxi_option = request.data.get('taxi_option', {})
            payment_method = request.data.get('payment_method', 'CARD')

            if not session_id:
                return Response({'error': 'Session ID requis'}, status=400)

            session = get_object_or_404(MovieSession, id=session_id)
            customer = request.user

            with transaction.atomic():
                # Vérifier d'abord si tous les sièges sont encore disponibles
                seat_configs = []
                for composite_seat_id in seat_ids:
                    try:
                        parts = composite_seat_id.split('-')
                        if len(parts) != 3:
                            raise Exception(f"Format d'ID de siège invalide: {composite_seat_id}")
                        config_id, row, col = parts
                        
                        # Vérifier si le siège est maintenant pris avec un verrou de ligne
                        existing_ticket = Ticket.objects.select_for_update().filter(
                            session=session,
                            seat_id=config_id,
                            row=row,
                            col=col,
                            status__in=['purchased', 'used', 'reserved']
                        ).first()
                        
                        # Si le ticket existe et n'est pas expiré, vérifier s'il est toujours valide
                        if existing_ticket:
                            # Si le ticket est réservé mais expiré, le marquer comme expiré
                            if existing_ticket.status == 'reserved' and existing_ticket.is_expired():
                                existing_ticket.status = 'expired'
                                existing_ticket.save()
                            # Si le ticket n'est pas expiré, il est vraiment pris
                            elif not existing_ticket.is_expired():
                                raise Exception(f"Siège R{row}C{col} a été réservé entre-temps")
                        
                        seat_configs.append((config_id, row, col))
                    except Exception as e:
                        raise Exception(f"Siège {composite_seat_id} n'est plus disponible: {str(e)}")

                # Calculer le prix total des sièges et créer les tickets
                total_seat_price = Decimal('0.00')
                created_tickets = []
                for config_id, row, col in seat_configs:
                    # Récupérer la configuration du siège avec verrou
                    seat_obj = get_object_or_404(Seat.objects.select_for_update(), id=config_id)
                    
                    # Calculer le prix du siège (base_price * price_multiplier)
                    seat_price = Decimal(str(session.base_price)) * Decimal(str(seat_obj.price_multiplier))
                    total_seat_price += seat_price
                    
                    # Vérifier une dernière fois que le siège n'a pas été pris pendant le traitement
                    final_check = Ticket.objects.filter(
                        session=session,
                        seat_id=config_id,
                        row=row,
                        col=col,
                        status__in=['purchased', 'used', 'reserved']
                    ).exclude(status='expired').exists()
                    
                    if final_check:
                        raise Exception(f"Siège R{row}C{col} a été réservé pendant le traitement")
                    
                    # Créer le ticket
                    ticket = Ticket.objects.create(
                        session=session,
                        customer=customer,
                        seat=seat_obj,
                        row=row,
                        col=col,
                        price=seat_price,
                        status='purchased' 
                    )
                    created_tickets.append(ticket)

                # Process food items
                food_orders = []
                total_food_price = Decimal('0.00')
                if food_items:
                    food_order = FoodOrder.objects.create(
                        customer=customer,
                        session=session,
                        total_amount=0,
                        status='PENDING'
                    )
                    
                    for food_item_data in food_items:
                        item_id = food_item_data.get('item')
                        quantity = food_item_data.get('quantity', 1)
                        
                        if not item_id:
                            raise Exception("ID d'article manquant dans les données alimentaires")
                        
                        # Récupérer l'article de restaurant
                        restaurant_item = get_object_or_404(RestaurantItem, id=item_id)
                        
                        # CRÉER L'ORDER ITEM avec les bonnes données
                        order_item = FoodOrderItem.objects.create(
                            order=food_order,
                            item=restaurant_item,
                            quantity=quantity,
                            price_at_time=restaurant_item.price
                        )
                        
                        item_total = Decimal(str(restaurant_item.price)) * Decimal(str(quantity))
                        total_food_price += item_total
                        print(f"Created FoodOrderItem: {order_item.id} for item: {restaurant_item.name}")
                    
                    food_order.total_amount = total_food_price

                    can_reduce = restaurant_item.reduce_stock(quantity)
                    if can_reduce:
                        data_historique = historiqueStockSerializer(data={
                            "item": restaurant_item.id,
                            "quantity":quantity,
                            "is_addition": False
                        })
                        if data_historique.is_valid():
                            data_historique.save()  # Réduire le stock de l'article
                    food_order.save()
                    food_orders.append(food_order)
                    print(f"Created FoodOrder: {food_order.id} with total: {food_order.total_amount}")

                # Calculate total
                taxi_price = Decimal(str(taxi_option.get('price', 0)))
                total_amount = total_seat_price + total_food_price + taxi_price

                # Create reservation
                reservation = Reservation.objects.create(
                    customer=customer,
                    session=session,
                    status='CONFIRMED',  # Changer de PENDING à CONFIRMED
                    total_amount=total_amount
                )
                
                # Add tickets to reservation
                for ticket in created_tickets:
                    ticket.reservation = reservation
                    ticket.save()
                    reservation.tickets.add(ticket)
                
                # Add food orders to reservation
                for food_order in food_orders:
                    reservation.food_orders.add(food_order)

                # Create payment
                payment = Payment.objects.create(
                    customer=customer,
                    amount=total_amount,
                    payment_method=payment_method,
                    status='COMPLETED',
                    reservation=reservation
                )

            # Return success response - CORRECTION ICI
            # Ne pas utiliser le serializer si la réservation n'est pas créée
            if reservation:
                serializer = ReservationSerializer(reservation)
                return Response({
                    'message': 'Réservation créée avec succès',
                    'reservation_id': reservation.id,
                    'reservation_code': str(reservation.reservation_code),
                    'total_amount': float(reservation.total_amount),
                    'payment_id': payment.id,
                    'ticket_count': len(created_tickets),
                    'food_order_count': len(food_orders),
                    'seats_count': len(seat_ids),
                    'reservation': serializer.data  # Ajouter les données sérialisées
                }, status=201)
            else:
                return Response({
                    'message': 'Réservation créée mais données incomplètes',
                    'reservation_id': None,
                    'reservation_code': None,
                    'total_amount': float(total_amount),
                    'ticket_count': len(created_tickets),
                    'seats_count': len(seat_ids)
                }, status=201)
            
        except Exception as e:
            print(f"Error creating reservation: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            
            # Nettoyer les ressources en cas d'erreur
            if reservation:
                try:
                    # Supprimer la réservation et les tickets associés
                    reservation.tickets.all().delete()
                    reservation.delete()
                except:
                    pass
            
            return Response({'error': f'Erreur lors de la création de la réservation: {str(e)}'}, status=500)
        
class UserTicketsView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request):
        try:
            customer = request.user
            
            # Récupérer les réservations au lieu des tickets individuels
            reservations = Reservation.objects.filter(
                customer=customer
            ).exclude(
                status__in=['CANCELLED']
            ).select_related(
                'session__movie',
                'session__hall__cinema'
            ).prefetch_related('tickets').order_by('-created_at')
            
            # Filtrer pour exclure les réservations dont tous les tickets sont utilisés
            filtered_reservations = []
            for reservation in reservations:
                # Compter les tickets utilisés
                used_tickets = reservation.tickets.filter(is_used=True).count()
                total_tickets = reservation.tickets.count()
                
                # Inclure seulement si au moins un ticket n'est pas utilisé
                if used_tickets < total_tickets:
                    filtered_reservations.append(reservation)
            
            reservations_data = []
            for reservation in filtered_reservations:
                # Calculer le nombre de sièges
                seat_count = reservation.tickets.count()
                
                # Compter les tickets utilisés
                used_tickets = reservation.tickets.filter(is_used=True).count()
                available_tickets = seat_count - used_tickets
                
                # Récupérer le premier ticket pour les infos de base
                first_ticket = reservation.tickets.first()
                
                if first_ticket:
                    reservations_data.append({
                        'id': reservation.id,
                        'reservation_code': str(reservation.reservation_code),
                        'ticket_code': str(reservation.reservation_code),
                        'session': {
                            'id': reservation.session.id,
                            'movie': {
                                'title': reservation.session.movie.title,
                                'genre': reservation.session.movie.genre,
                                'poster': reservation.session.movie.poster.url if reservation.session.movie.poster else None,
                                'duration': reservation.session.movie.duration
                            },
                            'start_time': reservation.session.start_time,
                            'end_time': reservation.session.end_time,
                            'hall': {
                                'name': reservation.session.hall.name,
                                'cinema': {
                                    'name': reservation.session.hall.cinema.name,
                                    'city': reservation.session.hall.cinema.city
                                },
                                'screen_type': reservation.session.hall.screen_type
                            }
                        },
                        'seats': reservation.get_seats_display(),
                        'seat_count': seat_count,
                        'available_tickets': available_tickets,  # Nouveau champ
                        'used_tickets': used_tickets,  # Nouveau champ
                        'total_amount': float(reservation.total_amount),
                        'purchase_date': reservation.created_at,
                        'status': reservation.status,
                        'cinema_name': reservation.session.hall.cinema.name,
                        'cinema_city': reservation.session.hall.cinema.city,
                        'is_fully_used': (used_tickets == seat_count)  # Nouveau champ
                    })
            
            return Response({
                'reservations': reservations_data,
                'count': len(reservations_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error fetching user reservations: {str(e)}")
            return Response(
                {'error': 'Erreur lors de la récupération des réservations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PreviewMovieTicketView(APIView):
    """
    API pour prévisualiser un ticket film via son code QR sans le valider
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def post(self, request):
        print(f"PreviewMovieTicketView called by user: {request.user}")
        print(f"Request data: {request.data}")
        
        qr_data = request.data.get('qr_data')
        
        if not qr_data:
            print("Error: No qr_data provided")
            return Response(
                {
                    "success": False,
                    "message": "QR code data required",
                    "error": "qr_data field is required"
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"Processing QR data: {qr_data}")
        
        try:
            # Essayer de parser comme JSON de réservation
            try:
                print("Attempting to parse as reservation JSON...")
                qr_json = json.loads(qr_data)
                reservation_id = qr_json.get('reservationId')
                booking_code = qr_json.get('bookingCode')
                
                if reservation_id:
                    print(f"Looking for reservation by ID: {reservation_id}")
                    reservation = get_object_or_404(Reservation, id=reservation_id)
                    print(f"Found reservation by ID: {reservation.id}")
                elif booking_code:
                    print(f"Looking for reservation by code: {booking_code}")
                    reservation = get_object_or_404(Reservation, reservation_code=booking_code)
                    print(f"Found reservation by code: {reservation.id}")
                else:
                    print("No reservationId or bookingCode found in JSON")
                    return Response({
                        "success": False,
                        "message": "Format de code QR invalide - ID de réservation ou code de booking manquant",
                        "received_data": qr_data
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed: {str(e)}")
                # Si ce n'est pas du JSON, essayer comme avant avec les tickets individuels
                try:
                    print("Attempting to find ticket by UUID...")
                    ticket = get_object_or_404(Ticket, ticket_code=qr_data)
                    print(f"Found ticket by UUID: {ticket.id}")
                    
                    # Construire les infos du ticket individuel
                    ticket_data = {
                        "id": ticket.id,
                        "movie_title": ticket.session.movie.title,
                        "session_time": ticket.session.start_time,
                        "cinema": ticket.session.hall.cinema.name,
                        "hall": ticket.session.hall.name,
                        "customer_name": f"{ticket.customer.first_name} {ticket.customer.last_name}" if ticket.customer else "N/A",
                        "ticket_code": str(ticket.ticket_code),
                        "status": ticket.status,
                        "is_used": ticket.is_used,
                        "is_expired": ticket.is_expired()
                    }

                    if ticket.is_used:
                        return Response({
                            "success": False,
                            "message": "Ticket déjà utilisé",
                            "ticket": ticket_data
                        })
                        
                    if ticket.is_expired():
                        return Response({
                            "success": False,
                            "message": "Ticket expiré", 
                            "ticket": ticket_data
                        })
                        
                    return Response({
                        "success": True,
                        "message": "Ticket film valide",
                        "ticket": ticket_data
                    })
                    
                except Exception as ticket_error:
                    return Response({
                        "success": False,
                        "message": "Format de code QR invalide",
                        "error": str(e),
                        "received_data": qr_data
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Si on arrive ici, c'est qu'on a une réservation
            print(f"Processing reservation: {reservation.id}")
            
            # Vérifier le statut de la réservation
            if reservation.status == 'CANCELLED':
                return Response({
                    "success": False,
                    "message": "Réservation annulée",
                    "reservation": {
                        "id": reservation.id,
                        "reservation_code": str(reservation.reservation_code),
                        "status": reservation.status
                    }
                })
            
            # Construire les données de la réservation
            reservation_data = {
                "id": reservation.id,
                "reservation_code": str(reservation.reservation_code),
                "movie_title": reservation.session.movie.title,
                "session_time": reservation.session.start_time,
                "cinema": reservation.session.hall.cinema.name,
                "hall": reservation.session.hall.name,
                "customer_name": f"{reservation.customer.first_name} {reservation.customer.last_name}",
                "seats": reservation.get_seats_display(),
                "total_amount": float(reservation.total_amount),
                "status": reservation.status,
                "ticket_count": reservation.tickets.count()
            }
            
            # Vérifier si tous les tickets sont utilisés
            used_tickets = reservation.tickets.filter(is_used=True).count()
            total_tickets = reservation.tickets.count()
            
            if used_tickets == total_tickets:
                return Response({
                    "success": False, 
                    "message": "Tous les tickets de cette réservation ont déjà été utilisés",
                    "reservation": reservation_data
                })
                
            # Réservation valide pour prévisualisation
            print("Reservation is valid for preview")
            return Response({
                "success": True,
                "message": "Réservation valide",
                "reservation": reservation_data,
                "available_tickets": total_tickets - used_tickets
            })
                
        except Exception as e:
            print(f"Unexpected error in PreviewMovieTicketView: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            
            return Response({
                "success": False,
                "message": f"Erreur lors de la prévisualisation: {str(e)}",
                "error_details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ValidateMovieTicketView(APIView):
    """
    API pour valider définitivement un ticket film via son code QR
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def post(self, request):
        qr_data = request.data.get('qr_data')
        
        if not qr_data:
            return Response({"error": "QR code data required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Essayer de parser comme JSON de réservation
            try:
                qr_json = json.loads(qr_data)
                reservation_id = qr_json.get('reservationId')
                booking_code = qr_json.get('bookingCode')
                
                if reservation_id:
                    reservation = get_object_or_404(Reservation, id=reservation_id)
                elif booking_code:
                    reservation = get_object_or_404(Reservation, reservation_code=booking_code)
                else:
                    return Response({
                        "success": False,
                        "message": "Format de code QR invalide - ID de réservation ou code de booking manquant"
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
                # Valider la réservation (marquer tous les tickets comme utilisés)
                if reservation.status == 'CANCELLED':
                    return Response({
                        "success": False,
                        "message": "Réservation annulée"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Marquer tous les tickets comme utilisés
                updated_count = reservation.tickets.filter(is_used=False).update(is_used=True)
                
                if updated_count == 0:
                    return Response({
                        "success": False,
                        "message": "Tous les tickets ont déjà été utilisés"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Calculer les tickets restants
                total_tickets = reservation.tickets.count()
                used_tickets = reservation.tickets.filter(is_used=True).count()
                remaining_tickets = total_tickets - used_tickets
                
                reservation_data = {
                    "id": reservation.id,
                    "reservation_code": str(reservation.reservation_code),
                    "movie_title": reservation.session.movie.title,
                    "session_time": reservation.session.start_time,
                    "cinema": reservation.session.hall.cinema.name,
                    "hall": reservation.session.hall.name,
                    "customer_name": f"{reservation.customer.first_name} {reservation.customer.last_name}",
                    "seats": reservation.get_seats_display(),
                    "tickets_validated": updated_count,
                    "remaining_tickets": remaining_tickets,  # Nouveau champ
                    "is_fully_used": (remaining_tickets == 0)  # Nouveau champ
                }

                return Response({
                    "success": True,
                    "message": f"{updated_count} ticket(s) validé(s) avec succès",
                    "reservation": reservation_data
                })
                    
            except json.JSONDecodeError:
                # Gestion des tickets individuels (ancienne logique)
                try:
                    ticket = get_object_or_404(Ticket, ticket_code=qr_data)
                    
                    # Valider le ticket individuel
                    success, message = ticket.validate_and_mark()
                    
                    ticket_data = {
                        "id": ticket.id,
                        "movie_title": ticket.session.movie.title,
                        "session_time": ticket.session.start_time,
                        "cinema": ticket.session.hall.cinema.name,
                        "hall": ticket.session.hall.name,
                        "customer_name": f"{ticket.customer.first_name} {ticket.customer.last_name}" if ticket.customer else "N/A",
                        "ticket_code": str(ticket.ticket_code),
                    }

                    if success:
                        return Response({
                            "success": True,
                            "message": message,
                            "ticket": ticket_data
                        })
                    else:
                        return Response({
                            "success": False,
                            "message": message,
                            "ticket": ticket_data
                        }, status=status.HTTP_400_BAD_REQUEST)
                        
                except Exception as ticket_error:
                    return Response({
                        "success": False,
                        "message": "Format de code QR invalide"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Erreur lors de la validation: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CommentCreateView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]
    
    def post(self, request, movie_id=None, event_id=None):
        content = request.data.get('content')
        reply_to = request.data.get('reply_to')
        
        if not content:
            return Response(
                {"error": "Le contenu du commentaire est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            comment_data = {
                'user': request.user,
                'content': content
            }
            
            if reply_to:
                comment_data['reply_to'] = get_object_or_404(Comment, id=reply_to)
            
            if movie_id:
                comment_data['movie'] = get_object_or_404(Movie, id=movie_id)
            elif event_id:
                comment_data['event'] = get_object_or_404(Event, id=event_id)
            else:
                return Response(
                    {"error": "ID de film ou d'événement requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            comment = Comment.objects.create(**comment_data)
            serializer = CommentSerializer(comment)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Erreur lors de la création du commentaire: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class CommentViewSet(viewsets.ModelViewSet):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        movie_id = self.kwargs.get('movie_id')
        event_id = self.kwargs.get('event_id')
        
        if movie_id:
            return Comment.objects.filter(movie_id=movie_id, reply_to__isnull=True)
        elif event_id:
            return Comment.objects.filter(event_id=event_id, reply_to__isnull=True)
        return Comment.objects.none()
    
    def perform_create(self, serializer):
        movie_id = self.kwargs.get('movie_id')
        event_id = self.kwargs.get('event_id')
        
        if movie_id:
            serializer.save(user=self.request.user, movie_id=movie_id)
        elif event_id:
            serializer.save(user=self.request.user, event_id=event_id)

class LikeCommentView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]
    
    def post(self, request, comment_id):
        try:
            comment = get_object_or_404(Comment, id=comment_id)
            user = request.user
            
            # Check if user already liked this comment
            if comment.likes.filter(id=user.id).exists():
                comment.likes.remove(user)
                liked = False
            else:
                comment.likes.add(user)
                liked = True
            
            return Response({
                'liked': liked,
                'likes_count': comment.likes.count()
            })
            
        except Exception as e:
            print(f"Like comment error: {str(e)}")
            return Response(
                {"error": f"Erreur lors du like: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class CommentListView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]
    
    def get(self, request, movie_id=None, event_id=None):
        try:
            if movie_id:
                comments = Comment.objects.filter(movie_id=movie_id, reply_to__isnull=True)
            elif event_id:
                comments = Comment.objects.filter(event_id=event_id, reply_to__isnull=True)
            else:
                return Response(
                    {"error": "ID de film ou d'événement requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Erreur lors de la récupération des commentaires: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LikeView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]
    
    def post(self, request, content_type, content_id):
        user = request.user
        
        if content_type == 'event':
            event = get_object_or_404(Event, id=content_id)
            if event.likes.filter(id=user.id).exists():
                event.likes.remove(user)
                liked = False
            else:
                event.likes.add(user)
                liked = True
            likes_count = event.likes.count()
            
        elif content_type == 'movie':
            movie = get_object_or_404(Movie, id=content_id)
            like, created = MovieLike.objects.get_or_create(
                user=user, movie=movie
            )
            if not created:
                like.delete()
                liked = False
            else:
                liked = True
            likes_count = MovieLike.objects.filter(movie=movie).count()
        
        else:
            return Response(
                {"error": "Type de contenu invalide"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'liked': liked,
            'likes_count': likes_count
        })

# Dans views.py
class FeedView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]
    
    def get(self, request):
        # Récupérer les événements récents
        events = Event.objects.filter(date__gte=timezone.now()).order_by('-date')[:10]
        event_serializer = EventFeedSerializer(
            events, many=True, context={'request': request}
        )
        
        # Récupérer les films qui ont des sessions à venir
        now = timezone.now()
        movies_with_sessions = Movie.objects.filter(
            is_active=False,
            sessions__start_time__gte=now
        ).distinct().order_by('-release_date')[:10]
        
        movie_serializer = MovieFeedSerializer(
            movies_with_sessions, many=True, context={'request': request}
        )
        
        # Combiner et mélanger les résultats
        feed_items = []
        
        for event_data in event_serializer.data:
            feed_items.append({
                'id': event_data['id'],  # Assurez-vous que l'ID est inclus
                'type': 'event',
                'data': event_data,
                'timestamp': event_data['date']
            })
        
        for movie_data in movie_serializer.data:
            feed_items.append({
                'id': movie_data['id'],  # Assurez-vous que l'ID est inclus
                'type': 'movie',
                'data': movie_data,
                'timestamp': movie_data['release_date']
            })
        
        # Trier par date (les plus récents en premier)
        feed_items.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response({
            'feed': feed_items,
            'count': len(feed_items)
        })
class RatingView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]
    
    def post(self, request, event_id):
        try:
            event = get_object_or_404(Event, id=event_id)
            user = request.user
            rating_value = request.data.get('rating')
            
            if not rating_value or not (1 <= int(rating_value) <= 5):
                return Response(
                    {"detail": "La note doit être entre 1 et 5."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
            return Response(
                {"detail": "Événement non trouvé."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
# Ajoutez cette vue dans views.py
class SaveItemView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]
    
    def post(self, request, content_type, content_id):
        user = request.user
        
        if content_type not in ['event', 'movie']:
            return Response(
                {"error": "Type de contenu invalide"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si l'élément existe
        if content_type == 'event':
            get_object_or_404(Event, id=content_id)
        else:
            get_object_or_404(Movie, id=content_id)
        
        # Créer ou supprimer l'enregistrement
        saved_item, created = SavedItem.objects.get_or_create(
            user=user,
            content_type=content_type,
            content_id=content_id
        )
        
        if not created:
            saved_item.delete()
            saved = False
        else:
            saved = True
        
        return Response({
            'saved': saved
        })

class SavedItemsView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]
    
    def get(self, request):
        user = request.user
        saved_items = SavedItem.objects.filter(user=user).order_by('-saved_at')
        
        result = []
        for item in saved_items:
            if item.content_type == 'event':
                try:
                    event = Event.objects.get(id=item.content_id)
                    serializer = EventFeedSerializer(event, context={'request': request})
                    result.append({
                        'type': 'event',
                        'data': serializer.data,
                        'saved_at': item.saved_at
                    })
                except Event.DoesNotExist:
                    # Supprimer l'élément s'il n'existe plus
                    item.delete()
            
            elif item.content_type == 'movie':
                try:
                    movie = Movie.objects.get(id=item.content_id)
                    serializer = MovieFeedSerializer(movie, context={'request': request})
                    result.append({
                        'type': 'movie',
                        'data': serializer.data,
                        'saved_at': item.saved_at
                    })
                except Movie.DoesNotExist:
                    # Supprimer l'élément s'il n'existe plus
                    item.delete()
        
        return Response({
            'saved_items': result,
            'count': len(result)
        })

class SearchEventsView(APIView):
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip().lower()
        
        if not query:
            return Response({'results': []})
        
        results = []
        
        # Recherche dans les événements
        events = Event.objects.filter(
            Q(name__icontains=query) |
            Q(venue__icontains=query) |
            Q(description__icontains=query)
        )[:10]
        
        # Ajouter les événements correspondants
        for event in events:
            results.append({
                'id': event.id,
                'name': event.name,
                'venue': event.venue,
                'date': event.date.isoformat() if event.date else None,
                'image_url': request.build_absolute_uri(event.image.url) if event.image else None,
                'type': 'event'
            })
        
        # Recherche dans les films
        movies = Movie.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(genre__icontains=query) |
            Q(director__icontains=query) |
            Q(cast__icontains=query)
        )[:10]
        
        # Ajouter les films correspondants
        for movie in movies:
            results.append({
                'id': movie.id,
                'name': movie.title,
                'venue': None,
                'date': movie.release_date.isoformat() if movie.release_date else None,
                'image_url': request.build_absolute_uri(movie.poster.url) if movie.poster else (
                    request.build_absolute_uri(movie.default_image.url) if movie.default_image else None
                ),
                'type': 'movie'
            })
        
        # Recherche par lieu (regroupement) - pour événements
        event_venues = Event.objects.filter(venue__icontains=query).values('venue').distinct()[:5]
        for venue in event_venues:
            results.append({
                'id': hash(venue['venue']),
                'name': venue['venue'],
                'venue': venue['venue'],
                'type': 'venue'
            })
        
        # Recherche par cinéma (regroupement) - pour films
        cinemas = Cinema.objects.filter(
            Q(name__icontains=query) |
            Q(city__icontains=query)
        )[:5]
        
        for cinema in cinemas:
            results.append({
                'id': hash(f'cinema_{cinema.id}'),
                'name': f"{cinema.name} ({cinema.city})",
                'venue': cinema.name,
                'type': 'cinema'
            })
        
        # Recherche par date - améliorée pour différents formats
        try:
            from datetime import datetime
            # Essayer différents formats de date
            date_formats = ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%m/%d/%Y']
            search_date = None
            
            for date_format in date_formats:
                try:
                    search_date = datetime.strptime(query, date_format).date()
                    break
                except ValueError:
                    continue
            
            if search_date:
                # Événements à cette date
                date_events = Event.objects.filter(date__date=search_date)
                if date_events.exists():
                    results.append({
                        'id': hash(search_date.isoformat()),
                        'name': f'Événements du {search_date.strftime("%d/%m/%Y")}',
                        'date': search_date.isoformat(),
                        'type': 'date'
                    })
                
                # Séances de films à cette date
                movie_sessions = MovieSession.objects.filter(start_time__date=search_date)
                if movie_sessions.exists():
                    results.append({
                        'id': hash(f'movie_date_{search_date.isoformat()}'),
                        'name': f'Films du {search_date.strftime("%d/%m/%Y")}',
                        'date': search_date.isoformat(),
                        'type': 'movie_date'
                    })
                    
        except ValueError:
            pass
        
        # Recherche par mois/année
        try:
            if len(query) >= 4 and query.isdigit():
                year = int(query)
                # Événements de l'année
                year_events = Event.objects.filter(date__year=year)
                if year_events.exists():
                    results.append({
                        'id': hash(f'year_{year}'),
                        'name': f'Événements de {year}',
                        'type': 'year'
                    })
                
                # Films de l'année
                year_movies = Movie.objects.filter(release_date__year=year)
                if year_movies.exists():
                    results.append({
                        'id': hash(f'movie_year_{year}'),
                        'name': f'Films de {year}',
                        'type': 'movie_year'
                    })
        except:
            pass
        
        return Response({'results': results})
    
class CalendarView(APIView):
    """
    Vue pour récupérer les événements et films pour le calendrier
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request):
        try:
            # Récupérer les dates de début et fin pour le filtre (optionnel)
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            
            # Récupérer les événements à venir
            events = Event.objects.filter(date__gte=timezone.now())
            
            if start_date and end_date:
                try:
                    # Convertir les strings en datetime objects avec timezone
                    start = timezone.datetime.strptime(start_date, '%Y-%m-%d').replace(
                        tzinfo=timezone.get_current_timezone()
                    )
                    end = timezone.datetime.strptime(end_date, '%Y-%m-%d').replace(
                        hour=23, minute=59, second=59, tzinfo=timezone.get_current_timezone()
                    )
                    events = events.filter(date__range=[start, end])
                except ValueError:
                    pass
            
            # Récupérer les films avec sessions à venir
            movies_with_sessions = Movie.objects.filter(
                is_active=False,
                sessions__start_time__gte=timezone.now()
            ).distinct()
            
            # Sérialiser les données
            event_serializer = CalendarEventSerializer(
                events, many=True, context={'request': request}
            )
            movie_serializer = CalendarMovieSerializer(
                movies_with_sessions, many=True, context={'request': request}
            )
            
            # Combiner et trier par date
            calendar_items = event_serializer.data + movie_serializer.data
            
            # Convertir les dates strings en datetime objects pour le tri
            for item in calendar_items:
                if isinstance(item['date'], str):
                    try:
                        # Gérer le format ISO avec timezone
                        if item['date'].endswith('Z'):
                            item['date'] = timezone.datetime.fromisoformat(
                                item['date'].replace('Z', '+00:00')
                            )
                        else:
                            item['date'] = timezone.datetime.fromisoformat(item['date'])
                    except ValueError:
                        # Fallback pour d'autres formats
                        item['date'] = timezone.make_aware(
                            timezone.datetime.strptime(item['date'], '%Y-%m-%d')
                        )
            
            # Trier par date
            calendar_items.sort(key=lambda x: x['date'])
            
            # Grouper par date pour la réponse
            grouped_items = {}
            for item in calendar_items:
                # Convertir en string date pour le regroupement
                if isinstance(item['date'], timezone.datetime):
                    date_key = item['date'].strftime('%Y-%m-%d')
                else:
                    date_key = item['date']
                
                if date_key not in grouped_items:
                    grouped_items[date_key] = []
                
                grouped_items[date_key].append(item)
            
            return Response({
                'success': True,
                'calendar_data': grouped_items,
                'total_items': len(calendar_items),
                'dates_with_events': list(grouped_items.keys())
            })
            
        except Exception as e:
            print(f"Calendar view error: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class CalendarDateDetailView(APIView):
    """
    Vue pour récupérer les événements/films d'une date spécifique
    """
    authentication_classes = [UUIDAuthentication]
    permission_classes = [IsCustomerAuthenticated]

    def get(self, request, date_str):
        try:
            # Convertir la date string en objet datetime avec timezone
            target_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').replace(
                tzinfo=timezone.get_current_timezone()
            )
            next_day = target_date + timezone.timedelta(days=1)
            
            # Événements pour cette date
            events = Event.objects.filter(
                date__range=[target_date, next_day - timezone.timedelta(seconds=1)]
            )
            
            # Films avec sessions pour cette date
            movies = Movie.objects.filter(
                is_active=False,
                sessions__start_time__range=[target_date, next_day - timezone.timedelta(seconds=1)]
            ).distinct()
            
            # Sérialiser
            event_serializer = CalendarEventSerializer(
                events, many=True, context={'request': request}
            )
            movie_serializer = CalendarMovieSerializer(
                movies, many=True, context={'request': request}
            )
            
            items = event_serializer.data + movie_serializer.data
            
            # Convertir les dates pour le tri
            for item in items:
                if isinstance(item['date'], str):
                    try:
                        if item['date'].endswith('Z'):
                            item['date'] = timezone.datetime.fromisoformat(
                                item['date'].replace('Z', '+00:00')
                            )
                        else:
                            item['date'] = timezone.datetime.fromisoformat(item['date'])
                    except ValueError:
                        item['date'] = timezone.make_aware(
                            timezone.datetime.strptime(item['date'], '%Y-%m-%d')
                        )
            
            items.sort(key=lambda x: x['date'])
            
            return Response({
                'success': True,
                'date': date_str,
                'items': items,
                'count': len(items)
            })
            
        except ValueError:
            return Response({
                'success': False,
                'error': 'Format de date invalide. Utilisez YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Calendar date detail error: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SelectedOrganizerMoviesView(APIView):
    """
        Cette class peremt d'obtenir tout les 
        films qui ont des sessions dans la salle appartient 
        à l'organisateur selectionné
    """
    def get(self, request, organizerId):
        if not organizerId:
            return Response({
                'message': 'No organizer was selected',
                'success': False
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            movies = Movie.objects.filter(
                    Q(created_by_id=organizerId) | Q(sessions__hall__cinema__organizer=organizerId)
                ).distinct()

            serializer = MovieWithSessionSerializer(movies, many=True)
            return Response({
                'message': 'Load data from server',
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'message': 'Failed to get organiser movie',
                'error': str(e)
            })