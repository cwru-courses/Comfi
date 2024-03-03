import {View, Dimensions, Image} from 'react-native';
import Swiper from 'react-native-swiper';

const Gallery = ({ images, video }) => {
    return (
    <Swiper style={styles.wrapper} showsButtons={true}>
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
        }
      };
    export default Gallery;
