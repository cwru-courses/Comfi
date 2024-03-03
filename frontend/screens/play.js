import React, { useState, useEffect } from 'react';
import {
  TouchableWithoutFeedback, View, Text, StyleSheet, TextInput, Image,
} from 'react-native';
import { ENDPOINT_BASE_URL } from '../config/constants';
import { useAuth } from '../config/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 200,
    paddingHorizontal: 20,
    width: 100,
    height: 100,
    borderRadius: 50
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    elevation: 20,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 200
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'gray',
  },
  input: {
    height: 40,
    width: 300,
    margin: 10,
    borderWidth: 1.5,
    padding: 10,
  },
  image: {
    justifyContent: 'center',
    height: 500,
    aspectRatio: 2 / 3,
  },
});

export default function PlayScreen() {
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [websocket, setWebSocket] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [message, setMessage] = useState('');
  const { username } = useAuth();

  // Function to create WebSocket
  const createWebSocket = () => {
    if (channelId === '') return;
    const ws = new WebSocket(`ws://${ENDPOINT_BASE_URL}:8000/ws/bar/${channelId}/${username}/`, {
      onOpen: () => console.log('opened'),
      shouldReconnect: true,
      timeout: 120,
    });
    // eslint-disable-next-line no-use-before-define
    ws.onmessage = handleWebSocketMessage;
    setWebSocket(ws);
  };

  // Create WebSocket on component mount
  useEffect(() => () => {
    if (websocket) {
      websocket.close();
      setWebSocket(null);
    }
  }, []);

  const handleWebSocketMessage = (e) => {
    setMessage(e.data);
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
      websocket.send(JSON.stringify({ type: 'client.choice', client_message: userChoice }));
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
    if (channelId === '') return;
    createWebSocket();
  };

  //images stores the gallery pictures
  const images = [
    './comphy/assets/DjangoUnchained.jpg',
    'https://picsum.photos/20/20',
  ];

  return (
    <View style={styles.container}>
      {websocket !== null ? (
        <>
          <View>
            <Text>
              Waiting for a response:
              {' '}
              {isWaitingForResponse ? 'true' : 'false'}
            </Text>
            <Text>{message}</Text>
          </View>
          <View>
            <Image style={styles.image} source={require('../assets/test.jpeg')} />
          </View>
            <View style={styles.container}>
              <Gallery images={images}/>
              <Text style={styles.text}>Django Unchained</Text>
              <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => sendChoice({choice: 'Previous', movieID: 'MOVIE_ID'})}>
                <Image style={styles.image} source={require('./Comfi/assets/previous.png')}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button) onPress={() => sendChoice({choice: 'Like', movieID: 'MOVIE_ID'})}>
                <Image style={styles.image} source={require('./Comfi/assets/play_button.png')}/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => sendChoice({choice: 'Next', movieID: 'MOVIE_ID'})}>
                <Image style={styles.image} source={require('./Comfi/assets/next.png')}/>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableWithoutFeedback onPress={closeWebSocket}>
            <View style={styles.button}>
              <Text style={styles.text}>
                Close Connection
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </>
      ) : (
        <>
          <Text>
            Create/Join Group
          </Text>
          <TextInput placeholder="Room Name" style={styles.input} onChangeText={setChannelId} autoCapitalize="none" autoCorrect={false} />
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
