import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ENDPOINT_BASE_URL } from '../config/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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

export default function HomeScreen({ route }) {
  const { setUserToken } = route.params;
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Could log errors when calling backend, except for login or logout.
  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line no-use-before-define
      // checkAuthentication(refreshToken);
      axios.get(
        `http://${ENDPOINT_BASE_URL}:8000/home/`,
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
      ).then((res) => {
        setMessage(res.data.message);
      }).catch((err) => {
        console.log(err);
      });
      setIsAuthenticated(true);
    }
  }, [isAuthenticated]);

  const handleSignoutPress = async () => {
    axios.post(
      `http://${ENDPOINT_BASE_URL}:8000/logout/`,
      { refresh_token: SecureStore.getItem('refresh_token') },
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    ).then(() => {
      SecureStore.deleteItemAsync('access_token');
      SecureStore.deleteItemAsync('refresh_token');
      axios.defaults.headers.common.Authorization = undefined;
      setUserToken(null);
    }).catch((err) => console.log(err));
  };

  return (
    <View>
      <View style={styles.container}>
        <Text>
          This is the home screen
        </Text>
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
    </View>
  );
}