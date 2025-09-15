import { Slot, Redirect, usePathname } from 'expo-router';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useHousehold } from '@/context/HouseholdContext';

export default function AuthGroupLayout() {
  const { initialized, token } = useAuth();
  const { needsOnboarding, hydrated, loading } = useHousehold();
  const pathname = usePathname();

  if (!initialized) return null;
  if (!token) return <Redirect href="/login" />;

  // Redirect to onboarding if user has no household
  if (
    needsOnboarding && hydrated && !loading &&
    // allow visiting onboarding or join/create routes without redirect loop
    !(pathname?.startsWith('/households'))
  ) {
    return <Redirect href="/households/onboarding" />;
  }

  return <Slot />;
}
