import React, { useMemo, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useHousehold } from '@/context/HouseholdContext';
import { useRouter } from 'expo-router';
import { ChevronDown } from '@/lib/icons/ChevronDown';

export function HouseholdSwitcher() {
  const router = useRouter();
  const { households, currentHousehold, setCurrentHousehold } = useHousehold();
  const [open, setOpen] = useState(false);

  const otherHouseholds = useMemo(
    () => households.filter((h) => h.id !== currentHousehold?.id),
    [households, currentHousehold]
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center rounded-full bg-gray-100"
        activeOpacity={0.7}
      >
        <Text className="text-lg font-semibold" numberOfLines={1}>
          {currentHousehold?.name}
        </Text>
        <ChevronDown size={18} className="ml-2 text-gray-600" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/30" onPress={() => setOpen(false)}>
          <View className="mt-4 mx-4 bg-white rounded-lg p-4" onStartShouldSetResponder={() => true}>
            {currentHousehold ? (
              <View className="mb-2">
                <Text className="text-sm text-gray-500 mb-1">Foyer actif</Text>
                <View className="flex-row justify-between items-center py-3">
                  <Text className="text-base font-medium">{currentHousehold.name}</Text>
                </View>
              </View>
            ) : null}

            {otherHouseholds.length > 0 ? (
              <View className="mb-2">
                <Text className="text-sm text-gray-500 mb-1">Autres foyers</Text>
                {otherHouseholds.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    className="py-3"
                    onPress={async () => {
                      await setCurrentHousehold(h.id);
                      setOpen(false);
                    }}
                  >
                    <Text className="text-base">{h.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <View className="mt-2 pt-2 border-t border-gray-200">
              <TouchableOpacity
                className="py-3"
                onPress={() => {
                  setOpen(false);
                  router.push('/households');
                }}
              >
                <Text className="text-blue-600 text-base">Editer les foyers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
