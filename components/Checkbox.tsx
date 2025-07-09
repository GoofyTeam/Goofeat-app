import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  children?: React.ReactNode;
};

export default function Checkbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <TouchableOpacity onPress={onChange} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderWidth: 2,
          borderColor: '#22C55E',
          borderRadius: 6,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {checked && (
          <View
            style={{
              width: 16,
              height: 16,
              backgroundColor: '#22C55E',
              borderRadius: 4,
            }}
          />
        )}
      </View>
      {children && <>{children}</>}
    </TouchableOpacity>
  );
} 