import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useJoinHouseholdForm } from '@/hooks/useHouseholdActions';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, View } from 'react-native';

export default function HouseholdOnboarding() {
  const router = useRouter();
  const {
    state,
    submitting,
    canSubmit,
    error,
    setCode,
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
      <Text className="text-3xl font-bold">Bienvenue</Text>
      <Text className="text-base text-gray-600">
        Rejoinds un foyer existant ou crée un nouveau foyer pour commencer à utiliser Goofeat.
      </Text>

      <View className="gap-3">
        <Label>Code d&apos;invitation</Label>
        <Input value={state.code} onChangeText={setCode} placeholder="ABC123" autoCapitalize="characters" />
        <Button disabled={!canSubmit || submitting} onPress={handleJoin}>
          {submitting ? 'Adhésion...' : 'Rejoindre le foyer'}
        </Button>
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
