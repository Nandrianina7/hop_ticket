from django.contrib import admin
from .models import Movie, CinemaHall, Seat, MovieSession, Ticket, PromoCode, BonusReward

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['title', 'genre', 'duration', 'rating', 'is_active']
    list_filter = ['genre', 'rating', 'is_active']
    
    def has_trailer(self, obj):
        return bool(obj.trailer_url)
    has_trailer.boolean = True
    has_trailer.short_description = 'Has Trailer'

@admin.register(MovieSession)
class MovieSessionAdmin(admin.ModelAdmin):
    list_display = ['movie', 'hall', 'start_time', 'end_time', 'base_price']
    list_filter = ['movie', 'hall', 'start_time']

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['ticket_code', 'customer', 'session', 'purchase_date', 'status']
    list_filter = ['session__movie', 'purchase_date', 'status']

# Register other models
admin.site.register(CinemaHall)
admin.site.register(Seat)
admin.site.register(PromoCode)
admin.site.register(BonusReward)