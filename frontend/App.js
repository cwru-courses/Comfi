import { TouchableOpacity, View, Text, Image, StyleSheet} from 'react-native';
import Gallery from './Gallery';

export default function App()
{
  const images = [
    './comphy/assets/DjangoUnchained.jpg',
    'https://picsum.photos/20/20',
  ];
 
  return (
    <View style={styles.container}>
      <Gallery images={images}/>
      <Text style={styles.text}>Django Unchained</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log("Previous pressed")}>
            <Image style={styles.image} source={require('./comphy/assets/previous.png')}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}
          onPress={() => console.log("Like pressed")}>
          <Image style={styles.image} source={require('./comphy/assets/Play.png')}/>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => console.log("Next pressed")}>
          <Image style={styles.image} source={require('./comphy/assets/next.png')}/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 200,
    paddingHorizontal: 20,
    width: 100,
    height: 100,
    borderRadius: 50
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    elevation: 20,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 200
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'gray',
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  }
});

