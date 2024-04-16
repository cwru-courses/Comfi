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
    paddingTop: 25,
    justifyContent: 'center',
    alignItems: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 10,
    // marginHorizontal: 25,
    // margin: 200,
    width: 100,
    height: 100,
    borderRadius: 50,
    paddingTop: 150,
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
    marginBottom: 10,
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
    textAlign: 'left',
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
  smallcontainer: {
    // flex: 1,
    backgroundColor: 'dimgrey',
    alignItems: 'right',
    justifyContent: 'right',
    textAlign: 'left',
    borderRadius: 10,
    margin: 5,
    padding: 10,
  },
  profiletext: {
    color: 'white',
    fontSize: 20,
    padding: 2,
    margin: 2,
    textAlign: 'left',
    justifyContent: 'flex-end',
    // flexDirection: 'row',
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
});

export default function PlayScreen() {
  const { username } = useAuth();
  const [websocket, setWebSocket] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [readyStatus, setReadyStatus] = useState(false); // 'Ready' status of user
  const [usersReadyStatus, setUsersReadyStatus] = useState({}); // 'Ready' status of users in room
  const [usersInRoom, setUsersInRoom] = useState([]); // All users in room
  const [allInRoomReady, setAllInRoomReady] = useState(false); // All users in room ready

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

  useEffect(() => () => {
    if (websocket) {
      websocket.close();
      setWebSocket(null);
    }
  }, []);

  useEffect(() => {
    const numUsersReady = Object.values(usersReadyStatus).filter((status) => status).length;

    const allReady = usersInRoom.length > 0 && numUsersReady === usersInRoom.length;

    setAllInRoomReady(allReady);
  }, [usersReadyStatus, usersInRoom]);

  const handleWebSocketMessage = (e) => {
    const data = JSON.parse(e.data);

    if (data.type === 'server_user_list_update') {
      const { users } = data;

      const newUsersInRoom = [];
      const newUsersReadyStatus = {};

      users.forEach((user) => {
        newUsersInRoom.push(user.user_name);
        newUsersReadyStatus[user.user_name] = user.ready_status;
      });

      setUsersInRoom(newUsersInRoom);
      setUsersReadyStatus(newUsersReadyStatus);
    } else if (data.type === 'server_echo_message') {
      console.log(data.message);
    } else if (data.type === 'error') {
      console.log(data.message);
    }
  };

  const sendChoice = (userChoice, movieID) => {
    // Send the 'choice' for a movie to server
    if (websocket) {
      websocket.send(JSON.stringify({ type: 'client_choice', choice: userChoice, movie_id: movieID }));
    }
  };

  const closeWebSocket = () => {
    // Reset all state variables to initial value on room closure
    setReadyStatus(false);
    setAllInRoomReady(false);
    setUsersReadyStatus({});
    setUsersInRoom([]);

    // Close open websocket
    if (websocket) {
      websocket.close();
      setWebSocket(null);
    }
  };

  const updateReadyStatus = () => {
    // Send the 'ready' status of user to server
    if (websocket) {
      const newReadyStatus = !readyStatus;
      setReadyStatus(newReadyStatus);
      websocket.send(JSON.stringify({ type: 'client_ready_status', status: newReadyStatus }));
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
            <View>
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
        <View>
          <Text style={[styles.headertext, { fontSize: 28, padding: 10 }]}>Waiting Room</Text>
          {
            Object.keys(usersReadyStatus).map((user) => (
              <View style={styles.smallcontainer} key={user}>
                <Text style={styles.profiletext}>{user}</Text>
                <Text style={styles.profiletext}>{`${usersReadyStatus[user]}`}</Text>
              </View>
            ))
          }
          <View style={styles.buttonContainer}>
            <TouchableWithoutFeedback onPress={closeWebSocket}>
              <View style={styles.button}>
                <Text style={styles.text}>
                  Close Connection
                </Text>
              </View>
            </TouchableWithoutFeedback>
            {readyStatus ? (
              <TouchableWithoutFeedback onPress={updateReadyStatus}>
                <View style={styles.button}>
                  <Text style={styles.text}>
                    Ready
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            ) : (
              <TouchableWithoutFeedback onPress={updateReadyStatus}>
                <View style={styles.button}>
                  <Text style={styles.text}>
                    Not Ready
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </View>
        // --------------------------------------//

      ) : (
        <>
          <View style={styles.container}>
            <Gallery images={images} />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.imagebutton} onPress={() => sendChoice('Previous', 'MOVIE_ID')}>
                <Image style={styles.imageforbutton} source={require('../assets/previous.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.imagebutton} onPress={() => sendChoice('Like', 'MOVIE_ID')}>
                <Image style={styles.imageforbutton} source={require('../assets/play_button.png')} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.imagebutton} onPress={() => sendChoice('Next', 'MOVIE_ID')}>
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
