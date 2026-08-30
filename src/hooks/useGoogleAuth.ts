import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { loginWithGoogle, loginWithGoogleIdToken } from '@/src/services/authService';

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthOptions {
  onError: (error: unknown) => void;
}

export function useGoogleAuth({ onError }: UseGoogleAuthOptions) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (Platform.OS === 'web' || response?.type !== 'success') return;

    const idToken = response.params?.id_token;
    if (!idToken) {
      onError(new Error('Token do Google não recebido.'));
      return;
    }

    loginWithGoogleIdToken(idToken).catch(onError);
  }, [response]);

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
