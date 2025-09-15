import { MultiSelect } from '@/components/MultiSelect';
import { TopNav } from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import {
	ALLERGENES,
	DIETARY_RESTRICTIONS,
	EXCLUDED_CATEGORIES,
	PREFERRED_CATEGORIES,
} from '@/constants/FoodPreferences';
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
		updateProfile,
		changePassword,
		setShowPasswordChange,
	} = useProfile();

	const handleDisconnect = () => {
		logout();
		try {
			router.replace('/login');
		} catch {}
	};

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="flex-1 p-6 gap-6">
				<View>
					<TopNav />
					<Text className="text-3xl font-bold">Compte</Text>
				</View>
				<Button
					variant="outline"
					onPress={() => router.push('/households/settings')}
				>
					Paramètres du foyer
				</Button>

				<View className="gap-6">
					<Text className="text-xl font-semibold text-gray-700">
						Informations personnelles
					</Text>

					<View className="gap-3">
						<Label>Prénom *</Label>
						<Input
							value={firstName}
							onChangeText={setFirstName}
							placeholder="Votre prénom"
						/>
					</View>

					<View className="gap-3">
						<Label>Nom *</Label>
						<Input
							value={lastName}
							onChangeText={setLastName}
							placeholder="Votre nom"
						/>
					</View>

					<View className="gap-3">
						<Label>Email *</Label>
						<Input
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							placeholder="votre@email.com"
						/>
					</View>
				</View>

				<View className="gap-6">
					<Text className="text-xl font-semibold text-gray-700">
						Préférences alimentaires
					</Text>

					<MultiSelect
						label="Allergies alimentaires"
						options={ALLERGENES}
						selectedValues={allergenes}
						onSelectionChange={setAllergenes}
						placeholder="Sélectionner vos allergies"
						searchPlaceholder="Rechercher une allergie..."
					/>

					<MultiSelect
						label="Restrictions alimentaires"
						options={DIETARY_RESTRICTIONS.map((r) => r.label)}
						selectedValues={DIETARY_RESTRICTIONS.filter(
							(r) => dietaryRestrictions[r.key]
						).map((r) => r.label)}
						onSelectionChange={(selectedLabels) => {
							const selectedKeys = DIETARY_RESTRICTIONS.filter((r) =>
								selectedLabels.includes(r.label)
							).map((r) => r.key);

							const newRestrictions: Record<string, boolean> = {};
							DIETARY_RESTRICTIONS.forEach((restriction) => {
								newRestrictions[restriction.key] = selectedKeys.includes(
									restriction.key
								);
							});
							setDietaryRestrictions(newRestrictions);
						}}
						placeholder="Sélectionner vos restrictions"
						searchPlaceholder="Rechercher une restriction..."
					/>

					<MultiSelect
						label="Catégories préférées"
						options={PREFERRED_CATEGORIES}
						selectedValues={preferredCategories}
						onSelectionChange={setPreferredCategories}
						placeholder="Sélectionner vos catégories préférées"
						searchPlaceholder="Rechercher une catégorie..."
					/>

					<MultiSelect
						label="Catégories à éviter"
						options={EXCLUDED_CATEGORIES}
						selectedValues={excludedCategories}
						onSelectionChange={setExcludedCategories}
						placeholder="Sélectionner les catégories à éviter"
						searchPlaceholder="Rechercher une catégorie..."
					/>

					<Button onPress={updateProfile} disabled={loading} className="w-full">
						{loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
					</Button>
				</View>

				<View className="gap-6">
					<Text className="text-xl font-semibold text-gray-700">Sécurité</Text>

					{!showPasswordChange ? (
						<Button
							variant="outline"
							onPress={() => setShowPasswordChange(true)}
							className="w-full"
						>
							Changer de mot de passe
						</Button>
					) : (
						<View className="gap-4 p-4 border border-gray-200 rounded-lg">
							<Text className="text-lg font-medium">
								Changer de mot de passe
							</Text>

							<View className="gap-3">
								<Label>Mot de passe actuel *</Label>
								<Input
									value={currentPassword}
									onChangeText={setCurrentPassword}
									secureTextEntry
									placeholder="Votre mot de passe actuel"
								/>
							</View>

							<View className="gap-3">
								<Label>Nouveau mot de passe *</Label>
								<Input
									value={newPassword}
									onChangeText={setNewPassword}
									secureTextEntry
									placeholder="Nouveau mot de passe (min. 8 caractères)"
								/>
							</View>

							<View className="gap-3">
								<Label>Confirmer le nouveau mot de passe *</Label>
								<Input
									value={confirmPassword}
									onChangeText={setConfirmPassword}
									secureTextEntry
									placeholder="Confirmez le nouveau mot de passe"
								/>
							</View>

							<View className="flex-row gap-3">
								<Button
									variant="outline"
									onPress={() => {
										setShowPasswordChange(false);
										setCurrentPassword('');
										setNewPassword('');
										setConfirmPassword('');
									}}
									className="flex-1"
								>
									Annuler
								</Button>
								<Button
									onPress={changePassword}
									disabled={passwordLoading}
									className="flex-1"
								>
									{passwordLoading ? 'Changement...' : 'Changer'}
								</Button>
							</View>
						</View>
					)}

					<Button
						variant="destructive"
						onPress={handleDisconnect}
						className="w-full"
					>
						Se déconnecter
					</Button>
				</View>
			</View>
		</ScrollView>
	);
}
