from django.contrib import admin
from .models import Interest, CustomUser, PastSession, SessionParticipant, Movies

# Register your models here.
admin.site.register(Interest)
admin.site.register(CustomUser)
admin.site.register(PastSession)
admin.site.register(SessionParticipant)
admin.site.register(Movies)