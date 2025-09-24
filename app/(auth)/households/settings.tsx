import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useHousehold } from '@/context/HouseholdContext';
import { useHouseholdSettingsController } from '@/hooks/useHouseholdActions';
import { Switch } from '@/components/ui/switch';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, View } from 'react-native';

export default function HouseholdSettingsScreen() {
  const { currentHousehold, households } = useHousehold();
  const params = useLocalSearchParams();
  const paramId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
  const selectedHouseholdId = paramId || currentHousehold?.id;
  const selectedHousehold = households.find((h) => h.id === selectedHouseholdId) || currentHousehold;
  const {
    loading,
    saving,
    canSave,
    error,
    notifications,
    childApproval,
    setNotification,
    setChildApprovalValue,
    save,
    clearError,
  } = useHouseholdSettingsController(selectedHouseholdId);

  useEffect(() => {
    if (!error) return;
    Alert.alert('Erreur', error, [{ text: 'OK', onPress: clearError }]);
  }, [clearError, error]);

  const handleSave = async () => {
    try {
      await save();
    } catch (e: any) {
      Alert.alert('Échec de l\'enregistrement', e?.message || 'Impossible d\'enregistrer');
      clearError();
    }
  };

  if (!selectedHouseholdId) {
    return (
      <View className="flex-1 p-6">
        <Text>Pas de foyer sélectionné</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-6 gap-5">
      <TopNav />
      <Text className="text-3xl font-bold">{selectedHousehold?.name || 'Foyer'} - Paramètres</Text>

      {/* Notifications */}
      <View className="gap-3">
        <Text className="text-xl font-semibold text-gray-700">Notifications</Text>
        {([
          ['stockUpdates', 'Mises à jour des stocks'],
          ['childActions', 'Actions des enfants'],
          ['expirationAlerts', 'Alertes de péremption'],
          ['memberJoined', 'Nouveau membre dans le foyer'],
          ['onlyParentsForApproval', 'Approbation par les parents uniquement'],
        ] as [keyof typeof notifications, string][]).map(([key, label]) => (
          <View key={key} className="flex-row items-center justify-between py-1">
            <Text>{label}</Text>
            <Switch
              checked={!!notifications[key]}
              onCheckedChange={(checked) =>
                setNotification(key, !!checked)
              }
            />
          </View>
        ))}

        <View className="gap-2">
          <Label>Mode de notification</Label>
          <View className="flex-row gap-2 flex-wrap">
            {(['instant', 'daily', 'weekly', 'disabled'] as const).map((m) => (
              <Button
                key={m}
                variant={notifications.digestMode === m ? 'default' : 'outline'}
                onPress={() => setNotification('digestMode', m)}
              >
                {m === 'instant' ? 'instantané' : m === 'daily' ? 'quotidien' : m === 'weekly' ? 'hebdomadaire' : 'désactivé'}
              </Button>
            ))}
          </View>
        </View>
      </View>

      {/* Child approval */}
      <View className="gap-3">
        <Text className="text-xl font-semibold text-gray-700">Approbation des enfants</Text>
        <View className="flex-row items-center justify-between py-1">
          <Text>Activé</Text>
          <Switch
            checked={!!childApproval.enabled}
            onCheckedChange={(checked) =>
              setChildApprovalValue('enabled', !!checked)
            }
          />
        </View>
        <View className="gap-1">
          <Label>Heures d&apos;expiration automatique</Label>
          <Input
            keyboardType="numeric"
            value={String(childApproval.autoExpireHours)}
            onChangeText={(v) =>
              setChildApprovalValue(
                'autoExpireHours',
                Math.max(0, parseInt(v || '0', 10) || 0)
              )
            }
            editable={!!childApproval.enabled}
          />
        </View>
        <View className="gap-1">
          <Label>Quantité max sans approbation</Label>
          <Input
            keyboardType="numeric"
            value={String(childApproval.maxQuantityWithoutApproval)}
            onChangeText={(v) =>
              setChildApprovalValue(
                'maxQuantityWithoutApproval',
                Math.max(0, parseInt(v || '0', 10) || 0)
              )
            }
            editable={!!childApproval.enabled}
          />
        </View>
      </View>

      <Button disabled={!canSave || loading || saving} onPress={handleSave}>
        {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
      </Button>
    </View>
  );
}
