import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, usePathname, useRouter } from 'expo-router';
import { HouseholdSwitcher } from './HouseholdSwitcher';
import { ChevronLeft } from '@/lib/icons/ChevronLeft';

export function TopNav({ title }: { title?: string }) {
  const navigation = useNavigation();
  const router = useRouter();
  const pathname = usePathname();
  const canGoBack = (navigation as any)?.canGoBack?.() ?? false;
  const primaryPaths = new Set(['/', '/stock', '/account']);
  const onPrimaryTab = pathname ? primaryPaths.has(pathname) : false;

  // Compute a fallback path like "/households" from "/households/settings"
  const fallbackPath = (() => {
    if (!pathname) return '/';
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return '/';
    return '/' + parts[0];
  })();

  const canFallback = fallbackPath && fallbackPath !== pathname && !onPrimaryTab;
  const showBack = (!onPrimaryTab) && (canGoBack || canFallback);

  const onHouseholds = pathname.startsWith('/households');

  return (
    <View className="flex-row items-center justify-between mt-8">
      <View className="flex-row items-center gap-3 flex-1">
        {showBack ? (
          <TouchableOpacity
            accessibilityLabel="Back"
            onPress={() => {
              if (canGoBack) (navigation as any)?.goBack?.();
              else router.replace(fallbackPath as any);
            }}
            className="w-9 h-9 rounded-full items-center justify-center bg-gray-100"
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </TouchableOpacity>
        ) : null}
        {!onHouseholds && <HouseholdSwitcher />}
      </View>
      {title ? <Text className="text-base text-gray-600">{title}</Text> : null}
    </View>
  );
}
