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
    
class PastSession(models.Model):
    sessionID = models.AutoField(primary_key=True)
    roomName = models.CharField(max_length=63)
    startTime = models.DateTimeField()
    endTime = models.DateTimeField()

    def __str__(self):
        return f'{self.sessionID} | {self.roomName}'

class SessionParticipant(models.Model):
    sessionParticipantID = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.DO_NOTHING)
    session = models.ForeignKey(PastSession, on_delete=models.CASCADE)

    def __str__(self):
        return f'user:{self.user}, session:{self.session}'