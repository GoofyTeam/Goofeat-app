import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useHousehold } from '@/context/HouseholdContext';
import { getHouseholdSettings, updateHouseholdSettings } from '@/services/household';
import { Switch } from '@/components/ui/switch';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

export default function HouseholdSettingsScreen() {
  const { currentHousehold, households } = useHousehold();
  const params = useLocalSearchParams();
  const paramId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
  const selectedHouseholdId = paramId || currentHousehold?.id;
  const selectedHousehold = households.find((h) => h.id === selectedHouseholdId) || currentHousehold;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    stockUpdates: true,
    childActions: true,
    expirationAlerts: true,
    memberJoined: true,
    onlyParentsForApproval: true,
    digestMode: 'instant' as 'instant' | 'daily' | 'weekly' | 'disabled',
  });
  const [childApproval, setChildApproval] = useState({
    enabled: true,
    autoExpireHours: 24,
    maxQuantityWithoutApproval: 1,
  });

  useEffect(() => {
    (async () => {
      if (!selectedHouseholdId) return;
      setLoading(true);
      try {
        const s = await getHouseholdSettings(selectedHouseholdId);
        setNotifications({
          stockUpdates: s.notifications?.stockUpdates ?? true,
          childActions: s.notifications?.childActions ?? true,
          expirationAlerts: s.notifications?.expirationAlerts ?? true,
          memberJoined: s.notifications?.memberJoined ?? true,
          onlyParentsForApproval: s.notifications?.onlyParentsForApproval ?? true,
          digestMode: s.notifications?.digestMode ?? 'instant',
        });
        setChildApproval({
          enabled: s.childApproval?.enabled ?? true,
          autoExpireHours: s.childApproval?.autoExpireHours ?? 24,
          maxQuantityWithoutApproval: s.childApproval?.maxQuantityWithoutApproval ?? 1,
        });
      } catch (e) {
        console.error(e);
        Alert.alert('Erreur', 'Impossible de charger les paramètres');
      } finally {
        setLoading(false);
      }
    })();
  }, [currentHousehold, currentHousehold?.id, selectedHouseholdId]);

  const canSave = useMemo(() => !!selectedHouseholdId, [selectedHouseholdId]);

  const handleSave = async () => {
    if (!selectedHouseholdId) return;
    try {
      setSaving(true);
      await updateHouseholdSettings(selectedHouseholdId, { notifications, childApproval });
    } catch (e: any) {
      Alert.alert('Échec de l\'enregistrement', e?.message || 'Impossible d\'enregistrer');
    } finally {
      setSaving(false);
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
          ['memberJoined', 'Nouveau membre'],
          ['onlyParentsForApproval', 'Approbation par les parents uniquement'],
        ] as [keyof typeof notifications, string][]).map(([key, label]) => (
          <View key={key} className="flex-row items-center justify-between py-1">
            <Text>{label}</Text>
            <Switch
              checked={!!notifications[key]}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, [key]: !!checked }))
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
                onPress={() => setNotifications((prev) => ({ ...prev, digestMode: m }))}
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
              setChildApproval((prev) => ({ ...prev, enabled: !!checked }))
            }
          />
        </View>
        <View className="gap-1">
          <Label>Heures d&apos;expiration automatique</Label>
          <Input
            keyboardType="numeric"
            value={String(childApproval.autoExpireHours)}
            onChangeText={(v) => setChildApproval((prev) => ({ ...prev, autoExpireHours: Math.max(0, parseInt(v || '0', 10) || 0) }))}
            editable={!!childApproval.enabled}
          />
        </View>
        <View className="gap-1">
          <Label>Quantité max sans approbation</Label>
          <Input
            keyboardType="numeric"
            value={String(childApproval.maxQuantityWithoutApproval)}
            onChangeText={(v) => setChildApproval((prev) => ({ ...prev, maxQuantityWithoutApproval: Math.max(0, parseInt(v || '0', 10) || 0) }))}
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
