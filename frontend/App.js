import { Button, View } from 'react-native';
import {Gallery} from './Gallery'

export default function App()
{
  return 
  {
    <View style={{flex: 1, backgroundColor: "white", padding: 60 }}>
      <Button title="Previous" onPress={() => console.log("Previous movie")}/>
      <Button title="Like" onPress={() => console.log("Movie liked")}/>
      <Button title="Next" onPress={() => console.log("Next movie")}/>
      <Text>
        <Text style={{color: "gray"}}>Movie Name</Text>Hello World
      </Text>
      <div>
        {
          Gallery(Image)
        }
      </div>
      <Image>
        source={{uri: "https://www.imdb.com/title/tt1853728/mediaviewer/rm958180352/"}}
        style={{width:300, height:300}}
      </Image>
    </View>
  };
}


