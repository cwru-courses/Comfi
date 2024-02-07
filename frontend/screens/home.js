import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView, Image
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'navy',
    alignItems: 'left',
    justifyContent: 'top',
    padding: 5,
    width: 300,
    height: 300
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
    padding:2
  },
  page: {
    flex:1,
    backgroundColor: 'midnightblue',
    padding: 60

  }
});

const TEMP_IP = 'CHANGE_TO_YOUR_IP_ADDR';

export default function HomeScreen({ route }) {
  const { setUserToken } = route.params;
  const [message, setMessage] = useState('');

  // Could log errors when calling backend, except for login or logout.
  useEffect(() => {
    const refreshToken = SecureStore.getItem('refresh_token');

    // eslint-disable-next-line no-use-before-define
    if (!checkAuthentication(refreshToken)) {
      setUserToken(null);
    }
  }, []);

  const handleSignoutPress = async () => {
    axios.post(
      `http://${TEMP_IP}:8000/logout/`,
      { refresh_token: SecureStore.getItem('refresh_token') },
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    ).then(() => {
      SecureStore.deleteItemAsync('access_token');
      SecureStore.deleteItemAsync('refresh_token');
      setUserToken(null);
    }).catch((err) => console.log(err));
  };

  function checkAuthentication(refreshToken) {
    let responseMessage = '';

    const isAccessTokenValid = axios.get(
      `http://${TEMP_IP}:8000/home/`,
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    ).then((res) => {
      responseMessage = res.data.message;
      setMessage(responseMessage);
      return true;
    }).catch(() => false);
    if (isAccessTokenValid) {
      return true;
    }
    const isRefreshTokenValid = axios.post(`http://${TEMP_IP}:8000/token/refresh/`, { refresh: refreshToken }).then((res) => {
      // eslint-disable-next-line camelcase
      const { access, refresh } = res.data;
      setUserToken(access);
      SecureStore.setItem('access_token', access);
      SecureStore.setItem('refresh_token', refresh);
      axios.defaults.headers.common.Authorization = `Bearer ${access}`;
      return true;
    }).catch((err) => { console.log(err); return false; });

    if (isRefreshTokenValid) {
      axios.get(
        `http://${TEMP_IP}:8000/home/`,
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
      ).then((res) => {
        setMessage(res.data.message);
      }).catch((err) => console.log(err));
      return true;
    }
    return false;
  }

  return (
    <View style = {styles.page}>
      <ScrollView>
      <View style={styles.container}>
        <Text style = {styles.text}>
            <Text style={{fontWeight:'bold',fontSize:20}}>Movie Of The Day</Text>~{"\n"}
            Here is a description of the movie. Descriptions can be rather long so it may wrap to the next line like so.
        </Text>
        <Image 
        Source = {{uri:'https://picsum.photos/100'}} 
        style = {{width: 100, height:100
          // alignItems:'right',justifyContent:'bottom'
        }}
        />

      </View>
      <View>
        <Text>
          {message}
        </Text>
      </View>
      <TouchableWithoutFeedback onPress={handleSignoutPress}>
        <View style={styles.button}>
          <Text style={styles.text}>
            Sign out
          </Text>
        </View>
      </TouchableWithoutFeedback>
      </ScrollView>
    </View>
  );
}
