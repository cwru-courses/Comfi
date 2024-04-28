import React, { useState, useEffect } from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { ENDPOINT_BASE_URL } from '../config/constants';
import { useAuth } from '../config/AuthContext';
import Gallery from './Gallery';
import Waiting from './waiting';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    justifyContent: 'center',
    alignItems: 'left',
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
  text: {
    textAlign: 'left',
    fontSize: 24,
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
    borderRadius: 10,
  },
  page: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    paddingTop: 55,
    padding: 5,
    width: '100%',
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
  const { username } = useAuth();
  const [websocket, setWebSocket] = useState(null);
  const [channelId, setChannelId] = useState('');
  const [readyStatus, setReadyStatus] = useState(false); // 'Ready' status of user
  const [usersReadyStatus, setUsersReadyStatus] = useState({}); // 'Ready' status of users in room
  const [usersInRoom, setUsersInRoom] = useState([]); // All users in room
  const [allInRoomReady, setAllInRoomReady] = useState(false); // All users in room ready
  const [recommendations, setRecommendations] = useState(null);
  const [movieIndex, setMovieIndex] = useState(0);
  const [recsReady, setRecsReady] = useState(false);

  // Function to create WebSocket
  const createWebSocket = () => {
    if (channelId === '') return;
    const ws = new WebSocket(
      `ws://${ENDPOINT_BASE_URL}:8000/ws/bar/${channelId}/${username}/`,
      {
        onOpen: () => console.log('opened'),
        shouldReconnect: true,
        timeout: 120,
      },
    );
    // eslint-disable-next-line no-use-before-define
    ws.onmessage = handleWebSocketMessage;
    setWebSocket(ws);
  };

  useEffect(
    () => () => {
      if (websocket) {
        websocket.close();
        setWebSocket(null);
        setRecommendations(null);
      }
    },
    [],
  );

  useEffect(() => {
    if (recommendations) {
      setRecsReady(true);
      console.log(recommendations);
    } else {
      console.log('recommendations not ready yet');
    }
  }, [recommendations]);

  useEffect(() => {
    const numUsersReady = Object.values(usersReadyStatus).filter(
      (status) => status,
    ).length;

    const allReady = usersInRoom.length > 0 && numUsersReady === usersInRoom.length;

    // Once all in the room ready, we need to get the recommendation to show to the user
    if (allReady) {
      testRecommendataions();
    }

    setAllInRoomReady(allReady);
  }, [usersReadyStatus, usersInRoom]);

  useEffect(() => {});

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
    } else if (data.type === 'recommendations') {
      console.log(data.message);
      setRecommendations((recs) => [
        ...(recs || []),
        ...data.message,
      ]);
    } else if (data.type === 'server_terminate') {
      closeWebSocket();
    } else if (data.type === 'error') {
      console.log(data.message);
    }
  };

  const sendChoice = (userChoice, movieID) => {
    // Send the 'choice' for a movie to server
    if (websocket) {
      websocket.send(
        JSON.stringify({
          type: 'client_choice',
          choice: userChoice,
          movie_id: movieID,
        }),
      );
    }
  };

  const closeWebSocket = () => {
    // Reset all state variables to initial value on room closure
    setRecommendations(null);
    setMovieIndex(0);
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
      websocket.send(
        JSON.stringify({ type: 'client_ready_status', status: newReadyStatus }),
      );
    }
  };

  const testRecommendataions = () => {
    websocket.send(JSON.stringify({ type: 'server_recommendations' }));
  };

  return (
    <View style={styles.page}>
      {websocket == null && (
        <>
          <Text style={styles.headertext}>
            Create / Join
          </Text>
          <View style={{ padding: 60 }} />
          <TextInput placeholder="Room Name" style={styles.input} onChangeText={setChannelId} autoCapitalize="none" autoCorrect={false} />
          <TouchableWithoutFeedback onPress={createWebSocket}>
            <View>
              <View style={styles.button}>
                <Text style={styles.text}>
                  Join
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </>
      )}
      {websocket && !allInRoomReady && (

      // -----------WAITING SCREEN-------------//
        <View style={{ width: '100%', position: 'absolute', height: '100%' }}>
          <Waiting
            users={usersReadyStatus}
            handleStatusChange={updateReadyStatus}
            userReadyStatus={readyStatus}
            exitRoom={() => closeWebSocket}
          />
        </View>
        // --------------------------------------//

      )}
      {allInRoomReady && (recsReady ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableWithoutFeedback onPress={closeWebSocket}>
              <Image style={{ aspectRatio: 1, width: 25 }} source={require('../assets/arrow.png')} />
            </TouchableWithoutFeedback>
            <Text style={{
              fontSize: 32, width: '90%', color: '#d81159', textAlign: 'center',
            }}
            />
          </View>
          <View style={styles.container}>
            <Gallery
              movieDetails={recommendations[movieIndex]}
              handleUserChoice={sendChoice}
              onNext={() => {
                setMovieIndex((prevIndex) => prevIndex + 1);
                if (movieIndex > (recommendations.length / 2)) {
                  testRecommendataions();
                }
              }}
              movieIndex
            />
          </View>
        </>
      ) : (
        <ActivityIndicator size="large" color="white" />
      ))}
    </View>
  );
}
