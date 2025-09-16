import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useHousehold } from '@/context/HouseholdContext';
import { joinHousehold } from '@/services/household';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

export default function JoinHouseholdScreen() {
  const router = useRouter();
  const { refreshHouseholds } = useHousehold();
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => code.trim().length > 0, [code]);

  const handleJoin = async () => {
    try {
      setLoading(true);
      await joinHousehold({ inviteCode: code.trim(), nickname: nickname.trim() || undefined });
      await refreshHouseholds();
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de rejoindre le foyer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 gap-6">
      <TopNav />
      <Text className="text-3xl font-bold">Rejoindre un foyer</Text>

      <View className="gap-3">
        <Label>Code d&apos;invitation</Label>
        <Input value={code} onChangeText={setCode} placeholder="ABC123" autoCapitalize="characters" />
      </View>

      <View className="gap-3">
        <Label>Nom (optionnel)</Label>
        <Input value={nickname} onChangeText={setNickname} placeholder="e.g. Papa..." />
      </View>

      <Button disabled={!canSubmit || loading} onPress={handleJoin}>
        {loading ? 'Adhésion...' : 'Rejoindre le foyer'}
      </Button>
    </View>
  );
}
