import React, { useState, useEffect } from 'react';
import {
  TouchableWithoutFeedback, View, Text, StyleSheet, Image, TouchableOpacity,
} from 'react-native';
import { ENDPOINT_BASE_URL, TMDB_BASE_POSTER_URL, TMDB_API_KEY } from '../config/constants';
import { useAuth } from '../config/AuthContext';
import Gallery from './Gallery';
import axios from 'axios';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 200,
    marginHorizontal: 25,
    // margin:200,
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
  const [movieData, setMovieData] = useState(null) 

  // Function to create WebSocket
  const createWebSocket = () => {
    if (channelId === '') return;
    const ws = new WebSocket(`ws://${ENDPOINT_BASE_URL}:8080/ws/bar/${channelId}/${username}/`, {
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

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/{movie_id}?api_key=${TMDB_API_KEY}`);
        setMovieData(response.data);
      } catch (error) {
        console.error('Error fetching movie data:', error);
      }
    };

    // Fetch movie data when channelId changes
    if (channelId !== '') {
      fetchMovieData();
    }
  }, [channelId]);

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

    return (
    <View style={styles.page}>
      {/* Render waiting room if websocket is not null and all users are not ready */}
      {websocket && !allInRoomReady ? (
        <View>
          <Text style={[styles.headertext, { fontSize: 28, padding: 10 }]}>Waiting Room</Text>
          {/* Render user list with ready status */}
          {Object.keys(usersReadyStatus).map((user) => (
            <View style={styles.smallcontainer} key={user}>
              <Text style={styles.profiletext}>{user}</Text>
              <Text style={styles.profiletext}>{`${usersReadyStatus[user]}`}</Text>
            </View>
          ))}
          {/* Render buttons for closing connection and updating ready status */}
          <View style={styles.buttonContainer}>
            <TouchableWithoutFeedback onPress={closeWebSocket}>
              <View style={styles.button}>
                <Text style={styles.text}>Close Connection</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={updateReadyStatus}>
              <View style={styles.button}>
                <Text style={styles.text}>{readyStatus ? 'Ready' : 'Not Ready'}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      ) : (
        /* Render movie gallery and control buttons if all users are ready */
        <View style={styles.container}>
          {movieData && (
            <Gallery
              posters={[`${TMDB_BASE_POSTER_URL}${movieData.poster_path}`]}
              reviews={movieData.reviews}
              trailers={movieData.trailers}
            />
          )}
          {/* Render control buttons */}
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
          {/* Render button to close connection */}
          <TouchableWithoutFeedback onPress={closeWebSocket}>
            <View style={styles.button}>
              <Text style={styles.text}>Close Connection</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  );
}
