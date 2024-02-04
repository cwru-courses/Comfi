from rest_framework  import serializers
from .models import CustomUser, Interest

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'username', 'password')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'is_staff', 'first_name', 'last_name', 'username')

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ('id', 'movieID', 'like', 'timesViewed')