import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useHousehold } from '@/context/HouseholdContext';
import { joinHousehold } from '@/services/household';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function HouseholdOnboarding() {
  const router = useRouter();
  const { refreshHouseholds } = useHousehold();
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    try {
      setJoining(true);
      await joinHousehold({ inviteCode: inviteCode.trim() });
      await refreshHouseholds();
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Errur', e?.message || 'Impossible de rejoindre le foyer');
    } finally {
      setJoining(false);
    }
  };

  return (
    <View className="flex-1 p-6 gap-6">
      <TopNav />
      <Text className="text-3xl font-bold">Bienvenue</Text>
      <Text className="text-base text-gray-600">
        Rejoinds un foyer existant ou crée un nouveau foyer pour commencer à utiliser Goofeat.
      </Text>

      <View className="gap-3">
        <Label>Code d&apos;invation</Label>
        <Input value={inviteCode} onChangeText={setInviteCode} placeholder="ABC123" autoCapitalize="characters" />
        <Button disabled={!inviteCode || joining} onPress={handleJoin}>Rejoindre le foyer</Button>
      </View>

      <View className="items-center">
        <Text className="text-gray-500">ou</Text>
      </View>

      <Button variant="outline" onPress={() => router.push('/households/create')}>
        Créer un foyer
      </Button>
    </View>
  );
}
