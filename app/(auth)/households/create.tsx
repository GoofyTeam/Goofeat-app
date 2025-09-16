import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useHousehold } from '@/context/HouseholdContext';
import { createHousehold, HouseholdType } from '@/services/household';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

const TYPES: { label: string; value: HouseholdType }[] = [
  { label: 'Family', value: 'family' },
  { label: 'Couple', value: 'couple' },
  { label: 'Colocation', value: 'colocation' },
  { label: 'Single', value: 'single' },
];

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const { refreshHouseholds, setCurrentHousehold } = useHousehold();
  const [name, setName] = useState('');
  const [type, setType] = useState<HouseholdType>('single');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      const h = await createHousehold({ name: name.trim(), type, description: description.trim() || undefined });
      await refreshHouseholds();
      await setCurrentHousehold(h.id);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Création échoué', e?.message || 'Il y a eu un problème lors de la création du foyer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 gap-6">
      <TopNav />
      <Text className="text-3xl font-bold">Créer un foyer</Text>

      <View className="gap-3">
        <Label>Nom *</Label>
        <Input value={name} onChangeText={setName} placeholder="My home" />
      </View>

      <View className="gap-3">
        <Label>Type</Label>
        <View className="flex-row flex-wrap gap-2">
          {TYPES.map((t) => (
            <Button
              key={t.value}
              variant={type === t.value ? 'default' : 'outline'}
              onPress={() => setType(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Label>Description</Label>
        <Input value={description} onChangeText={setDescription} placeholder="Optional" />
      </View>

      <Button disabled={!canSubmit || loading} onPress={handleCreate}>
        {loading ? 'Création...' : 'Créer le foyer'}
      </Button>
    </View>
  );
}
