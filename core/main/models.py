from django.db import models

# Create your models here.
class User(models.Model):
    userID = models.AutoField(primary_key=True)
    firstName = models.CharField(max_length=31)
    lastName = models.CharField(max_length=31)
    username = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.username

class Interest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    movieID = models.CharField(max_length=63)
    like = models.BooleanField()
    timesViewed = models.IntegerField()

    class Meta:
        unique_together = ('user', 'movieID')

    def __str__(self):
        return self.movieID
    
