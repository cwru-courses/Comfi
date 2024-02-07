import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';
import authenticateUser from './config/authConfig';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(false);

  const getUserToken = async () => {
    try {
      const isAuthenticated = await authenticateUser();
      setUserToken(isAuthenticated);
    } catch (err) {
      console.log(err);
      setUserToken(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUserToken();
  }, []);

  // Add this to the return function, sets a loading screen when something is happening
  // that is taking longer.
  if (isLoading) {
    return <View><Text>The Screen is loading</Text></View>;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!userToken ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            initialParams={{ setUserToken }}
          />
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} initialParams={{ setUserToken }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
