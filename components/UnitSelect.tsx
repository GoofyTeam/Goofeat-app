import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { UnitGroups, UnitLabels, UnitType } from '@/constants/Units';
import React from 'react';
import { View } from 'react-native';

interface UnitSelectProps {
  value: UnitType | '';
  onValueChange: (value: UnitType) => void;
  placeholder?: string;
}

export default function UnitSelect({
  value,
  onValueChange,
  placeholder = 'Sélectionner une unité',
}: UnitSelectProps) {
  const handleValueChange = (option: any) => {
    if (option && option.value) {
      onValueChange(option.value as UnitType);
    }
  };

  return (
    <View>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder={placeholder}>
            {value ? UnitLabels[value] : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className='z-50 bg-white'>
          {/* Groupe Masse */}
          <View className='px-3 py-2'>
            <Text className='text-sm font-semibold text-gray-600 mb-2'>
              Masse
            </Text>
            {UnitGroups.Mass.map((unit) => (
              <SelectItem key={unit} value={unit} label={UnitLabels[unit]} />
            ))}
          </View>

          {/* Groupe Volume */}
          <View className='px-3 py-2'>
            <Text className='text-sm font-semibold text-gray-600 mb-2'>
              Volume
            </Text>
            {UnitGroups.Volume.map((unit) => (
              <SelectItem key={unit} value={unit} label={UnitLabels[unit]} />
            ))}
          </View>

          {/* Groupe Pièces */}
          <View className='px-3 py-2'>
            <Text className='text-sm font-semibold text-gray-600 mb-2'>
              Pièces
            </Text>
            {UnitGroups.Piece.map((unit) => (
              <SelectItem key={unit} value={unit} label={UnitLabels[unit]} />
            ))}
          </View>
        </SelectContent>
      </Select>
    </View>
  );
}
