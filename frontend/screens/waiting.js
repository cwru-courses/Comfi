import React from 'react';
import {
  TouchableWithoutFeedback, StyleSheet, Text, View, Image,
} from 'react-native';

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 32,
    width: '90%',
    color: '#d81159',
    textAlign: 'center',
    right: 10,
  },
  buttonContainer: {
    bottom: -25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 200,
    height: 75,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 48,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    textAlign: 'center',
  },
  container: {
    width: '100%',
    height: '80%',
    alignItems: 'center',
    marginTop: 15,
  },
  usersContainer: {
    width: '85%',
    backgroundColor: 'dimgrey',
    paddingHorizontal: 25,
    paddingVertical: 20,
    marginVertical: 5,
    borderRadius: 10,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userText: {
    fontSize: 20,
    color: 'white',
  },
  statusIcon: {
    aspectRatio: 1,
    width: 25,
  },
});

export default function Waiting({
  users, handleStatusChange, userReadyStatus, exitRoom,
}) {
  return (
    <View style={styles.page}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableWithoutFeedback onPress={exitRoom()}>
          <Image style={{ aspectRatio: 1, width: 25 }} source={require('../assets/arrow.png')} />
        </TouchableWithoutFeedback>
        <Text style={styles.headerText}>Waiting Room</Text>
      </View>
      {/* A list of users in the room */}
      <View style={styles.container}>
        {
          Object.keys(users).map((user) => (
            <View style={styles.usersContainer} key={user}>
              <View style={styles.userDetails}>
                <Text style={styles.userText}>{user}</Text>
                {users[user]
                  ? (<Image style={styles.statusIcon} source={require('../assets/check.png')} />)
                  : (<Image style={styles.statusIcon} source={require('../assets/remove.png')} />) }
              </View>
            </View>
          ))
        }
      </View>
      <View style={styles.buttonContainer}>
        <TouchableWithoutFeedback onPress={handleStatusChange}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>
              {userReadyStatus ? 'Ready' : 'Not Ready'}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}
