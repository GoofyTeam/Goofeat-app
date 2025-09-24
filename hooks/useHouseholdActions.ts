import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Clipboard from 'expo-clipboard';

import { useHousehold } from '@/context/HouseholdContext';
import {
  createHousehold,
  forceDeleteHousehold,
  generateInviteCode,
  getHouseholdSettings,
  Household,
  HouseholdSettings,
  HouseholdType,
  joinHousehold,
  leaveHousehold,
  listMembers,
  updateHouseholdSettings,
} from '@/services/household';

const HOUSEHOLD_TYPE_LABELS: Record<HouseholdType, string> = {
  family: 'Famille',
  couple: 'Couple',
  colocation: 'Colocation',
  single: 'Personne seule',
};

export const HOUSEHOLD_TYPE_OPTIONS: { label: string; value: HouseholdType }[] = [
  { label: HOUSEHOLD_TYPE_LABELS.family, value: 'family' },
  { label: HOUSEHOLD_TYPE_LABELS.couple, value: 'couple' },
  { label: HOUSEHOLD_TYPE_LABELS.colocation, value: 'colocation' },
  { label: HOUSEHOLD_TYPE_LABELS.single, value: 'single' },
];

export type HouseholdListItem = Household & {
  typeLabel: string;
  isActive: boolean;
};

