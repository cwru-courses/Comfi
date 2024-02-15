import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView, Image
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ENDPOINT_BASE_URL } from '../config/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgrey',
    alignItems: 'center',
    justifyContent: 'center',
    margin:5,
    padding: 10
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
    color: 'black',
    fontSize: 16,
    padding: 2,
    margin: 2,
    textAlign: 'left',
    flexDirection: 'column',
    flexWrap:'wrap'
  },
  whitetext:{
    color: 'white',
    fontSize: 16,
    padding:2,
    margin: 2,
    textAlign: 'left',
    flexDirection: 'column',
    flexWrap:'wrap'
  },
  page: {
    flex:1,
    backgroundColor: 'white',
    alignItems:'center',
    padding: 60

  }
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
    <View style = {styles.page}>
      <ScrollView>
      <View style={styles.container}>
      <Text style={{fontWeight:'bold',fontSize:20,flexWrap: 'wrap'}}>{"\n"}Movie Of The Day</Text>
        <Text style = {styles.text}>
            Here is a description of the movie. Descriptions can be rather long so it may wrap to the next line like so.
        </Text>
        <View style = {{alignItems:'center',justifyContent:'center',padding: 5}}>
        <Image 
        source = {{uri:'https://picsum.photos/200'}} 
        style = {{width: 200, height:200}}
        />
        </View>

      </View>
      <View>
        <Text>
          {message}
        </Text>
      </View>
      <TouchableWithoutFeedback onPress={handleSignoutPress}>
        <View style={styles.button}>
          <Text style={styles.whitetext}>
            Sign out
          </Text>
        </View>
      </TouchableWithoutFeedback>
      
      </ScrollView>
    </View>
  );
}
