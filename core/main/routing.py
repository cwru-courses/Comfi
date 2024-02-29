# chat/routing.py
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(
        r"ws/bar/(?P<room_name>\w+)/(?P<user_name>\w+)/$",
        consumers.EchoConsumer.as_asgi(),
    ),
]