import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function AccountScreen() {
  const { logout, user, refreshMe } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleDisconnect = () => {
    logout();
    // Safety: navigate to login; TabLayout also redirects when token is cleared
    try {
      router.replace('/login');
    } catch {}
  };

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailPattern.test(email.trim())) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implémenter l'API de mise à jour du profil
      // await updateProfile({ firstName, lastName, email });
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      await refreshMe();
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.message || 'Échec de la mise à jour du profil'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className='flex-1 bg-background'>
      <View className='flex-1 p-6 gap-6'>
        <Text className='text-3xl font-bold'>Profil</Text>

        <View className='gap-6'>
          <View className='gap-3'>
            <Label>Prénom</Label>
            <Input
              value={firstName}
              onChangeText={setFirstName}
              placeholder='Votre prénom'
            />
          </View>

          <View className='gap-3'>
            <Label>Nom</Label>
            <Input
              value={lastName}
              onChangeText={setLastName}
              placeholder='Votre nom'
            />
          </View>

          <View className='gap-3'>
            <Label>Email</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
              placeholder='votre@email.com'
            />
          </View>
        </View>

        <View className='gap-4 mt-8'>
          <Button
            onPress={handleUpdateProfile}
            disabled={loading}
            className='w-full'
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
          </Button>

          <Button
            variant='outline'
            onPress={handleDisconnect}
            className='w-full'
          >
            Se déconnecter
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
