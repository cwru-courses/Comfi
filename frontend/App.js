import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './config/AuthContext';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';
import PlayScreen from './screens/play';
import UserScreen from './screens/user';
import SearchScreen from './screens/search';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

function Root() {
  const { userToken } = useAuth();
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#d81159' }}>
        {!userToken ? (
          <Tab.Screen
            name="Login"
            component={LoginScreen}
          />
        ) : (
          <>
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Image
                    source={require('./assets/home.png')}
                    style={{ width: size, height: size, tintColor: color }}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Play"
              component={PlayScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Image
                    source={require('./assets/play.png')}
                    style={{ width: size, height: size, tintColor: color }}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Search"
              component={SearchScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Image
                    source={require('./assets/search.png')}
                    style={{ width: size, height: size, tintColor: color }}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="User"
              component={UserScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Image
                    source={require('./assets/user.png')}
                    style={{ width: size, height: size, tintColor: color }}
                  />
                ),
              }}
            />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
