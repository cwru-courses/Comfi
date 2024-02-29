from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):

    def __str__(self):
        return self.username

class Interest(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    movieID = models.CharField(max_length=63)
    like = models.BooleanField()
    timesViewed = models.IntegerField()

    class Meta:
        unique_together = ('user', 'movieID')

    def __str__(self):
        return self.movieID
    
class Movies(models.Model):
    title = models.CharField(max_length=200)
    movieID = models.CharField(max_length=200)
    media_type = models.CharField(max_length=200)
    release_year = models.CharField(max_length=200)
    runtime = models.CharField(max_length=200)
    genres_array = models.CharField(max_length=200)

