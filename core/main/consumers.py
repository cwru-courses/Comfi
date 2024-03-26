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

        # Join the group
        async_to_sync(self.channel_layer.group_add)(
            self.group_name,
            self.channel_name
        )

        # Add user to new session
        # TODO: Move these functions to after everyone in the room has 'ready' status as True
        session = self.get_create_new_session(self.room_name)
        self.add_participant_to_session(session, self.user_name)

        # Notify users of a new join
        self.add_user_to_room()
        self.send_user_list_update()

        # Accept the connection
        self.accept()

    def disconnect(self, code):
        self.remove_user_from_room()

        # Leave the group
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

        # TODO: Move thse functions to after everyone leaves the room
        session = self.get_create_new_session(self.room_name)
        self.update_session_end_time(session)

        # Send a message to the group indicating a user has left
        self.send_user_list_update()

    def receive(self, text_data):
        # Parse the JSON message
        try:
            message = json.loads(text_data)
            message_type = message.get("type")
        except json.JSONDecodeError:
            print("Invalid JSON data received")
            return
        
        if message_type == 'client_ready_status':
            self.broadcast_ready_status(message.get('status', False))
        elif message_type == 'client_choice':
            self.process_user_choice(message.get('choice', False))
        elif message_type == 'server_recommendations':
            self.send_mock_recommendations()

    #--------------------HANDLE ROOM STATUS UPDATES-------------------------#
    def broadcast_ready_status(self, ready_status):
        # Broadcasts the ready status to all users in the group
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': 'server_ready_status',
                'user_name': self.user_name,
                'ready': ready_status
            }
        )

    def send_user_list_update(self):
        # Send an updated list of users in the room to all users
        users_in_room = self.get_users_in_room()
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                'type': 'server_user_list_update',
                'users': users_in_room
            }
        )

    def add_user_to_room(self):
        if self.room_name not in self.rooms:
            self.rooms[self.room_name] = []
        self.rooms[self.room_name].append(self.user_name)

    def remove_user_from_room(self):
        if self.room_name in self.rooms:
            self.rooms[self.room_name].remove(self.user_name)

    def get_users_in_room(self):
        if self.room_name in self.rooms:
            return self.rooms[self.room_name]
        else:
            return []
    #-----------------------------------------------------------------------#

    #-----------------------HANDLE UPDATES TO DB----------------------------#
    def get_create_new_session(self, room_name):
        try:
            # Update existing session for all users in room
            session = PastSession.objects.get(roomName=room_name, endTime__isnull=True)
        except PastSession.DoesNotExist:
            # If no session exists, create a new session
            session = PastSession.objects.create(roomName=room_name, startTime=timezone.now())
        return session

    def add_participant_to_session(self, session, username):
        User = get_user_model()
        user = User.objects.get(username=username)
        participant = SessionParticipant.objects.create(session=session, user=user)
        return participant
    
    def update_session_end_time(self, session):
        session.endTime = timezone.now()
        session.save()

    #----------------HANDLE RECOMMENDATION SYSTEM UPDATES-------------------#
    def process_user_choice(self, data):
        choice = data.get('client_choice')

        # Send the message to the group
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "server_echo_message",
                "message": {
                    "username": self.user_name,
                    "choice": choice
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
        # Server calls function when user joins or leaves room
        self.send(text_data=json.dumps({
            'type': 'server_user_list_update',
            'users': event['users']
        }))

    def server_ready_status(self, event):
        # Server calls function when user ready status is updated
        self.send(text_data=json.dumps({
            'type': 'server_ready_status',
            'user_name': event['user_name'],
            'ready': event['ready']
        }))
    
    def server_echo_message(self, event):
        # Receive the message from the group and send it back to the sender
        message = event["message"]
        self.send(text_data=json.dumps(message))
    #-----------------------------------------------------------------------#