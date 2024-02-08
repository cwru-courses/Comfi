import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ENDPOINT_BASE_URL } from './constants';

/*
 * Validate access token locally stored. If received a response then access
 * token is valid, so return true.
 * If it is invalid then return false
 */
async function checkAuthentication() {
  try {
    // Validates current access token
    const response = await axios.get(
      `http://${ENDPOINT_BASE_URL}:8000/home/`,
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    );
    if (response.status === 200) {
      return true;
    }
  } catch (err) {
    console.log(err);
  }
  return false;
}

/*
 * When access token is invalid, the refresh token locally stored is checked.
 * If the refresh token is valid, then new access and refresh tokens are set
 * and returns true.
 * If the refresh token is invalid, then the user must sign in again and
 * returns false.
 */
async function refreshTokenAuthentication(refreshToken) {
  try {
    const response = await axios.post(
      `http://${ENDPOINT_BASE_URL}:8000/token/refresh/`,
      { refresh: refreshToken },
    );
    if (response.status === 200) {
      SecureStore.setItem('access_token', response.data.access);
      SecureStore.setItem('refresh_token', response.data.refresh);
      axios.defaults.headers.common.Authorization = `Bearer ${response.data.access}`;
      return true;
    }
  } catch (err) {
    console.log(err);
  }
  return false;
}

/*
 * Checks if the access token is valid
 * If not valid, then checks if refresh_token is valid, is so then it updates
 * the access and refresh tokens.
 * If neither are valid, then the user is logged out, and must sign in again
 */
export default async function authenticateUser() {
  const refreshToken = SecureStore.getItem('refresh_token');

  if (await checkAuthentication() || await refreshTokenAuthentication(refreshToken)) {
    return true;
  }
  SecureStore.deleteItemAsync('access_token');
  SecureStore.deleteItemAsync('refresh_token');
  return false;
}
