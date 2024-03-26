import React, { useState, useEffect } from 'react';
import {
  TouchableWithoutFeedback, View, Text, StyleSheet, TextInput, Image, ScrollView, TouchableOpacity,
} from 'react-native';
import { ENDPOINT_BASE_URL } from '../config/constants';
import { useAuth } from '../config/AuthContext';
import Gallery from './Gallery';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 200,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    elevation: 20,
    backgroundColor: 'silver',
    marginHorizontal: 15,
    marginBottom: 200,
  },
  imagebutton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    elevation: 20,
    backgroundColor: 'silver',
    marginHorizontal: 15,
    marginBottom: 200,
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'dimgray',
  },
  input: {
    height: 40,
    width: 300,
    margin: 10,
    borderWidth: 1.5,
    padding: 10,
    borderColor: 'grey',
    backgroundColor: 'white',
  },
  image: {
    justifyContent: 'center',
    height: 500,
    aspectRatio: 2 / 3,
  },
  imageforbutton: {
    justifyContent: 'center',
    height: 50,
    aspectRatio: 2 / 3,
  },
  page: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    paddingTop: 55,
    padding: 5,

  },
  headertext: {
    color: '#d81159',
    fontSize: 32,
    padding: 2,
    fontWeight: 'bold',
    margin: 2,
    textAlign: 'left',
    flexDirection: 'column',
    flexWrap: 'wrap',
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
      websocket.send(JSON.stringify({ type: 'client_choice', client_message: userChoice }));
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

  // images stores the gallery pictures
  const images = [
    // '../assets/DjangoUnchainedReviews.png',
    'https://www.gamespot.com/a/uploads/original/1597/15976769/4097300-download%2826%29.jpg',
    'https://picsum.photos/20/30',
    'https://picsum.photos/200/300',
    'https://picsum.photos/2000/3000',
    // 'https://picsum.photos/20000/30000',
  ];

  return (
    <View style={styles.page}>
      <ScrollView>
        {websocket !== null ? (
          <>
            <View style={styles.container}>
              <Gallery images={images} />

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.imagebutton} onPress={() => sendChoice({ choice: 'Previous', movieID: 'MOVIE_ID' })}>
                  <Image style={styles.imageforbutton} source={require('../assets/previous.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagebutton} onPress={() => sendChoice({ choice: 'Like', movieID: 'MOVIE_ID' })}>
                  <Image style={styles.imageforbutton} source={require('../assets/play_button.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagebutton} onPress={() => sendChoice({ choice: 'Next', movieID: 'MOVIE_ID' })}>
                  <Image style={styles.imageforbutton} source={require('../assets/next.png')} />
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
            <Text style={styles.headertext}>
              Create/Join Group
            </Text>
            <View style={{ padding: 60 }} />
            <TextInput placeholder="Room Name" style={styles.input} onChangeText={setChannelId} autoCapitalize="none" autoCorrect={false} />
            <TouchableWithoutFeedback onPress={reopenWebSocket}>
              <View style={{ alignSelf: 'center', padding: 20 }}>
                <View style={styles.button}>
                  <Text style={styles.text}>
                    Open New Connection
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </>
        )}
      </ScrollView>
    </View>
  );
}
