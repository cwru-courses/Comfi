import json
from django.core.management.base import BaseCommand
from main.models import Movies, PastSession, CustomUser, SessionParticipant, Interest
import pandas as pd
import numpy as np
from scipy.sparse import csr_array
from scipy.sparse import diags
from scipy.linalg import norm
from ...similiarity_suggestion import SimUserSuggest
import matplotlib.pyplot as plt
import time
from django.utils import timezone
import requests
TMDB_BASE_POSTER_URL = 'https://image.tmdb.org/t/p/original'

TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZWNiYTIxZmI5ZWRlNzM4MDVlNWQwYTRmZGI1NDRiOSIsInN1YiI6IjYzZmZiNDA4Njk5ZmI3MDBjNjRhNmMzNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.JNcGKz-C2-B_6mGxqbN6aFrhMey_6FSeJD9ApWe1N9Q'


class Command(BaseCommand):
    help = 'Import data from a gzipped, tab-separated-values (TSV) formatted file, such as the formatted IMDb file(s)'
    #To run the command, do [python manage.py movie_data_import /path/to/your/dataset.tsv.gz] in the terminal

        
    def handle(self, *args, **kwargs):
        room_name = 'blankRoom'
        simUserAlgo = SimUserSuggest()
        print(generate_recommendations(room_name,5,simUserAlgo))
        self.stdout.write(self.style.SUCCESS('Data imported successfully'))

def int_to_imdb_string(imdb_int):
    imdb_string = str(imdb_int)
    while(len(imdb_string)<7):
        imdb_string= "0"+imdb_string
    return "tt"+imdb_string

def imdb_string_to_int(imdb_string):
    return int(imdb_string[2:])


def get_movie_trailers(TMDb_id):
        url = "https://api.themoviedb.org/3/movie/{}/videos?language=en-US".format(TMDb_id)

        headers = {
            "accept": "application/json",
            "Authorization": "Bearer {}".format(TMDB_API_KEY)
        }

        response = requests.get(url, headers=headers)
        videos_list = response.json()['results']
        youtube_video_url_base = 'https://www.youtube.com/watch?v='
        trailer_links = []
        for video_data in videos_list:
            if video_data['site'] =='YouTube' and video_data['type']=='Trailer':
                trailer_links.append(youtube_video_url_base+video_data['key'])
        return trailer_links


def generate_recommendations(room_name, num_recommendations, simAlgo,):
        #TBD: add lr-suggestion model
        sessionInterests = Interest.objects.filter(user__sessionparticipant__session__roomName = room_name).order_by("user")
        users = list(sessionInterests.values_list("user"))
        movieIDs = list(sessionInterests.values_list("movieID"))
        user_likes = list(sessionInterests.values_list("like"))
        recommend_IDs = []
        if(len(users)==0):
            print('using default predictions')
            recommend_IDs = simAlgo.default_prediction(num_predictions=num_recommendations)
        else:
            users_ratings = []
            users_movieIDs= []
            curr_user_ratings = np.array([])
            curr_user_IDs = np.array([])
            curr_user = users[0][0]
            for i in range(len(users)):
                if users[i][0] != curr_user:
                    users_ratings.append(curr_user_ratings)
                    users_movieIDs.append(curr_user_IDs)
                    curr_user_ratings = np.array([])
                    curr_user_IDs = np.array([])
                    curr_user = users[i][0]
                np.append(curr_user_ratings,[1 if user_likes[i][0] else -1])
                np.append(curr_user_IDs,imdb_string_to_int(movieIDs[i][0]))
            recommend_IDs = simAlgo.predict(users_movieIDs,users_ratings,num_predictions=num_recommendations)
        recommendations = []
        url = "https://api.themoviedb.org/3/find/{}?external_source=imdb_id"

        headers = {
            "accept": "application/json",
            "Authorization": "Bearer "+ TMDB_API_KEY
        }


        for id in recommend_IDs:
            imdb_id = int_to_imdb_string(int(id))
            response = requests.get(url.format(imdb_id), headers=headers).json()["movie_results"]
            if len(response)>0:
                movie_data = response[0]
                trailers = get_movie_trailers(movie_data['id'])
                recommendations.append({
                    "imdb_id": imdb_id,
                    "title":movie_data['title'],
                    "description":movie_data['overview'],
                    "poster_link": TMDB_BASE_POSTER_URL+movie_data['poster_path'],
                    "release_date": movie_data['release_date'],
                    "vote_average": movie_data['vote_average'],
                    "trailers": trailers,
                })
            else:
                print("Error could not find movie {}".format(imdb_id))

        return recommendations