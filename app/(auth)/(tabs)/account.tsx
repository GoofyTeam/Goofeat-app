import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function AccountScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleDisconnect = () => {
    logout();
    // Safety: navigate to login; TabLayout also redirects when token is cleared
    try { router.replace('/login'); } catch {}
  };

  return (
    <View style={{ flex: 1, padding: 24, rowGap: 24, justifyContent: 'space-between'}}>
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Account</Text>
      {user?.email ? (
        <Text style={{ fontSize: 16 }}>Signed in as {user.email}</Text>
      ) : null}
      <Button variant='outline' onPress={handleDisconnect}>Disconnect</Button>
    </View>
  );
}
 
