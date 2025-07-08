import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type ButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
};

export default function Button({ onPress, children, disabled }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={{ opacity: disabled ? 0.5 : 1, padding: 16, backgroundColor: 'green', borderRadius: 8 }}>
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>{children}</Text>
    </TouchableOpacity>
  );
} 