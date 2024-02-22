import {View, Dimensions, Image} from 'react-native';
import Swiper from 'react-native-swiper';

const Gallery = ({ images }) => {
    return (
    <Swiper style={styles.wrapper} showsButtons={false}>
        {images.map((image, index) => (
            <View style={styles.slide} key={index}>
                <Image style={styles.image} source={{ uri:image }} />
            </View>
        ))}
    </Swiper>
    );
    };

    const styles = {
        wrapper: {},
        slide: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        },
        image: {
          width,
          flex: 1,
        },
      };
    export default Gallery;
