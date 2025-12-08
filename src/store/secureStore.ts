import * as SecureStore from 'expo-secure-store'

export const authAccessToken = 'authAccessToken';
export const authRefreshToken = 'authRefreshToken';
export const userName = 'username';

export async function saveAccessToken(token: string) {
  await SecureStore.setItemAsync(authAccessToken, token);
}

export async function getAccessToken() {
  return await SecureStore.getItemAsync(authAccessToken);
}

export async function deleteAccessToken() {
  return await SecureStore.deleteItemAsync(authAccessToken);
}


export async function saveRefreshToken(token: string) {
  await SecureStore.setItemAsync(authRefreshToken, token);
}

export async function deleteRefreshToken() {
  return await SecureStore.deleteItemAsync(authRefreshToken);
}

export async function getRefreshToken() {
  return await SecureStore.getItemAsync(authRefreshToken);
}


export async function saveUsername(value:string) {
    await SecureStore.setItemAsync(userName, value);
}

export async function getUsername() {
    return await SecureStore.getItemAsync(userName);
}

export async function deleteUsername() {
    return await SecureStore.deleteItemAsync(userName);
}
