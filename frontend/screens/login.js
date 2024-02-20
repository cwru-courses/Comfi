import React, { useState } from 'react';
import {
  View, Text, TouchableWithoutFeedback, StyleSheet, TextInput,
} from 'react-native';
import { useAuth } from '../config/AuthContext';

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

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // eslint-disable-next-line camelcase
  const [first_name, setFirstName] = useState('');
  // eslint-disable-next-line camelcase
  const [last_name, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const {
    signIn, createAccount, error, setIsSignout,
  } = useAuth();

  /* TODO
  * Limit the number of attempts a user has
  * Limit when the user can press login
  * i.e. not black username or password, greter than 8 chars, etc.
  */
  const handleLoginPress = (e) => {
    setIsSignout(false);
    e.preventDefault();

    const user = {
      username,
      password,
    };

    signIn(user);
  };

  const handleCreatePress = (e) => {
    setIsSignout(false);
    e.preventDefault();
    const user = {
      username,
      password,
      // eslint-disable-next-line camelcase
      first_name,
      // eslint-disable-next-line camelcase
      last_name,
    };

    createAccount(user);
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
      {error && (
      <View style={styles.unsuccessful}>
        <Text style={styles.unsuccessfulText}>
          {error}
        </Text>
      </View>
      )}
    </View>
  );
}
