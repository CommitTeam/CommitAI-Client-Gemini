import * as SecureStore from 'expo-secure-store'

export const authAccessToken = 'authAccessToken';

export async function saveAuthAccessToken(token: string) {
  await SecureStore.setItemAsync(authAccessToken, token);
}

export async function getAuthAccessToken() {
  return await SecureStore.getItemAsync(authAccessToken);
}

export async function deleteAuthAccessToken() {
  return await SecureStore.deleteItemAsync(authAccessToken);
}
