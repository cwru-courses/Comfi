from django.db import IntegrityError, DatabaseError
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, UserSerializer, InterestSerializer
from .models import CustomUser, Interest

# Create your views here.
class HomeView(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        content = {'message': 'Welcome to the JWT Authentication page using React Js and Django!'}
        
        return Response(content)

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        try:
            if serializer.is_valid():
                new_user = CustomUser(
                    first_name=serializer.validated_data['first_name'],
                    last_name=serializer.validated_data['last_name'],
                    username=serializer.validated_data['username'],
                )
                new_user.set_password(serializer.validated_data['password'])
                new_user.save()

                refresh = RefreshToken.for_user(new_user)
                data = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
                return Response(data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response('Error: Username exists', status=status.HTTP_400_BAD_REQUEST)
        except DatabaseError:
            return Response('Error: Connecting to database', status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        try:
            refresh_token = request.data['refresh_token']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserView(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()

class InterestView(viewsets.ModelViewSet):
    serializer_class = InterestSerializer
    queryset = Interest.objects.all()