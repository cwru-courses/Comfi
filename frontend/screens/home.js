import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { ENDPOINT_BASE_URL } from '../config/constants';
import { useAuth } from '../config/AuthContext';

const styles = StyleSheet.create({
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
  button: {
    backgroundColor: 'grey',
    borderRadius: 12,
    padding: 10,
    margin: 5,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 32,
    padding: 2,
    fontWeight: 'bold',
    margin: 2,
    textAlign: 'left',
    flexDirection: 'column',
    flexWrap: 'wrap',
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

  whitetext: {
    color: 'white',
    fontSize: 16,
    padding: 2,
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
    // flexDirection: 'row',
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  page: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    paddingTop: 55,
    padding: 5,

  },
});

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { username } = useAuth();
  const [pastSessions, setPastSessions] = useState(null);

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

  useFocusEffect(
    React.useCallback(() => {
      getPreviousSessions();
    }, []),
  );

  const getPreviousSessions = () => {
    axios.get(`http://${ENDPOINT_BASE_URL}:8000/api/pastSession?username=${username}`)
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
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
          <Text style={styles.text}>
            Here is a description of the movie. Descriptions can be rather long so it may wrap
            to the next line like so. here is some more text to see if the box will incrse in
            size or not
          </Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 5 }}>
            <Image
              source={{ uri: 'https://picsum.photos/300' }}
              style={{ width: 300, height: 300 }}
            />
          </View>
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
