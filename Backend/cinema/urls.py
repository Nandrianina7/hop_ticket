from django.urls import path, include
from .views import CommentViewSet
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
  path('test_feed/',views.test_get_all_events,name='testfeed'),
  path('add_movie/', views.MovieInserttView.as_view(), name='add_movie'),
  path('add_halls/', views.CinemaAddView.as_view(), name='add_halls'),
  path('all_cinema/', views.CinemaListView.as_view(), name='all_cinema'),
  path('add_halls_seats/', views.add_halls_seats,name='add_alls_seats'),
  path('cinema_halls/<int:cinema_id>/', views.CinemaWithHallsListView.as_view(), name='cinema_halls'),
  path('all_hall/', views.CinemaHallView.as_view(), name='all_hall'),
  path('delete_cinema/<int:id>/', views.CinemaDeleteView.as_view(), name='delete_cinema'),
  path('update_cinema_halls/<int:hall_id>/', views.CinemaHallUpdateView.as_view(), name='update_cinema'),
  path('create_movie_session/', views.MovieSessionBluckCreateView.as_view(), name='create_movie_session'),
  path('movie_list/', views.MoviesListView.as_view(), name='movie_list'),
  path('movie_session/<int:id>/', views.MovieSessionDetailView.as_view(), name='movie_session'),
  path('delete_movie/<int:id>/', views.MovieDeleteView.as_view(), name='delete_movie'),
  path('update_movie/<int:id>/', views.MovieUpdateView.as_view(), name='update_movie'),
  path('organizer/cinema/', views.OrganizerCinemaView.as_view(), name='organizers_cinema'),
  path('organizer/cinema_hall_list/', views.OrganizerCinemaHall.as_view(), name='cinema_hall_list'),
  path('organizer/concenssion/', views.ConcenssionCreateView.as_view(), name='add_concenssion'),
  path('organizer/get_concenssion/', views.ConcenssionListView.as_view(), name='get_concenssion'),
  path('concessions/<int:pk>/add-stock/', views.ConcessionAddStockView.as_view(), name='concession-add-stock'),
  path('organizer/concenssion_delete/<int:pk>/', views.ConcenssionDeleteView.as_view(), name='concenssion_delete'),
  path('organizer/concenssion_update/<int:pk>/', views.ConcenssionUpdateView.as_view(), name='concenssion_update'),
  path('organizer/ticket_sold/', views.TicketOrganizerView.as_view(), name='organizer_ticket'),
  path('organizer/ticket_sold_upcoming_session/', views.TickeSoldUpcomingSessionView.as_view(), name='upcoming_session_ticket'),
  path('session/seats/<int:session_id>/', views.SessionSeatsWebView.as_view(), name='session_seats'),
  path('promocodes/', views.PromoCodeCreateView.as_view(), name='promocode-create'),
  path('promocodes/session/<int:pk>/', views.PromoCodeCreateView.as_view(), name='promocode-craete'),
  path('promocodes/movie/<int:pk>/', views.PromoCodeCreateWithMovieView.as_view(), name='promocode-craete'),
  path ('restaurantitem/categories/', views.RestaurantItemCategoryView.as_view(), name='categories'),

      # mobile app -----------------------
      
  path('movies/', views.MovieListView.as_view(), name='movie-list'),
  path('movies/<int:pk>/',views.MovieDetailView.as_view(), name='movie-detail'),
  path('sessions/<int:session_id>/', views.SessionDetailView.as_view(), name='session_detail'),
  path('sessions/<int:session_id>/seats/', views.SessionSeatsView.as_view(), name='session_seats'),
  path('movies/<int:movie_id>/sessions/', views.MovieSessionsView.as_view(), name='movie_sessions'),
  path('tickets/create/', views.CreateReservationView.as_view(), name='create_ticket'),
  path('user-tickets/', views.UserTicketsView.as_view(), name='user_tickets'),
  path('restaurant-items/', views.RestaurantItemsView.as_view(), name='restaurant_items'),
  path('preview-movie-ticket/', views.PreviewMovieTicketView.as_view(), name='preview_movie_ticket'),
  path('validate-movie-ticket/', views.ValidateMovieTicketView.as_view(), name='validate_movie_ticket'),
  path('feed/', views.FeedView.as_view(), name='feed'),
  path('like/<str:content_type>/<int:content_id>/', views.LikeView.as_view(), name='like'),
  path('rate/<int:event_id>/', views.RatingView.as_view(), name='rate'),
  path('events/<int:event_id>/', include(router.urls)),
  path('movies/<int:movie_id>/', include(router.urls)),
  path('comments/<int:comment_id>/like/', views.LikeCommentView.as_view(), name='like_comment'),
  path('save/<str:content_type>/<int:content_id>/', views.SaveItemView.as_view(), name='save_item'),
  path('saved-items/', views.SavedItemsView.as_view(), name='saved_items'),
  path('mobile/search/', views.SearchEventsView.as_view(), name='api-search-events'),
  path('calendar/', views.CalendarView.as_view(), name='calendar'),
  path('calendar/date/<str:date_str>/', views.CalendarDateDetailView.as_view(), name='calendar-date-detail'),
]