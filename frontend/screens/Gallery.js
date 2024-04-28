import React, {
  Image, View, StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import Swipeable from 'react-native-swipe-gestures';

const styles = StyleSheet.create({
  wrapper: {},
  slider: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 30,
    width: '100%',
    height: 125,
    borderRadius: 50,
    paddingHorizontal: 75,
  },
  imagebutton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 100,
    borderRadius: 50,
    backgroundColor: 'silver',
  },
  image: {
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
    <>
      <Swipeable
        onSwipeLeft={() => onSwipeLeft(movieDetails?.imdb_id)}
        onSwipeRight={() => onSwipeRight(movieDetails?.imdb_id)}
        style={styles.slider}
      >
        <Image style={styles.image} source={{ uri: movieDetails?.poster_link }} />
      </Swipeable>
      <View style={styles.buttonContainer}>
        <TouchableWithoutFeedback onPress={() => onSwipeLeft(movieDetails?.imdb_id)}>
          <Image style={styles.imagebutton} source={require('../assets/play_button.png')} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => onSwipeRight(movieDetails?.imdb_id)}>
          <Image style={styles.imagebutton} source={require('../assets/next.png')} />
        </TouchableWithoutFeedback>
      </View>
    </>
  );
}

export default Gallery;
