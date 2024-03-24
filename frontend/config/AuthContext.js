import React, {
  createContext, useContext, useState, useEffect,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import authenticateUser from './authConfig';
import { ENDPOINT_BASE_URL } from './constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const username = SecureStore.getItem('username');
  const [userData, setUserData] = useState(null);
  const [userToken, setUserToken] = useState(false);
  const [error, setError] = useState('');
  const [isSignout, setIsSignout] = useState(false);

  const getUserToken = async () => {
    try {
      const isAuthenticated = await authenticateUser();
      setUserToken(isAuthenticated);
    } catch (err) {
      console.log(err);
      setUserToken(false);
    }
  };

  useEffect(() => {
    if (!isSignout) {
      getUserToken();
    }
  }, []);

  const signIn = (user) => {
    setError('');
    axios.post(
      `http://${ENDPOINT_BASE_URL}:8000/token/`,
      user,
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    ).then((res) => {
      SecureStore.setItem('access_token', res.data.access);
      SecureStore.setItem('refresh_token', res.data.refresh);
      SecureStore.setItem('username', user.username);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
      setUserToken(true);
    }).catch((err) => {
      console.log(err);
      setError('Invalid Login');
    });
    axios.get(`http://${ENDPOINT_BASE_URL}:8000/api/users/?username=${username}`)
      .then((res) => {
        const data = res.data[0];
        if (res.status === 200) {
          setUserData({
            first_name: data.first_name,
            last_name: data.last_name,
          });
        }
      }).catch((err) => console.log(err));
  };

  const signOut = () => {
    axios.post(
      `http://${ENDPOINT_BASE_URL}:8000/logout/`,
      { refresh_token: SecureStore.getItem('refresh_token') },
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    ).then(() => {
      SecureStore.deleteItemAsync('access_token');
      SecureStore.deleteItemAsync('refresh_token');
      SecureStore.deleteItemAsync('username');
      axios.defaults.headers.common.Authorization = undefined;
      setUserToken(false);
    }).catch((err) => {
      console.log(err);
    });
  };

  const createAccount = (user) => {
    setError('');
    axios.post(
      `http://${ENDPOINT_BASE_URL}:8000/register/`,
      user,
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    ).then((res) => {
      SecureStore.setItem('access_token', res.data.access);
      SecureStore.setItem('refresh_token', res.data.refresh);
      SecureStore.setItem('username', user.username);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
      setUserToken(true);
    }).catch((err) => {
      console.log(err);
      setError('Username Exists');
    });
  };

  const getFirstName = () => (userData.first_name);

  const getLastName = () => (userData.last_name);

  return (
    <AuthContext.Provider value={{
      signIn,
      signOut,
      createAccount,
      setUserToken,
      userToken,
      setError,
      error,
      setIsSignout,
      username,
      getFirstName,
      getLastName,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
