import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function AccountScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    allergies,
    setAllergies,
    otherRestrictions,
    setOtherRestrictions,
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
    updateProfile,
    changePassword,
    toggleDietaryRestriction,
    setShowPasswordChange,
  } = useProfile();

  const handleDisconnect = () => {
    logout();
    try {
      router.replace('/login');
    } catch {}
  };

  return (
    <ScrollView className='flex-1 bg-background'>
      <View className='flex-1 p-6 gap-6'>
        <Text className='text-3xl font-bold'>Profil</Text>

        {/* Informations personnelles */}
        <View className='gap-6'>
          <Text className='text-xl font-semibold text-gray-700'>
            Informations personnelles
          </Text>

          <View className='gap-3'>
            <Label>Prénom *</Label>
            <Input
              value={firstName}
              onChangeText={setFirstName}
              placeholder='Votre prénom'
            />
          </View>

          <View className='gap-3'>
            <Label>Nom *</Label>
            <Input
              value={lastName}
              onChangeText={setLastName}
              placeholder='Votre nom'
            />
          </View>

          <View className='gap-3'>
            <Label>Email *</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
              autoCapitalize='none'
              placeholder='votre@email.com'
            />
          </View>
        </View>

        {/* Préférences alimentaires */}
        <View className='gap-6'>
          <Text className='text-xl font-semibold text-gray-700'>
            Préférences alimentaires
          </Text>

          <View className='gap-3'>
            <Label>Allergies alimentaires</Label>
            <Textarea
              value={allergies}
              onChangeText={setAllergies}
              placeholder='Listez vos allergies (ex: arachides, fruits de mer, lait...)'
              className='min-h-[80px]'
            />
          </View>

          <View className='gap-4'>
            <Label>Régimes alimentaires</Label>
            <View className='gap-3'>
              {[
                { key: 'vegetarian', label: 'Végétarien' },
                { key: 'vegan', label: 'Végan' },
                { key: 'halal', label: 'Halal' },
                { key: 'kosher', label: 'Kosher' },
              ].map(({ key, label }) => (
                <View key={key} className='flex-row items-center gap-3'>
                  <Checkbox
                    checked={
                      dietaryRestrictions[
                        key as keyof typeof dietaryRestrictions
                      ]
                    }
                    onCheckedChange={() =>
                      toggleDietaryRestriction(
                        key as keyof typeof dietaryRestrictions
                      )
                    }
                  />
                  <Label>{label}</Label>
                </View>
              ))}
            </View>
          </View>

          <View className='gap-4'>
            <Label>Restrictions alimentaires</Label>
            <View className='gap-3'>
              {[
                { key: 'glutenFree', label: 'Sans gluten' },
                { key: 'lactoseFree', label: 'Sans lactose' },
                { key: 'noPork', label: 'Pas de porc' },
                { key: 'noSeafood', label: 'Pas de fruits de mer' },
                { key: 'noNuts', label: 'Pas de noix' },
                { key: 'noEggs', label: 'Pas d&apos;œufs' },
              ].map(({ key, label }) => (
                <View key={key} className='flex-row items-center gap-3'>
                  <Checkbox
                    checked={
                      dietaryRestrictions[
                        key as keyof typeof dietaryRestrictions
                      ]
                    }
                    onCheckedChange={() =>
                      toggleDietaryRestriction(
                        key as keyof typeof dietaryRestrictions
                      )
                    }
                  />
                  <Label>{label}</Label>
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Label>Autres restrictions</Label>
            <Textarea
              value={otherRestrictions}
              onChangeText={setOtherRestrictions}
              placeholder='Autres préférences ou restrictions alimentaires...'
              className='min-h-[80px]'
            />
          </View>
        </View>

        {/* Changement de mot de passe */}
        <View className='gap-6'>
          <Text className='text-xl font-semibold text-gray-700'>Sécurité</Text>

          {!showPasswordChange ? (
            <Button
              variant='outline'
              onPress={() => setShowPasswordChange(true)}
              className='w-full'
            >
              Changer le mot de passe
            </Button>
          ) : (
            <View className='gap-4 p-4 border border-gray-200 rounded-lg'>
              <Text className='text-lg font-medium'>
                Changer le mot de passe
              </Text>

              <View className='gap-3'>
                <Label>Mot de passe actuel *</Label>
                <Input
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder='Votre mot de passe actuel'
                />
              </View>

              <View className='gap-3'>
                <Label>Nouveau mot de passe *</Label>
                <Input
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder='Nouveau mot de passe (min. 8 caractères)'
                />
              </View>

              <View className='gap-3'>
                <Label>Confirmer le nouveau mot de passe *</Label>
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder='Confirmez le nouveau mot de passe'
                />
              </View>

              <View className='flex-row gap-3'>
                <Button
                  variant='outline'
                  onPress={() => {
                    setShowPasswordChange(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className='flex-1'
                >
                  Annuler
                </Button>
                <Button
                  onPress={changePassword}
                  disabled={passwordLoading}
                  className='flex-1'
                >
                  {passwordLoading ? 'Changement...' : 'Changer'}
                </Button>
              </View>
            </View>
          )}
        </View>

        <View className='gap-4 mt-8'>
          <Button onPress={updateProfile} disabled={loading} className='w-full'>
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
