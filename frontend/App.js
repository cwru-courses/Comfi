import { TouchableOpacity, View, Text, Image, StyleSheet} from 'react-native';
import Gallery from './Gallery';

export default function App()
{
  const images = [
    'https://picsum.photos/200'
  ];
  return (
    <View style={styles.container}>
      <Gallery images={images}/>
      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Previous pressed")}>
        <Text style={styles.buttonText}>Previous</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Like pressed")}>
        <Text style={styles.buttonText}>Like</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => console.log("Next pressed")}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <Text style={styles.text}>Django Unchained</Text>
      <Image
        source={{uri: "https://www.imdb.com/title/tt1853728/mediaviewer/rm958180352/"}}
        style={{width:300, height:300}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});

