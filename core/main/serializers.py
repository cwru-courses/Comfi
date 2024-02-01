from rest_framework  import serializers
from .models import User, Interest

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('userID', 'firstName', 'lastName', 'username')

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ('user', 'movieID', 'like', 'timesViewed')