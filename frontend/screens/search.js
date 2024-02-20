import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList, TouchableWithoutFeedback, Modal,
} from 'react-native';
import axios from 'axios';
import { TMDB_API_KEY, TMDB_BASE_POSTER_URL } from '../config/constants';

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    backgroundColor: '#000',
  },
  header: {
    color: '#d81159',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginVertical: 10,
    paddingLeft: 12,
  },
  grid: {
    margin: 4,
  },
  card: {
    flex: 1,
    flexDirection: 'column',
    margin: 4,
    borderWidth: 1,
    borderRadius: 8,
    aspectRatio: 2 / 3,
  },
  image: {
    flex: 1,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 10,
    margin: 5,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F3E5B',
    padding: 22,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
    height: '93%',
  },
  modalImage: {
    flex: 0,
    height: '40%',
    aspectRatio: 2 / 3,
    borderRadius: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    padding: 4,
  },
  description: {
    fontSize: 14,
    padding: 4,
    color: '#fff8f0',
  },
});

export default function SearchScreen() {
  const [userInterests, setUserInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      axios.get(
        'https://api.themoviedb.org/3/trending/movie/week?language=en-US',
        { headers: { Accept: 'application/json', Authorization: `Bearer ${TMDB_API_KEY}` } },
      ).then((response) => {
        setUserInterests(response.data.results);
      }).catch((err) => console.log(err)).finally(() => {
        setIsLoading(false);
      });
    }
  }, []);

  const handleCardPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableWithoutFeedback onPress={() => handleCardPress(item)}>
      <View style={styles.card}>
        <Image
          source={{ uri: TMDB_BASE_POSTER_URL.concat(item.poster_path) }}
          style={styles.image}
        />
      </View>
    </TouchableWithoutFeedback>
  );

  if (isLoading) {
    return <View style={styles.page}><Text style={styles.text}>Loading</Text></View>;
  }

  return (
    <View style={styles.page}>
      <Text style={styles.header}>Trending</Text>
      <FlatList
        data={userInterests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
      />
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={{ uri: TMDB_BASE_POSTER_URL.concat(selectedItem.poster_path) }}
              style={styles.modalImage}
            />
            <Text style={styles.title}>{selectedItem.title}</Text>
            <Text style={styles.description}>{selectedItem.overview}</Text>
            <TouchableWithoutFeedback
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.header}>Close</Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </Modal>
    </View>
  );
}