export function useHouseholdManager() {
  const {
    households,
    currentHouseholdId,
    setCurrentHousehold,
    refreshHouseholds,
  } = useHousehold();
  const [busyHouseholdId, setBusyHouseholdId] = useState<string | null>(null);
  const [invitingHouseholdId, setInvitingHouseholdId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo<HouseholdListItem[]>(
    () =>
      households.map((household) => ({
        ...household,
        typeLabel: HOUSEHOLD_TYPE_LABELS[household.type] ?? household.type,
        isActive: household.id === currentHouseholdId,
      })),
    [households, currentHouseholdId]
  );

  const activateHousehold = useCallback(
    async (householdId: string) => {
      if (!householdId || householdId === currentHouseholdId) return;
      setError(null);
      await setCurrentHousehold(householdId);
    },
    [currentHouseholdId, setCurrentHousehold]
  );

  const leave = useCallback(
    async (householdId: string) => {
      setBusyHouseholdId(householdId);
      setError(null);
      try {
        const members = await listMembers(householdId);
        const action = members.length <= 1 ? 'deleted' : 'left';

        if (action === 'deleted') {
          await forceDeleteHousehold(householdId);
        } else {
          await leaveHousehold(householdId);
        }

        await refreshHouseholds();
        return action as 'left' | 'deleted';
      } catch (err: any) {
        const message = err?.message || "Impossible d'effectuer l'action";
        setError(message);
        throw err;
      } finally {
        setBusyHouseholdId(null);
      }
    },
    [refreshHouseholds]
  );

  const invite = useCallback(
    async (householdId: string) => {
      setInvitingHouseholdId(householdId);
      setError(null);
      try {
        const { inviteCode } = await generateInviteCode(householdId);
        if (!inviteCode) throw new Error("Code d'invitation non disponible");

        await Clipboard.setStringAsync(inviteCode);
        return inviteCode;
      } catch (err: any) {
        const message = err?.message || "Impossible de générer un code d'invitation";
        setError(message);
        throw err;
      } finally {
        setInvitingHouseholdId(null);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    households: items,
    invitingHouseholdId,
    busyHouseholdId,
    error,
    clearError,
    refreshHouseholds,
    activateHousehold,
    leave,
    invite,
  };
}

type CreateHouseholdFormState = {
  name: string;
  type: HouseholdType;
  description: string;
};

type CreateHouseholdResult = {
  state: CreateHouseholdFormState;
  submitting: boolean;
  canSubmit: boolean;
  error: string | null;
  setName: (value: string) => void;
  setType: (value: HouseholdType) => void;
  setDescription: (value: string) => void;
  submit: () => Promise<Household | undefined>;
  clearError: () => void;
};

const defaultCreateState: CreateHouseholdFormState = {
  name: '',
  type: 'single',
  description: '',
};

export function useCreateHouseholdForm(): CreateHouseholdResult {
  const { refreshHouseholds, setCurrentHousehold } = useHousehold();
  const [state, setState] = useState<CreateHouseholdFormState>(defaultCreateState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => state.name.trim().length > 0,
    [state.name]
  );

  const setName = useCallback((value: string) => {
    setState((prev) => ({ ...prev, name: value }));
  }, []);

  const setType = useCallback((value: HouseholdType) => {
    setState((prev) => ({ ...prev, type: value }));
  }, []);

  const setDescription = useCallback((value: string) => {
    setState((prev) => ({ ...prev, description: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const next = await createHousehold({
        name: state.name.trim(),
        type: state.type,
        description: state.description.trim() || undefined,
      });

      await refreshHouseholds();
      await setCurrentHousehold(next.id);
      setState(defaultCreateState);
      return next;
    } catch (err: any) {
      const message = err?.message || 'Il y a eu un problème lors de la création du foyer';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, refreshHouseholds, setCurrentHousehold, state.description, state.name, state.type]);

  const clearError = useCallback(() => setError(null), []);

  return {
    state,
    submitting,
    canSubmit,
    error,
    setName,
    setType,
    setDescription,
    submit,
    clearError,
  };
}

type JoinHouseholdFormState = {
  code: string;
  nickname: string;
};

type JoinHouseholdResult = {
  state: JoinHouseholdFormState;
  submitting: boolean;
  canSubmit: boolean;
  error: string | null;
  setCode: (value: string) => void;
  setNickname: (value: string) => void;
  submit: () => Promise<void>;
  clearError: () => void;
};

const defaultJoinState: JoinHouseholdFormState = {
  code: '',
  nickname: '',
};

export function useJoinHouseholdForm(): JoinHouseholdResult {
  const { refreshHouseholds } = useHousehold();
  const [state, setState] = useState<JoinHouseholdFormState>(defaultJoinState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => state.code.trim().length > 0,
    [state.code]
  );

  const setCode = useCallback((value: string) => {
    setState((prev) => ({ ...prev, code: value }));
  }, []);

  const setNickname = useCallback((value: string) => {
    setState((prev) => ({ ...prev, nickname: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await joinHousehold({
        inviteCode: state.code.trim(),
        nickname: state.nickname.trim() || undefined,
      });

      setState(defaultJoinState);
      await refreshHouseholds();
    } catch (err: any) {
      const message = err?.message || 'Impossible de rejoindre le foyer';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, refreshHouseholds, state.code, state.nickname]);

  const clearError = useCallback(() => setError(null), []);

  return {
    state,
    submitting,
    canSubmit,
    error,
    setCode,
    setNickname,
    submit,
    clearError,
  };
}

type NotificationsState = {
  stockUpdates: boolean;
  childActions: boolean;
  expirationAlerts: boolean;
  memberJoined: boolean;
  onlyParentsForApproval: boolean;
  digestMode: NonNullable<HouseholdSettings['notifications']>['digestMode'];
};

type ChildApprovalState = {
  enabled: boolean;
  autoExpireHours: number;
  maxQuantityWithoutApproval: number;
};

type HouseholdSettingsController = {
  loading: boolean;
  saving: boolean;
  canSave: boolean;
  error: string | null;
  notifications: NotificationsState;
  childApproval: ChildApprovalState;
  setNotification: <K extends keyof NotificationsState>(key: K, value: NotificationsState[K]) => void;
  setChildApprovalValue: <K extends keyof ChildApprovalState>(key: K, value: ChildApprovalState[K]) => void;
  reload: () => Promise<void>;
  save: () => Promise<void>;
  clearError: () => void;
};

const defaultNotificationsState: NotificationsState = {
  stockUpdates: true,
  childActions: true,
  expirationAlerts: true,
  memberJoined: true,
  onlyParentsForApproval: true,
  digestMode: 'instant',
};

const defaultChildApprovalState: ChildApprovalState = {
  enabled: true,
  autoExpireHours: 24,
  maxQuantityWithoutApproval: 1,
};

export function useHouseholdSettingsController(householdId?: string): HouseholdSettingsController {
  const [notifications, setNotifications] = useState<NotificationsState>(defaultNotificationsState);
  const [childApproval, setChildApproval] = useState<ChildApprovalState>(defaultChildApprovalState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySettings = useCallback((settings: HouseholdSettings) => {
    setNotifications({
      stockUpdates: settings.notifications?.stockUpdates ?? defaultNotificationsState.stockUpdates,
      childActions: settings.notifications?.childActions ?? defaultNotificationsState.childActions,
      expirationAlerts: settings.notifications?.expirationAlerts ?? defaultNotificationsState.expirationAlerts,
      memberJoined: settings.notifications?.memberJoined ?? defaultNotificationsState.memberJoined,
      onlyParentsForApproval:
        settings.notifications?.onlyParentsForApproval ?? defaultNotificationsState.onlyParentsForApproval,
      digestMode: settings.notifications?.digestMode ?? defaultNotificationsState.digestMode,
    });

    setChildApproval({
      enabled: settings.childApproval?.enabled ?? defaultChildApprovalState.enabled,
      autoExpireHours: settings.childApproval?.autoExpireHours ?? defaultChildApprovalState.autoExpireHours,
      maxQuantityWithoutApproval:
        settings.childApproval?.maxQuantityWithoutApproval ?? defaultChildApprovalState.maxQuantityWithoutApproval,
    });
  }, []);

  const fetchSettings = useCallback(
    async (id: string) => {
      const settings = await getHouseholdSettings(id);
      applySettings(settings);
      return settings;
    },
    [applySettings]
  );

  const reload = useCallback(async () => {
    if (!householdId) return;

    setLoading(true);
    setError(null);

    try {
      await fetchSettings(householdId);
    } catch (err: any) {
      const message = err?.message || 'Impossible de charger les paramètres';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSettings, householdId]);

  const save = useCallback(async () => {
    if (!householdId) throw new Error('Pas de foyer sélectionné');

    setSaving(true);
    setError(null);

    try {
      await updateHouseholdSettings(householdId, {
        notifications,
        childApproval,
      });
    } catch (err: any) {
      const message = err?.message || "Impossible d'enregistrer";
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [childApproval, householdId, notifications]);

  const setNotification = useCallback(
    <K extends keyof NotificationsState>(key: K, value: NotificationsState[K]) => {
      setNotifications((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setChildApprovalValue = useCallback(
    <K extends keyof ChildApprovalState>(key: K, value: ChildApprovalState[K]) => {
      setChildApproval((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (!householdId) {
      setNotifications(defaultNotificationsState);
      setChildApproval(defaultChildApprovalState);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetchSettings(householdId)
      .catch((err: any) => {
        if (!active) return;
        const message = err?.message || 'Impossible de charger les paramètres';
        setError(message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchSettings, householdId]);

  const canSave = useMemo(() => !!householdId, [householdId]);

  return {
    loading,
    saving,
    canSave,
    error,
    notifications,
    childApproval,
    setNotification,
    setChildApprovalValue,
    reload,
    save,
    clearError,
  };
}

export { HOUSEHOLD_TYPE_LABELS };
