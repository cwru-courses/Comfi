import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';
import authenticateUser from './config/authConfig';
import Play from './screens/play';

const Tab = createBottomTabNavigator();

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
      <Tab.Navigator>
        {!userToken ? (
          <Tab.Screen
            name="Login"
            component={LoginScreen}
            initialParams={{ setUserToken }}
          />
        ) : (
          <>
            <Tab.Screen name="Home" component={HomeScreen} initialParams={{ setUserToken }} />
            <Tab.Screen name="Play" component={Play} initialParams={{ setUserToken }} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
