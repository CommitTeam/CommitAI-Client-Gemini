
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AuthStack from './AuthStack';
import FeedStack from './FeedStack';
import { getAccessToken, getUsername } from '@/store/secureStore';
import { setAccessToken, setUsername } from '@/store/authSlice';
import type { RootState, AppDispatch } from '@/store/store';

const RootNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUsername = await getUsername();
        const storedToken = await getAccessToken();

        if (storedToken) {
          dispatch(setAccessToken(storedToken));
        }
        if (storedUsername) {
          dispatch(setUsername(storedUsername));
        }
      } catch (err) {
        console.error('Error loading stored credentials:', err);
      }
    };

    loadUser();
  }, [dispatch]);

  const linking = {
    prefixes: ['commitai://', 'https://icommit.ai'],
    config: {
      screens: {
        Login: 'login',
        SignUp: 'signup',
      },
    },
  };

  return (
    <NavigationContainer linking={linking as any}>
      {accessToken ? <FeedStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
