import React, { useState, useEffect } from 'react';
import {
  TouchableWithoutFeedback, View, Text, StyleSheet, TextInput, Image, TouchableOpacity,
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
  const [websocket, setWebSocket] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [readyStatus, setReadyStatus] = useState(false);
  const [usersReadyStatus, setUsersReadyStatus] = useState({});
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [allInRoomReady, setAllInRoomReady] = useState(false);
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
    const data = JSON.parse(e.data);

    if (data.type === 'server_user_list_update') {
      setUsersInRoom(data.users);
    } else if (data.type === 'server_ready_status') {
      console.log(data);
      allUsersReadyStatus();
      setUsersReadyStatus((prevState) => ({
        ...prevState,
        [data.user_name]: data.ready,
      }));
    } else if (data.type === 'error') {
      console.log(data.message);
    }
  };

  const sendChoice = (userChoice) => {
    if (websocket) {
      websocket.send(JSON.stringify({ type: 'client_choice', client_message: userChoice }));
    }
  };

  const closeWebSocket = () => {
    setReadyStatus(false);
    if (websocket) {
      websocket.close();
      setWebSocket(null);
    }
  };

  const allUsersReadyStatus = () => {
    let allReady = false;

    Object.keys(usersReadyStatus).map((userId) => {
      if (usersReadyStatus[userId] === 'true') {
        allReady = true;
      }
    });

    setAllInRoomReady(allReady);
  };

  const updateReadyStatus = () => {
    // STARTS!
    // Update to make sure all in room are ready.
    if (websocket) {
      setReadyStatus(!readyStatus);
      console.log(readyStatus);
      websocket.send(JSON.stringify({ type: 'client_ready_status', status: readyStatus }));
    }
  };

  // images stores the gallery pictures
  const images = [
    'https://www.gamespot.com/a/uploads/original/1597/15976769/4097300-download%2826%29.jpg',
    'https://picsum.photos/20/30',
    'https://picsum.photos/200/300',
    'https://picsum.photos/2000/3000',
  ];

  return (
    <View style={styles.page}>
      {websocket == null && (
        <>
          <Text style={styles.headertext}>
            Create/Join
          </Text>
          <View style={{ padding: 60 }} />
          <TextInput placeholder="Room Name" style={styles.input} onChangeText={setChannelId} autoCapitalize="none" autoCorrect={false} />
          <TouchableWithoutFeedback onPress={createWebSocket}>
            <View style={{ alignSelf: 'center', padding: 20 }}>
              <View style={styles.button}>
                <Text style={styles.text}>
                  Create New
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </>
      )}
      {websocket && (!allInRoomReady ? (

        // -----------WAITING SCREEN-------------//
        <View style={styles.container}>
          <Text style={[styles.headertext, { fontSize: 28 }]}>Waiting Room</Text>
          <Text style={{ color: 'green' }}>
            Users:
            {'\n'}
            {usersInRoom.map((user) => `${user}, `)}
            {'\n'}
            {'\n'}
            Ready Status:
            {'\n'}
            {Object.keys(usersReadyStatus).map((userId) => `${userId}: ${usersReadyStatus[userId]}\n`)}
          </Text>
          <TouchableWithoutFeedback style={styles.button} onPress={updateReadyStatus}>
            <Text style={{ color: 'white' }}>
              {readyStatus ? 'Ready' : 'Not Ready'}
            </Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={closeWebSocket}>
            <View style={styles.button}>
              <Text style={styles.text}>
                Close Connection
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        // --------------------------------------//

      ) : (
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
      ))}
    </View>
  );
}
