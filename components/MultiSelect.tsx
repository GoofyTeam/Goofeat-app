import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown } from '@/lib/icons/ChevronDown';
import { X } from '@/lib/icons/X';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export function MultiSelect({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = 'Sélectionner des options',
  searchPlaceholder = 'Rechercher...',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onSelectionChange(selectedValues.filter((value) => value !== option));
    } else {
      onSelectionChange([...selectedValues, option]);
    }
  };

  const handleRemoveSelected = (option: string) => {
    onSelectionChange(selectedValues.filter((value) => value !== option));
  };

  return (
    <View className='gap-2'>
      <Label>{label}</Label>

      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        className='flex-row items-center justify-between p-3 border border-gray-300 rounded-lg bg-white'
      >
        <Text
          className={`flex-1 ${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}
        >
          {selectedValues.length === 0
            ? placeholder
            : `${selectedValues.length} option(s) sélectionnée(s)`}
        </Text>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </TouchableOpacity>

      {selectedValues.length > 0 && (
        <View className='flex-row flex-wrap gap-2'>
          {selectedValues.map((value) => (
            <View
              key={value}
              className='flex-row items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full'
            >
              <Text className='text-sm text-blue-800'>{value}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveSelected(value)}
                className='ml-1'
              >
                <X className='w-3 h-3 text-blue-600' />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {isOpen && (
        <View className='border border-gray-300 rounded-lg bg-white shadow-lg'>
          <View className='p-3 border-b border-gray-200'>
            <View className='flex-row items-center gap-2'>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={searchPlaceholder}
                className='flex-1 text-base'
              />
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className='p-1'
              >
                <X className='w-4 h-4 text-gray-500' />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className='max-h-48'>
            {filteredOptions.length === 0 ? (
              <View className='p-3'>
                <Text className='text-gray-500 text-center'>
                  Aucune option trouvée
                </Text>
              </View>
            ) : (
              filteredOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleToggleOption(option)}
                  className='flex-row items-center gap-3 p-3 hover:bg-gray-50'
                >
                  <Checkbox
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => handleToggleOption(option)}
                  />
                  <Text className='flex-1 text-base'>{option}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
