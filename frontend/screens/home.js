import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableWithoutFeedback, ScrollView, Image, StatusBar
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
    borderRadius:10,
    margin:5,
    padding: 10
  },
 smallcontainer: {
    flex: 1,
    backgroundColor: 'lightgrey',
    alignItems: 'right',
    justifyContent: 'right',
    textAlign: 'left',
    borderRadius:10,
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
  titletext: {
    color: 'black',
    fontSize: 32,
    padding: 2,
    fontWeight:'bold',
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
  profiletext:{
    color: 'black',
    fontSize: 20,
    padding:2,
    margin: 2,
    textAlign: 'left',
    justifyContent: 'flex-end',
    // flexDirection: 'row',
    fontWeight:'bold',
    flexWrap:'wrap'
  },
  page: {
    flex:1,
    backgroundColor: 'white',
    alignItems:'center',
    paddingTop: 55,
    padding: 5

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
      <StatusBar/>
      <ScrollView>
        {/* Movie of the Day */}
      <View style={styles.container}>
      <Text style={styles.titletext}>Movie Of The Day</Text>
        <Text style = {styles.text}>
            Here is a description of the movie. Descriptions can be rather long so it may wrap to the next line like so.
            here is some more text to see if the box will incrse in size or not
        </Text>
        <View style = {{alignItems:'center',justifyContent:'center',padding: 5}}>
        <Image 
        source = {{uri:'https://picsum.photos/300'}} 
        style = {{width: 300, height:300}}
        />
        </View>

      </View>
      {/* <View>
        <Text>
          {message}
        </Text>
      </View> */}

      <Text style = {styles.titletext}>Recent Groups</Text>
      {/* End Movie of the day */}
      {/* Profile */}
      <View style = {styles.smallcontainer}>
        
        <Image 
        source = {{uri:'https://picsum.photos/50'}} 
        style = {{width: 50, height:50, borderRadius: 100, padding:5}}/>  
        <Text style = {styles.profiletext}>Sample Name </Text>
      </View>
      {/* end profile */}
      {/* Profile */}
      <View style = {styles.smallcontainer}>
        
        <Image 
        source = {{uri:'https://picsum.photos/50'}} 
        style = {{width: 50, height:50, borderRadius: 100, padding:5}}/>  
        <Text style = {styles.profiletext}>Sample Name </Text>
      </View>
      {/* end profile */}
      {/* Profile */}
      <View style = {styles.smallcontainer}>
        
        <Image 
        source = {{uri:'https://picsum.photos/50'}} 
        style = {{width: 50, height:50, borderRadius: 100, padding:5}}/>  
        <Text style = {styles.profiletext}>Sample Name </Text>
      </View>
      {/* end profile */}
      {/* Profile */}
      <View style = {styles.smallcontainer}>
        
        <Image 
        source = {{uri:'https://picsum.photos/50'}} 
        style = {{width: 50, height:50, borderRadius: 100, padding:5}}/>  
        <Text style = {styles.profiletext}>Sample Name </Text>
      </View>
      {/* end profile */}
      {/* Profile */}
      <View style = {styles.smallcontainer}>
        
        <Image 
        source = {{uri:'https://picsum.photos/50'}} 
        style = {{width: 50, height:50, borderRadius: 100, padding:5}}/>  
        <Text style = {styles.profiletext}>Sample Name </Text>
      </View>
      {/* end profile */}
      {/*Sign out button*/}
      <TouchableWithoutFeedback onPress={handleSignoutPress}>
        <View style={styles.button}>
          <Text style={styles.whitetext}>
            Sign out
          </Text>
        </View>
      </TouchableWithoutFeedback>
      {/* End Sign out button */}
      
      </ScrollView>
    </View>
  );
}
