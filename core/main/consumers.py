import json
import numpy as np
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import PastSession, SessionParticipant,Interest
from .similiarity_suggestion import SimUserSuggest
import requests
#from ..core.constants import TMDB_BASE_POSTER_URL, TMDB_API_KEY

TMDB_BASE_POSTER_URL = 'https://image.tmdb.org/t/p/original'

TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZWNiYTIxZmI5ZWRlNzM4MDVlNWQwYTRmZGI1NDRiOSIsInN1YiI6IjYzZmZiNDA4Njk5ZmI3MDBjNjRhNmMzNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.JNcGKz-C2-B_6mGxqbN6aFrhMey_6FSeJD9ApWe1N9Q'

class RecommendationServiceConsumer(WebsocketConsumer):
    rooms = {}
    simUserAlgo = SimUserSuggest()


    def connect(self):
        self.user_name = self.scope['url_route']['kwargs']['user_name']
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.group_name = f"chat_{self.room_name}"

        async_to_sync(self.channel_layer.group_add)(
            self.group_name,
            self.channel_name
        )

        self.add_user_to_room_and_broadcast_status()
        self.accept()
        
    def disconnect(self, code):
        self.remove_user_from_room_and_broadcast_status()

        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )
        # TODO: Add handling of different status codes

    def receive(self, text_data):
        # Parse the JSON message
        try:
            message = json.loads(text_data)
            message_type = message.get("type")
        except json.JSONDecodeError:
            print("Invalid JSON data received")
            return
        
        if message_type == 'client_ready_status':
            self.update_user_ready_status_and_broadcast(message.get('status', False))
        elif message_type == 'client_terminate':
            self.update_session_end_time(self.session)
            self.close_room()
        elif message_type == 'client_choice':
            self.process_user_choice(message.get('choice', False), message.get('movie_id', False))
        elif message_type == 'server_recommendations':
            self.send_recommendations()

    def close_room(self):
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': 'server_terminate_message'
            }
        )
        self.close()

    #--------------------HANDLE ROOM STATUS UPDATES-------------------------#
    def add_user_to_room_and_broadcast_status(self):
        if self.room_name not in self.rooms:
            self.rooms[self.room_name] = []
        
        self.rooms[self.room_name].append({
            'user_name': self.user_name,
            'ready_status': False
        })

        self.broadcast_user_list_update()

    def remove_user_from_room_and_broadcast_status(self):
        if self.room_name in self.rooms:
            self.rooms[self.room_name] = [user for user in self.rooms[self.room_name] if user['user_name'] != self.user_name]

            self.broadcast_user_list_update()

    def update_user_ready_status_and_broadcast(self, ready_status):
        for user in self.rooms[self.room_name]:
            if user['user_name'] == self.user_name:
                user['ready_status'] = ready_status
                break
        
        self.broadcast_user_list_update()

    def broadcast_user_list_update(self):
        users_in_room = [{'user_name': user['user_name'], 'ready_status': user['ready_status']} for user in self.rooms[self.room_name]]

        all_ready = all(user['ready_status'] for user in self.rooms[self.room_name])
        if all_ready:
            users = [user['user_name'] for user in self.rooms[self.room_name]]
            self.add_participants_to_session(users)

        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': 'server_user_list_update',
                'users': users_in_room
            }
        )

    #-----------------------------------------------------------------------#

    #-----------------------HANDLE UPDATES TO DB----------------------------#
    def create_new_session(self, room_name):
        session = PastSession.objects.create(roomName=room_name, startTime=timezone.now())
        return session

    def add_participants_to_session(self, users):
        self.session = self.create_new_session(self.room_name)
        for user in users:
            user_object = get_user_model().objects.get(username=user)
            SessionParticipant.objects.create(
                session=self.session,
                user=user_object
            )
    
    def update_session_end_time(self, session):
        session.endTime = timezone.now()
        session.save()

    #----------------HANDLE RECOMMENDATION SYSTEM UPDATES-------------------#
    def process_user_choice(self, client_choice, movie_id):
        print(f"{client_choice} : {movie_id}")
        # Send the message to the group
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "server_echo_message",
                "message": {
                    "username": self.user_name,
                    "choice": client_choice,
                    "movie_id": movie_id,
                },
            }
        )
        # TODO: Update to add choice to Interest table

    def generate_mock_recommendations(self):
        mock_recommendations = [
            {"title": "Recommendation 1", "Description": "Description 1"},
            {"title": "Recommendation 2", "Description": "Description 2"},
        ]
        return mock_recommendations
    
    

    def generate_recommendations(self, num_recommendations):
        #TBD: add lr-suggestion model
        sessionInterests = Interest.objects.filter(user__sessionparticipant__session__roomName = self.room_name).order_by("user")
        users = list(sessionInterests.values_list("user"))
        movieIDs = list(sessionInterests.values_list("movieID"))
        user_likes = list(sessionInterests.values_list("like"))
        recommend_IDs = []
        if(len(users)==0):
            print('using default predictions')
            recommend_IDs = self.simUserAlgo.default_prediction(num_predictions=num_recommendations)
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
            recommend_IDs = self.simUserAlgo.predict(users_movieIDs,users_ratings,num_predictions=num_recommendations)
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

    def send_recommendations(self):
        recs = self.generate_recommendations(10)
        self.send(text_data=json.dumps({
            "type": "recommendations",
            "message": recs
        }))
    
    def send_mock_recommendations(self):
        mock_recommendations = self.generate_mock_recommendations()
        self.send(text_data=json.dumps({
            "type": "recommendations",
            "message": mock_recommendations
        }))
    #-----------------------------------------------------------------------#

    #-----------------------SERVER EVENT FUNCTIONS--------------------------#
    def server_user_list_update(self, event):
        # Server calls function when user joins, leaves room, or updates 'ready' status
        self.send(text_data=json.dumps({
            'type': 'server_user_list_update',
            'users': event['users']
        }))
    
    def server_echo_message(self, event):
        # Receive the message from the group and send it back to the sender
        message = event["message"]
        self.send(text_data=json.dumps(message))
        
    def server_terminate_message(self, event):
        self.send(text_data=json.dumps({
            "type": "server_terminate"
        }))

    def get_matches(self):
        sessionInterests = Interest.objects.filter(user__sessionparticipant__session__roomName = self.room_name).order_by("user")
        users = list(sessionInterests.values_list("user"))
        movieIDs = list(sessionInterests.values_list("movieID"))
        user_likes = list(sessionInterests.values_list("like"))

        participant_likes = {}
        
        for user, movieID, like in zip(users, movieIDs, user_likes):
            if like:  # Only consider movies that the participant likes
                if user not in participant_likes:
                    participant_likes[user] = []
                participant_likes[user].append(movieID)

        # Find the intersection of likes among all participants
        matchList = set.intersection(*[set(likes) for likes in participant_likes.values()])
        return list(matchList)
    
    def send_matches(self):
        matches = self.get_matches()
        self.send(text_data=json.dumps({
            "type": "matches",
            "message": matches
        }))

        

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


