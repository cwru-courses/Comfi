import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { ENDPOINT_BASE_URL, TMDB_API_KEY, TMDB_BASE_POSTER_URL } from '../config/constants';
import { useAuth } from '../config/AuthContext';

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    paddingTop: 55,
    padding: 5,
  },
  container: {
    flex: 1,
    backgroundColor: 'dimgrey',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    margin: 5,
    padding: 10,
  },
  smallcontainer: {
    flex: 1,
    backgroundColor: 'dimgrey',
    alignItems: 'right',
    justifyContent: 'right',
    textAlign: 'left',
    borderRadius: 10,
    margin: 5,
    padding: 10,
  },
  text: {
    color: 'white',
    fontSize: 16,
    padding: 2,
    margin: 2,
    textAlign: 'left',
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  titletext: {
    color: 'white',
    fontSize: 28,
    padding: 2,
    fontWeight: 'bold',
    margin: 2,
    textAlign: 'left',
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  profiletext: {
    color: 'white',
    fontSize: 20,
    padding: 2,
    margin: 2,
    textAlign: 'left',
    justifyContent: 'flex-end',
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  image: {
    aspectRatio: 2 / 3,
    width: '60%',
  },
});

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { username } = useAuth();
  const [pastSessions, setPastSessions] = useState(null);
  const [movieOTD, setMovieOTD] = useState([]);

  // Could log errors when calling backend, except for login or logout.
  useEffect(() => {
    if (!isAuthenticated) {
      axios.get(
        `http://${ENDPOINT_BASE_URL}:8000/home/`,
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
      ).then((res) => {
        console.log(res.data.message);
      }).catch((err) => {
        console.log(err);
      });
      setIsAuthenticated(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    axios
      .get(
        'https://api.themoviedb.org/3/trending/movie/week?language=en-US',
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${TMDB_API_KEY}`,
          },
        },
      )
      .then((response) => {
        setMovieOTD(response.data.results[0]);
        console.log(response.data.results[0]);
      })
      .catch((err) => console.log(err));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getPreviousSessions();
    }, []),
  );

  const getPreviousSessions = () => {
    axios.get(`http://${ENDPOINT_BASE_URL}:8000/api/pastSession?username=${username}`)
      .then((res) => {
        if (res.status === 200) {
          setPastSessions(res.data);
        }
      }).catch((err) => console.log(err));
  };

  return (
    <View style={styles.page}>
      <StatusBar />
      <ScrollView>
        {/* Movie of the Day */}
        <View style={styles.container}>
          <Text style={styles.titletext}>Movie Of The Day</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 5 }}>
            <Image
              source={{ uri: TMDB_BASE_POSTER_URL.concat(movieOTD.poster_path) }}
              style={styles.image}
            />
          </View>
          <Text style={styles.text}>
            {movieOTD.overview}
          </Text>
        </View>
        <Text style={styles.titletext}>Recent Groups</Text>
        {
          pastSessions ? (
            pastSessions.map((session) => (
              <View style={styles.smallcontainer} key={session.sessionID}>
                <Image
                  source={{ uri: 'https://picsum.photos/50' }}
                  style={{
                    width: 50, height: 50, borderRadius: 100, padding: 5,
                  }}
                />
                <Text style={styles.profiletext}>{session.roomName}</Text>
              </View>
            ))
          ) : (
            <Text>Empty</Text>
          )
        }
      </ScrollView>
    </View>
  );
}
