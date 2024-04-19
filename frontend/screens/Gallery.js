import React, { Image, StyleSheet } from 'react-native';
import Swipeable from 'react-native-swipe-gestures';

const styles = StyleSheet.create({
  wrapper: {},
  slider: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    padding: 10,
    justifyContent: 'center',
    height: 500,
    aspectRatio: 2 / 3,
  },
});

function Gallery({ movieDetails, handleUserChoice, onNext }) {
  const onSwipeLeft = (movieID) => {
    handleUserChoice(true, movieID);
    onNext();
  };

  const onSwipeRight = (movieID) => {
    handleUserChoice(false, movieID);
    onNext();
  };

  return (
    <Swipeable
      onSwipeLeft={() => onSwipeLeft(movieDetails?.imdb_id)}
      onSwipeRight={() => onSwipeRight(movieDetails?.imdb_id)}
      style={styles.slider}
    >
      <Image style={styles.image} source={{ uri: movieDetails?.poster_link }} />
    </Swipeable>
  );
}

export default Gallery;
