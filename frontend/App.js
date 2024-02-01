import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import axios from 'axios';

export default function App() {
  const [users, setUsers] = useState([])
  // Must be changed to IP address of host
  const tempIPAddr = '0.0.0.0'

  useEffect(() => {
    axios.get(`http://${tempIPAddr}:8000/api/users`)
    .then((res) => {setUsers(res.data)})
    .catch((err) => console.log(err));
  }, [])

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app! </Text>
      <View>
        {console.log(users)}
        {users.map((user, index) => (
          <View key={index}>
            <Text>{user.username}</Text>
          </View>
        ))}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
