import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        let accessToken: string | undefined;
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const hash = url.hash?.startsWith('#') ? url.hash.substring(1) : url.hash;
          const hp = new URLSearchParams(hash || '');
          accessToken = hp.get('access_token') || url.searchParams.get('access_token') || undefined;
          if (accessToken) {
            await setAccessToken(accessToken);
          }
          // Clean URL
          if (window.location.hash) window.location.hash = '';
        }
      } catch {}
      router.replace('/');
    })();
  }, [router, setAccessToken]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Signing you in…</Text>
    </View>
  );
}

