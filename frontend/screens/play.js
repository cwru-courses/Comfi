import React, { useState, useEffect } from 'react';
import {
  TouchableWithoutFeedback, View, Text, StyleSheet,
} from 'react-native';
import { ENDPOINT_BASE_URL } from '../config/constants';

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    marginTop: 20,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContents: 'center',
  },
  button: {
    backgroundColor: 'black',
    borderRadius: 12,
    padding: 10,
    margin: 5,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

export default function Play() {
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [websocket, setWebSocket] = useState(null);
  const channelId = Math.floor(Math.random() * 10000);

  // Function to create WebSocket
  const createWebSocket = () => {
    const ws = new WebSocket(`ws://${ENDPOINT_BASE_URL}:8000/ws/bar/${channelId}/low/`, {
      onOpen: () => console.log('opened'),
      shouldReconnect: () => true,
    });
    ws.onmessage = handleWebSocketMessage;
    setWebSocket(ws);
  };

  // Create WebSocket on component mount
  useEffect(() => {
    createWebSocket();
    return () => {
      if (websocket) {
        websocket.close();
        setWebSocket(null);
      }
    };
  }, []);

  const handleWebSocketMessage = (e) => {
    const data = JSON.parse(e.data);
    console.log(data);
    if (data.type === 'connection_established' || data.type === 'progress') {
      setIsWaitingForResponse(true);
    } else if (data.type === 'completed') {
      setIsWaitingForResponse(false);
    } else if (data.type === 'error') {
      console.log(data.message);
      setIsWaitingForResponse(false);
    }
  };

  const sendChoice = (userChoice) => {
    if (websocket) {
      websocket.send(JSON.stringify({ type: 'choice', client_message: userChoice }));
    }
  };

  const closeWebSocket = () => {
    if (websocket) {
      websocket.close();
      setWebSocket(null);
    }
  };

  // Function to reopen WebSocket
  const reopenWebSocket = () => {
    createWebSocket();
  };

  return (
    <View style={styles.container}>
      <Text>Django Channel Test</Text>
      {websocket !== null ? (
        <View>
          <TouchableWithoutFeedback title onPress={() => sendChoice('Like')}>
            <View style={styles.button}>
              <Text style={styles.text}>
                Like
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => sendChoice('Dislike')}>
            <View style={styles.button}>
              <Text style={styles.text}>
                Dislike
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <View>
            <Text>
              Waiting for a response:
              {' '}
              {isWaitingForResponse ? 'true' : 'false'}
            </Text>
          </View>
          <TouchableWithoutFeedback onPress={closeWebSocket}>
            <View style={styles.button}>
              <Text style={styles.text}>
                Close Connection
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      ) : (
        <>
          <Text>
            THE CONNECTION IS CLOSED
          </Text>
          <TouchableWithoutFeedback onPress={reopenWebSocket}>
            <View style={styles.button}>
              <Text style={styles.text}>
                Open New Connection
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </>
      )}
    </View>
  );
}
