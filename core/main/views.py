from django.shortcuts import render
from rest_framework import viewsets
from .serializers import UserSerializer, InterestSerializer
from .models import User, Interest

# Create your views here.
class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

class InterestView(viewsets.ModelViewSet):
    serializer_class = InterestSerializer
    queryset = Interest.objects.all()