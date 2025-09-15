import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Household,
  listHouseholds,
} from '@/services/household';
import { useAuth } from '@/context/AuthContext';
import { getCurrentHouseholdIdStorage, setCurrentHouseholdIdStorage } from '@/services/storage';

type HouseholdContextType = {
  loading: boolean;
  households: Household[];
  currentHouseholdId?: string;
  currentHousehold?: Household;
  setCurrentHousehold: (id?: string) => Promise<void>;
  refreshHouseholds: () => Promise<void>;
  needsOnboarding: boolean;
  hydrated: boolean;
};

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const { token, initialized } = useAuth();
  const [loading, setLoading] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  const pickDefaultHousehold = useCallback(async (all: Household[]) => {
    // Try stored
    const stored = await getCurrentHouseholdIdStorage();
    if (stored && all.some((h) => h.id === stored)) {
      setCurrentHouseholdId(stored);
      return stored;
    }
    // Fallback to first
    const first = all[0]?.id;
    setCurrentHouseholdId(first);
    if (first) await setCurrentHouseholdIdStorage(first);
    return first;
  }, []);

  const refreshHouseholds = useCallback(async () => {
    if (!token) {
      setHouseholds([]);
      setCurrentHouseholdId(undefined);
      setHydrated(true);
      return;
    }
    setLoading(true);
    try {
      const data = await listHouseholds();
      setHouseholds(data);
      if (data.length === 0) {
        setCurrentHouseholdId(undefined);
        await setCurrentHouseholdIdStorage(undefined);
      } else if (!currentHouseholdId || !data.some((h) => h.id === currentHouseholdId)) {
        await pickDefaultHousehold(data);
      }
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [token, currentHouseholdId, pickDefaultHousehold]);

  const setCurrentHousehold = useCallback(async (id?: string) => {
    setCurrentHouseholdId(id);
    await setCurrentHouseholdIdStorage(id);
  }, []);

  // Load on auth init or token change
  useEffect(() => {
    if (!initialized) return;

    refreshHouseholds();
  }, [initialized, token, refreshHouseholds]);

  const currentHousehold = useMemo(
    () => households.find((h) => h.id === currentHouseholdId),
    [households, currentHouseholdId]
  );

  const value = useMemo<HouseholdContextType>(
    () => ({
      loading,
      households,
      currentHouseholdId,
      currentHousehold,
      setCurrentHousehold,
      refreshHouseholds,
      needsOnboarding: hydrated && initialized && !!token && households.length === 0,
      hydrated,
    }),
    [loading, households, currentHouseholdId, currentHousehold, setCurrentHousehold, refreshHouseholds, initialized, token, hydrated]
  );

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error('useHousehold must be used within HouseholdProvider');
  return ctx;
}
