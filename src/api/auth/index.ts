import axios from 'axios';
import { API_URL } from '@/utils/apiConfig';

export const loginUser = async (email: string, password: string) => {
  try {
    const {data} = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });

    console.log('Login response:', data);
    return data;

  } catch (error) {
    console.log('Login error:', error);
    throw error;
  }
};

export const signUpUser = async (email: string, userName: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/signup`, {
      email,
      username: userName,
      password,
    });

    console.log('Sign Up Response:', response.data);
    return response.data;

  } catch (error) {
    console.log('Sign Up Error:', error);
    throw error;
  }
};

