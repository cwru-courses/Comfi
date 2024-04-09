import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import PastSession, SessionParticipant

class RecommendationServiceConsumer(WebsocketConsumer):
    rooms = {}

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
            self.send_mock_recommendations()

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
    #-----------------------------------------------------------------------#