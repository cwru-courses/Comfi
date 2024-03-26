import React, { View, Image, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
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

function Gallery({ images, video }) {
  return (
    <Swiper style={styles.wrapper} showsButtons>
      {images.map((image, index) => (
        <View style={styles.slide} key={index}>
          <Image style={styles.image} source={{ uri: image }} />
        </View>
      ))}
    </Swiper>
  );
}

export default Gallery;
