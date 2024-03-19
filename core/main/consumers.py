import asyncio
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import PastSession, SessionParticipant

class EchoConsumer(WebsocketConsumer):
    def connect(self):
        self.user_name = self.scope['url_route']['kwargs']['user_name']
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.group_name = f"chat_{self.room_name}"

        # Join the group
        async_to_sync(self.channel_layer.group_add)(
            self.group_name,
            self.channel_name
        )

        # Accept the connection
        self.accept()

        # Add user to new session
        session = self.get_create_new_session(self.room_name)
        self.add_participant_to_session(session, self.user_name)

        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "echo_message",
                "message": f"{self.user_name} has joined",
            }
        )
        #self.periodic_send_data_task = asyncio.run(self.periodic_send_data())

    def disconnect(self, code):
        # Leave the group
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )
        session = self.get_create_new_session(self.room_name)
        self.update_session_end_time(session)
        self.periodic_send_data_task.cancel()

    def receive(self, text_data):
        # Parse the JSON message
        try:
            message = json.loads(text_data)
        except json.JSONDecodeError:
            print("Invalid JSON data received")
            return

        # Send the message to the group
        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "echo_message",
                "message": message,
            }
        )

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

    def echo_message(self, event):
        # Receive the message from the group and send it back to the sender
        message = event["message"]
        self.send(text_data=json.dumps(message))

    async def periodic_send_data(self):
        try:
            while True:
                # Retrieve data for each user in the session
                data_for_users = self.get_recommended_list()
                
                # Send data to all users in the room
                self.send_recommendations_to_users(data_for_users)

                # Wait for some time before sending data again (e.g., every 5 seconds)
                await asyncio.sleep(5)
        except asyncio.CancelledError:
            pass

    @sync_to_async
    def get_recommended_list(self):
        session = self.get_create_new_session(self.room_name)
        recommendations = {}
        participants = SessionParticipant.objects.filter(session=session)
        for participant in participants:
            user_data = {'username': participant.user.username, 'recommendations': {'movieID1', 'movieID2', 'movieID3'}}
            recommendations[participant.user.username] = user_data
        return recommendations

    @sync_to_async
    def send_recommendations_to_users(self, recommendation_list):
        user = self.user_name
        async_to_sync(self.channel_layer.send)(
            user,
            {
                "type": "send.recommendations",
                "data": recommendation_list
            }
        )

    def send_recommendations(self, event):
        data = event["data"]
        self.send(text_data=json.dumps(data))
