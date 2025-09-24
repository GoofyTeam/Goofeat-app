import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { HOUSEHOLD_TYPE_OPTIONS, useCreateHouseholdForm } from '@/hooks/useHouseholdActions';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, View } from 'react-native';

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const {
    state,
    submitting,
    canSubmit,
    error,
    setName,
    setType,
    setDescription,
    submit,
    clearError,
  } = useCreateHouseholdForm();

  useEffect(() => {
    if (!error) return;
    Alert.alert('Création échouée', error, [{ text: 'OK', onPress: clearError }]);
  }, [clearError, error]);

  const handleCreate = async () => {
    try {
      const created = await submit();
      if (created) {
        router.replace('/');
      }
    } catch {
      // L'erreur est gérée via le state et l'effet ci-dessus
    }
  };

  return (
    <View className="flex-1 p-6 gap-6">
      <TopNav />
      <Text className="text-3xl font-bold">Créer un foyer</Text>

      <View className="gap-3">
        <Label>Nom *</Label>
        <Input value={state.name} onChangeText={setName} placeholder="My home" />
      </View>

      <View className="gap-3">
        <Label>Type</Label>
        <View className="flex-row flex-wrap gap-2">
          {HOUSEHOLD_TYPE_OPTIONS.map((t) => (
            <Button
              key={t.value}
              variant={state.type === t.value ? 'default' : 'outline'}
              onPress={() => setType(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Label>Description</Label>
        <Input value={state.description} onChangeText={setDescription} placeholder="Optional" />
      </View>

      <Button disabled={!canSubmit || submitting} onPress={handleCreate}>
        {submitting ? 'Création...' : 'Créer le foyer'}
      </Button>
    </View>
  );
}
