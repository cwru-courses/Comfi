import React from 'react';
import {
  View, Text, StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import { useAuth } from '../config/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 5,
    width: '0.9rem',
    height: '0.9rem',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    margin: 10,
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#000',
    fontSize: 16,
  },
});

export default function UserScreen() {
  const { setIsSignout, signOut } = useAuth();

  const handleSignoutPress = async () => {
    setIsSignout(true);
    signOut();
  };

  return (
    <View style={styles.container}>
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
