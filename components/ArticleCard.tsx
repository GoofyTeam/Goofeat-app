import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

type ArticleCardProps = {
  children: React.ReactNode;
  highlighted?: boolean;
};

export default function ArticleCard({ children, highlighted }: ArticleCardProps) {
  return (
    <View
      className={cn(
        'rounded-3xl p-4 mb-4 bg-white border border-transparent shadow-sm',
        highlighted && 'bg-[#FAFAF5] border-2 border-green-500'
      )}
      // Keep Android elevation without web shadow warnings
      style={{ elevation: 2 }}
    >
      {children}
    </View>
  );
}
