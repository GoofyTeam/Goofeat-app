import { DIETARY_RESTRICTIONS } from '@/constants/FoodPreferences';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

const API_KEY_MAPPING: Record<string, string> = {
  glutenFree: 'gluten_free',
  lactoseFree: 'lactose_free',
  lowCarb: 'low_carb',
  lowFat: 'low_fat',
  lowSodium: 'low_sodium',
};

const getApiKey = (interfaceKey: string): string => {
  return API_KEY_MAPPING[interfaceKey] || interfaceKey;
};

export const useProfile = () => {
  const { user, refreshMe, logout } = useAuth();

  // STATES
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [allergenes, setAllergenes] = useState<string[]>([]);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<
    Record<string, boolean>
  >({});
  const [notificationSettings, setNotificationSettings] = useState({});

  // LOADING STATES
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // LOAD PROFILE
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: profile } = (await apiFetch('/user/profile', {
          version: 'v2',
        })) as {
          data: any;
        };
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setEmail(profile.email || '');

        console.log(profile);

        // LOAD PREFERENCES
        if (profile.preferences) {
          const {
            allergenes,
            preferredCategories,
            excludedCategories,
            dietaryRestrictions,
          } = profile.preferences;

          setAllergenes(allergenes || []);
          setPreferredCategories(preferredCategories || []);
          setExcludedCategories(excludedCategories || []);
          const restrictionsMap: Record<string, boolean> = {};
          DIETARY_RESTRICTIONS.forEach((restriction) => {
            const apiKey = getApiKey(restriction.key);
            restrictionsMap[restriction.key] =
              dietaryRestrictions?.includes(apiKey) || false;
          });
          setDietaryRestrictions(restrictionsMap);
        }

        // LOAD NOTIFICATION SETTINGS
        if (profile.notificationSettings) {
          setNotificationSettings(profile.notificationSettings);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        if (user) {
          setFirstName(user.firstName || '');
          setLastName(user.lastName || '');
          setEmail(user.email || '');
        }
      }
    };
    loadProfile();
  }, [user]);

  // CONVERT TO API FORMAT
  const convertToApiFormat = () => {
    const restrictions: string[] = [];
    Object.entries(dietaryRestrictions).forEach(([key, value]) => {
      if (value) {
        const apiKey = getApiKey(key);
        restrictions.push(apiKey);
      }
    });

    return {
      allergenes,
      preferredCategories,
      excludedCategories,
      dietaryRestrictions: restrictions,
    };
  };

  // UPDATE PROFILE
  const updateProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailPattern.test(email.trim())) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/user/profile/basic-info', {
        method: 'PATCH',
        version: 'v2',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        }),
      });

      const dietaryData = convertToApiFormat();
      console.log("Données envoyées à l'API:", dietaryData);
      await apiFetch('/user/profile/dietary-restrictions', {
        method: 'PATCH',
        version: 'v2',
        body: JSON.stringify(dietaryData),
      });

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      await refreshMe();
    } catch (error: any) {
      if (error.status === 409) {
        Alert.alert(
          'Erreur',
          'Cet email est déjà utilisé par un autre utilisateur'
        );
      } else if (error.status === 400) {
        Alert.alert(
          'Erreur',
          'Données invalides. Vérifiez le format des champs'
        );
      } else if (error.status === 401) {
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter');
        logout();
      } else {
        Alert.alert(
          'Erreur',
          error.message || 'Échec de la mise à jour du profil'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // UPDATE PASSWORD
  const changePassword = async () => {
    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        'Erreur',
        'Le nouveau mot de passe doit contenir au moins 8 caractères'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiFetch('/user/profile/password', {
        method: 'PATCH',
        version: 'v2',
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      Alert.alert('Succès', 'Mot de passe changé avec succès');
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.status === 401) {
        Alert.alert('Erreur', 'Mot de passe actuel incorrect');
      } else if (error.status === 400) {
        Alert.alert('Erreur', 'Format du nouveau mot de passe invalide');
      } else {
        Alert.alert(
          'Erreur',
          error.message || 'Échec du changement de mot de passe'
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // TOGGLE DIETARY RESTRICTION
  const toggleDietaryRestriction = (key: string) => {
    setDietaryRestrictions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // UPDATE NOTIFICATION SETTINGS
  const updateNotificationSettings = async (settings: any) => {
    try {
      await apiFetch('/user/profile/notification-settings', {
        method: 'PATCH',
        version: 'v2',
        body: JSON.stringify({ notificationSettings: settings }),
      });

      setNotificationSettings(settings);
      Alert.alert('Succès', 'Paramètres de notification mis à jour');
    } catch {
      Alert.alert(
        'Erreur',
        'Échec de la mise à jour des paramètres de notification'
      );
    }
  };

  return {
    // STATES
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    allergenes,
    setAllergenes,
    preferredCategories,
    setPreferredCategories,
    excludedCategories,
    setExcludedCategories,
    dietaryRestrictions,
    setDietaryRestrictions,
    loading,
    passwordLoading,
    showPasswordChange,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    notificationSettings,
    setNotificationSettings,

    // FUNCTIONS
    updateProfile,
    changePassword,
    toggleDietaryRestriction,
    setShowPasswordChange,
    updateNotificationSettings,
  };
};
