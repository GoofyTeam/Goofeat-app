import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useJoinHouseholdForm } from '@/hooks/useHouseholdActions';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, View } from 'react-native';

export default function JoinHouseholdScreen() {
  const router = useRouter();
  const {
    state,
    submitting,
    canSubmit,
    error,
    setCode,
    setNickname,
    submit,
    clearError,
  } = useJoinHouseholdForm();

  useEffect(() => {
    if (!error) return;
    Alert.alert('Erreur', error, [{ text: 'OK', onPress: clearError }]);
  }, [clearError, error]);

  const handleJoin = async () => {
    try {
      await submit();
      router.replace('/');
    } catch {
      // L'erreur est gérée via l'effet ci-dessus
    }
  };

  return (
    <View className="flex-1 p-6 gap-6">
      <TopNav />
      <Text className="text-3xl font-bold">Rejoindre un foyer</Text>

      <View className="gap-3">
        <Label>Code d&apos;invitation</Label>
        <Input value={state.code} onChangeText={setCode} placeholder="ABC123" autoCapitalize="characters" />
      </View>

      <View className="gap-3">
        <Label>Nom (optionnel)</Label>
        <Input value={state.nickname} onChangeText={setNickname} placeholder="e.g. Papa..." />
      </View>

      <Button disabled={!canSubmit || submitting} onPress={handleJoin}>
        {submitting ? 'Adhésion...' : 'Rejoindre le foyer'}
      </Button>
    </View>
  );
}
