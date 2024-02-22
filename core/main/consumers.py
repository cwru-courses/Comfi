import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

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

        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            {
                "type": "echo_message",
                "message": f"{self.user_name} has joined",
            }
        )

    def disconnect(self, code):
        # Leave the group
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name
        )

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

    def echo_message(self, event):
        # Receive the message from the group and send it back to the sender
        message = event["message"]
        self.send(text_data=json.dumps(message))
