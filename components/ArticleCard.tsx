import React from 'react';
import { View } from 'react-native';

type ArticleCardProps = {
  children: React.ReactNode;
  highlighted?: boolean;
};

export default function ArticleCard({ children, highlighted }: ArticleCardProps) {
  return (
    <View
      style={{
        backgroundColor: highlighted ? '#FAFAF5' : 'white',
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: highlighted ? 2 : 0,
        borderColor: highlighted ? '#22C55E' : 'transparent',
      }}
    >
      {children}
    </View>
  );
} 