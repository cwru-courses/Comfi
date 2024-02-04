import React, { useState } from 'react';
import {
  View, Text, TouchableWithoutFeedback, StyleSheet, TextInput,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    paddingBottom: 15,
  },
  button: {
    backgroundColor: 'black',
    borderRadius: 12,
    padding: 10,
    margin: 10,
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    height: 40,
    width: 300,
    margin: 10,
    borderWidth: 1.5,
    padding: 10,
  },
  switchLoginButton: {
    backgroundColor: 'orange',
    borderRadius: 12,
    padding: 10,
    margin: 10,
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsuccessful: {
    height: 40,
    marginTop: 15,
    backgroundColor: 'red',
  },
  unsuccessfulText: {
    color: 'white',
  },
});

const TEMP_IP = 'CHANGE_TO_YOUR_IP_ADDR';

export default function LoginScreen({ route }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // eslint-disable-next-line camelcase
  const [first_name, setFirstName] = useState('');
  // eslint-disable-next-line camelcase
  const [last_name, setLastName] = useState('');
  const [unsuccessfulLogin, setUnsuccessfulLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { setUserToken } = route.params;

  /* TODO
  * Limit the number of attempts a user has
  * Limit when the user can press login
  * i.e. not black username or password, greter than 8 chars, etc.
  */
  const handleLoginPress = (e) => {
    e.preventDefault();

    const user = {
      username,
      password,
    };

    axios.post(
      `http://${TEMP_IP}:8000/token/`,
      user,
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    ).then((res) => {
      SecureStore.setItem('access_token', res.data.access);
      SecureStore.setItem('refresh_token', res.data.refresh);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
      setUserToken(res.data.access);
    }).catch((err) => {
      // do something with the error thrown
      console.log(err);
      setUnsuccessfulLogin(true);
    });
  };

  const handleCreatePress = (e) => {
    e.preventDefault();
    const user = {
      username,
      password,
      // eslint-disable-next-line camelcase
      first_name,
      // eslint-disable-next-line camelcase
      last_name,
    };
    axios.post(
      `http://${TEMP_IP}:8000/register/`,
      user,
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    ).then((res) => {
      SecureStore.setItem('access_token', res.data.access);
      SecureStore.setItem('refresh_token', res.data.refresh);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
      setUserToken(res.data.access);
    }).catch((err) => {
      // do something with the error thrown
      console.log(err);
      setUnsuccessfulLogin(true);
    });
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>
          Comfi
        </Text>
      </View>
      {!isSignUp ? (
        <View style={{ alignItems: 'center' }}>
          <TextInput placeholder="Username" style={styles.input} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
          <TextInput placeholder="Password" style={styles.input} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} />
          <TouchableWithoutFeedback onPress={handleLoginPress}>
            <View style={styles.button}>
              <Text style={styles.text}>
                Login
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      ) : (
        <View style={{ alignItems: 'center' }}>
          {
            // Add more fields if needed such as an email or number, first name, last name, etc.
          }
          <TextInput placeholder="Username" style={styles.input} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
          <TextInput placeholder="Password" style={styles.input} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} />
          <TextInput placeholder="First Name" style={styles.input} onChangeText={setFirstName} autoCapitalize="none" autoCorrect={false} />
          <TextInput placeholder="Last Name" style={styles.input} onChangeText={setLastName} autoCapitalize="none" autoCorrect={false} />
          <TouchableWithoutFeedback onPress={handleCreatePress}>
            <View style={styles.button}>
              <Text style={styles.text}>
                Create
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
      <TouchableWithoutFeedback onPress={() => setIsSignUp(!isSignUp)}>
        <View style={styles.switchLoginButton}>
          {
            // Style changes need to be made.
          }
          <Text style={styles.text}>
            {!isSignUp ? 'New Account' : 'Sign in'}
          </Text>
        </View>
      </TouchableWithoutFeedback>
      {unsuccessfulLogin && (
      <View style={styles.unsuccessful}>
        <Text style={styles.unsuccessfulText}>
          Try Again
        </Text>
      </View>
      )}
    </View>
  );
}
