import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
} from 'react-native';
import axios from 'axios';
import { ENDPOINT_BASE_URL } from '../config/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'navy',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    width: '0.9rem',
    height: '0.9rem',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    padding: 2,
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  page: {
    flex: 1,
    backgroundColor: 'midnightblue',
    padding: 60,

  },
});

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Could log errors when calling backend, except for login or logout.
  useEffect(() => {
    if (!isAuthenticated) {
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

  return (
    <View style={styles.page}>
      <ScrollView>
        <View style={styles.container}>
          <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Movie Of The Day</Text>
          <Text style={styles.text}>
            Here is a description of the movie. Descriptions can be rather long so
            it may wrap to the next line like so.
          </Text>
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 5 }}>
            <Image
              source={{ uri: 'https://picsum.photos/200' }}
              style={{ width: 200, height: 200 }}
            />
          </View>

        </View>
        <View>
          <Text>
            {message}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}
