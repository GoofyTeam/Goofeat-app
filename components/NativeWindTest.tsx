import React from 'react';
import { Text, View } from 'react-native';
import '../app/global.css';

export default function NativeWindTest() {
  return (
    <View className="flex-1 justify-center items-center bg-blue-500 ">
      <Text className="text-white text-2xl font-bold">NativeWind Test</Text>
      <Text className="text-white text-lg mt-2">Si vous voyez ce texte en blanc sur fond bleu, NativeWind fonctionne !</Text>
    </View>
  );
} 