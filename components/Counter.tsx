import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type CounterProps = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export default function Counter({ value, onIncrement, onDecrement }: CounterProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity onPress={onDecrement}>
        <Text style={{ fontSize: 20, color: 'red', marginHorizontal: 8 }}>-</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 18 }}>{value}</Text>
      <TouchableOpacity onPress={onIncrement}>
        <Text style={{ fontSize: 20, color: 'green', marginHorizontal: 8 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
} 