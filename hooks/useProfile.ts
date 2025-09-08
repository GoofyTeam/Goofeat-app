import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useProfile = () => {
  const { user, refreshMe, logout } = useAuth();

  // États du formulaire
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [allergenes, setAllergenes] = useState<string[]>([]);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState({
    vegan: false,
    glutenFree: false,
  });

  // États de chargement
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Charger le profil
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

        if (profile.dietaryRestrictions) {
          const {
            allergenes,
            preferredCategories,
            excludedCategories,
            dietaryRestrictions,
          } = profile.dietaryRestrictions;
          setAllergenes(allergenes || []);
          setPreferredCategories(preferredCategories || []);
          setExcludedCategories(excludedCategories || []);
          setDietaryRestrictions((prev) => ({
            ...prev,
            vegan: dietaryRestrictions.includes('vegan'),
            glutenFree: dietaryRestrictions.includes('gluten_free'),
          }));
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

  // Convertir vers format API
  const convertToApiFormat = () => {
    const restrictions: string[] = [];
    if (dietaryRestrictions.vegan) restrictions.push('vegan');
    if (dietaryRestrictions.glutenFree) restrictions.push('gluten_free');

    return {
      allergenes,
      preferredCategories,
      excludedCategories,
      dietaryRestrictions: restrictions,
    };
  };

  // Mettre à jour le profil
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

  // Changer le mot de passe
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

  // Toggle restriction alimentaire
  const toggleDietaryRestriction = (key: keyof typeof dietaryRestrictions) => {
    setDietaryRestrictions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return {
    // États
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
    loading,
    passwordLoading,
    showPasswordChange,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,

    // Actions
    updateProfile,
    changePassword,
    toggleDietaryRestriction,
    setShowPasswordChange,
  };
};
