import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import UnitSelect from '@/components/UnitSelect';
import { UnitType } from '@/constants/Units';
import { useManualForm } from '@/hooks/useManualForm';
import React from 'react';
import { FlatList, ScrollView, TouchableOpacity, View } from 'react-native';

interface ManualFormComponentProps {
  onSuccess?: () => void;
}

export default function ManualFormComponent({
  onSuccess,
}: ManualFormComponentProps) {
  const {
    manualForm,
    searchResults,
    isSearching,
    showDropdown,
    handleNameChange,
    handleIngredientSelect,
    handleFieldChange,
    handleSubmit,
    setShowDropdown,
  } = useManualForm(onSuccess);

  return (
    <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
      <View className='gap-4'>
        <View className='relative z-50'>
          <Text className='mb-2 font-semibold'>Nom du produit *</Text>
          <Input
            placeholder='Ex: Pommes, Lait, Pain...'
            value={manualForm.name}
            onChangeText={handleNameChange}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 200);
            }}
          />

          {showDropdown && searchResults.length > 0 && (
            <View className='absolute z-50 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48'>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleIngredientSelect(item)}
                    className='px-4 py-3 border-b border-gray-100 last:border-b-0 active:bg-gray-50'
                  >
                    <Text className='text-base font-medium'>{item.name}</Text>
                    {item.parentOffTags && item.parentOffTags.length > 0 && (
                      <Text className='text-sm text-gray-500 mt-1'>
                        {item.parentOffTags.join(', ')}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {isSearching && (
            <View className='absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-50'>
              <View className='px-4 py-3'>
                <Text className='text-gray-500'>Recherche en cours...</Text>
              </View>
            </View>
          )}
        </View>

        <View>
          <Text className='mb-2 font-semibold'>Marque</Text>
          <Input
            placeholder='Ex: Carrefour, Danone...'
            value={manualForm.brand}
            onChangeText={(text) => handleFieldChange('brand', text)}
          />
        </View>

        <View className='flex-row gap-3'>
          <View className='flex-1'>
            <Text className='mb-2 font-semibold'>Quantité *</Text>
            <Input
              placeholder='1'
              value={manualForm.quantity}
              onChangeText={(text) => handleFieldChange('quantity', text)}
              keyboardType='numeric'
            />
          </View>
          <View className='flex-1'>
            <Text className='mb-2 font-semibold'>Unité *</Text>
            <UnitSelect
              value={manualForm.unit}
              onValueChange={(unit: UnitType) =>
                handleFieldChange('unit', unit)
              }
              placeholder='Sélectionner une unité'
            />
          </View>
        </View>

        <View>
          <Text className='mb-2 font-semibold'>
            Date limite de consommation (optionnel)
          </Text>
          <Input
            placeholder='YYYY-MM-DD'
            value={manualForm.dlc}
            onChangeText={(text) => handleFieldChange('dlc', text)}
          />
        </View>

        <Button onPress={handleSubmit} className='mt-4'>
          Ajouter au stock
        </Button>
      </View>
    </ScrollView>
  );
}
