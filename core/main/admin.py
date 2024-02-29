from django.contrib import admin
from .models import Interest, CustomUser, Movies

# Register your models here.
admin.site.register(Interest)
admin.site.register(CustomUser)
admin.site.register(Movies)