import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { loginWithGoogle, loginWithGoogleIdToken } from '@/src/services/authService';

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthOptions {
  onError: (error: unknown) => void;
}

function useConfiguredGoogleAuth({ onError }: UseGoogleAuthOptions) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (Platform.OS === 'web' || response?.type !== 'success') return;

    const idToken = response.params?.id_token;
    if (!idToken) {
      onError(new Error('Token do Google não recebido.'));
      return;
    }

    loginWithGoogleIdToken(idToken).catch(onError);
  }, [response, onError]);

  const signIn = async () => {
    try {
      if (Platform.OS === 'web') {
        await loginWithGoogle();
        return;
      }

      await promptAsync();
    } catch (error) {
      onError(error);
    }
  };

  return {
    signIn,
    ready: Platform.OS === 'web' || !!request,
  };
}

// A configuração é fixa durante a execução; não inicializa OAuth sem credenciais.
const nativeClientId = Platform.select({
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

function useUnavailableGoogleAuth({ onError }: UseGoogleAuthOptions) {
  return {
    ready: false,
    signIn: async () => {
      onError(new Error('Login com Google requer uma development build e o Client ID da plataforma.'));
    },
  };
}

function useWebGoogleAuth({ onError }: UseGoogleAuthOptions) {
  return {
    ready: true,
    signIn: async () => {
      try {
        await loginWithGoogle();
      } catch (error) {
        onError(error);
      }
    },
  };
}

export const useGoogleAuth = Platform.OS === 'web'
  ? useWebGoogleAuth
  : Constants.appOwnership !== 'expo' && nativeClientId
    ? useConfiguredGoogleAuth
    : useUnavailableGoogleAuth;
