import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Text } from '@/components/ui/text';
import { useHouseholdManager } from '@/hooks/useHouseholdActions';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
	Alert,
	FlatList,
	TouchableOpacity,
	View,
	Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function ManageHouseholds() {
	const router = useRouter();
	const {
		households,
		busyHouseholdId,
		invitingHouseholdId,
		error,
		clearError,
		activateHousehold,
		leave,
		invite,
	} = useHouseholdManager();

	useEffect(() => {
		if (!error) return;
		Alert.alert('Erreur', error, [{ text: 'OK', onPress: clearError }]);
	}, [clearError, error]);

	const handleLeave = async (householdId: string) => {
		try {
			await leave(householdId);
		} catch (e: any) {
			Alert.alert(
				'Action échouée',
				e?.message || "Impossible d'effectuer l'action"
			);
			clearError();
		}
	};

	const handleInvite = async (householdId: string) => {
		try {
			const inviteCode = await invite(householdId);

			if (Platform.OS === 'web') {
				if (typeof window !== 'undefined') {
					window.alert(
						`Code d'invitation: ${inviteCode}\n\nLe code a été copié dans le presse-papiers.`
					);
				}
				return;
			}

			Alert.alert(
				"Code d'invitation",
				`Partagez ce code pour rejoindre le foyer: \n\n${inviteCode}`,
				[
					{
						text: 'Copier',
						onPress: async () => {
							await Clipboard.setStringAsync(inviteCode);
							Alert.alert('Copié', 'Code copié dans le presse-papiers');
						},
					},
					{ text: 'OK' },
				]
			);
		} catch (e: any) {
			Alert.alert(
				'Erreur',
				e?.message || "Impossible de générer un code d'invitation"
			);
			clearError();
		}
	};

	return (
		<View className="flex-1 p-6 gap-4">
			<TopNav />
			<Text className="text-3xl font-bold">Foyers</Text>

			<View className="flex-row gap-3">
				<Button
					className="flex-1"
					onPress={() => router.push('/households/create')}
				>
					Créer
				</Button>
				<Button
					variant="outline"
					className="flex-1"
					onPress={() => router.push('/households/join')}
				>
					Rejoindre
				</Button>
			</View>

			<FlatList
				data={households}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View className="p-4 border border-gray-200 rounded-lg mb-3 bg-white">
						<View className="flex-row justify-between items-center">
							<View className="flex-1">
								<Text className="text-lg font-semibold">{item.name}</Text>
								<Text className="text-gray-500 text-sm">{item.typeLabel}</Text>
							</View>
							{item.isActive ? (
								<Text className="text-green-600 font-medium">Actif</Text>
							) : (
								<TouchableOpacity onPress={() => activateHousehold(item.id)}>
									<Text className="text-blue-600">Activer</Text>
								</TouchableOpacity>
							)}
						</View>

						<View className="flex-row gap-3 mt-3">
							<Button
								variant="outline"
								onPress={() =>
									router.push(`/households/settings?id=${item.id}`)
								}
							>
								Paramètres
							</Button>
							{item.type !== 'single' && (
								<Button
									variant="outline"
									disabled={invitingHouseholdId === item.id}
									onPress={() => handleInvite(item.id)}
								>
									Inviter
								</Button>
							)}
							<Button
								variant="destructive"
								disabled={busyHouseholdId === item.id}
								onPress={() => handleLeave(item.id)}
							>
								Quitter
							</Button>
						</View>
					</View>
				)}
			/>
		</View>
	);
}
