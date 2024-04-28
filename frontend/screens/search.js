import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#d81159',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginVertical: 10,
    paddingLeft: 12,
  },
  headerResults: {
    width: '90%',
    fontSize: 20,
    textAlign: 'center',
    color: '#d81159',
    marginVertical: 10,
    right: 15,
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
  input: {
    height: 40,
    width: 200,
    borderWidth: 1.5,
    backgroundColor: '#59656F',
    borderRadius: 10,
    color: 'white',
  },
  iconImage: {
    marginLeft: 10,
    aspectRatio: 1,
    width: 25,
  },
});

export default function SearchScreen() {
  const [userInterests, setUserInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [moviesSearched, setMoviesSearched] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      axios
        .get(
          'https://api.themoviedb.org/3/trending/movie/week?language=en-US',
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${TMDB_API_KEY}`,
            },
          },
        )
        .then((response) => {
          setUserInterests(response.data.results);
        })
        .catch((err) => console.log(err))
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const handleMovieSearch = () => {
    axios.get('https://api.themoviedb.org/3/search/movie', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
      params: {
        query: searchTitle,
        include_adult: 'false',
        language: 'en-US',
        page: '1',
      },
    }).then((res) => {
      console.log(res.status);
      setMoviesSearched(res.data.results);
    }).catch((err) => console.log(err));
  };

  const handleCardPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const backToTrending = () => {
    setMoviesSearched([]);
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
    return (
      <View style={styles.page}>
        <Text style={styles.text}>Loading</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {(moviesSearched.length === 0) ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>Trending</Text>
            <View style={{flexDirection: 'row', alignItems: 'center' }}>
              <TextInput placeholder="Search" placeholderTextColor={'silver'} style={styles.input} onChangeText={setSearchTitle} autoCapitalize="none" autoCorrect={false} />
              <TouchableWithoutFeedback onPress={handleMovieSearch}>
                <Image style={styles.iconImage} source={require('../assets/search_icon.png')} />
              </TouchableWithoutFeedback>
            </View>
          </View>
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
                  source={{
                    uri: TMDB_BASE_POSTER_URL.concat(selectedItem.poster_path),
                  }}
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
        </>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableWithoutFeedback onPress={backToTrending}>
              <Image style={styles.iconImage} source={require('../assets/arrow.png')} />
            </TouchableWithoutFeedback>
            <Text style={styles.headerResults}>Results</Text>
          </View>
          <FlatList
            data={moviesSearched}
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
                  source={{
                    uri: TMDB_BASE_POSTER_URL.concat(selectedItem.poster_path),
                  }}
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
        </>
      )}
    </View>
  );
}
