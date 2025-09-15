import { Button } from '@/components/ui/button';
import { TopNav } from '@/components/TopNav';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import { useHousehold } from '@/context/HouseholdContext';
import {
	deleteHousehold,
	listMembers,
	removeMember,
	generateInviteCode,
} from '@/services/household';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, TouchableOpacity, View, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export default function ManageHouseholds() {
	const router = useRouter();
	const { user } = useAuth();
	const {
		households,
		currentHouseholdId,
		setCurrentHousehold,
		refreshHouseholds,
	} = useHousehold();
	const [busy, setBusy] = useState<string | null>(null);
	const [invitingId, setInvitingId] = useState<string | null>(null);

	const handleLeaveOrDelete = async (householdId: string) => {
		try {
			setBusy(householdId);
			const members = await listMembers(householdId);
			if (members.length <= 1) {
				await deleteHousehold(householdId);
			} else {
				const myMember = members.find((m) => m.userId === user?.id);
				if (!myMember) throw new Error('Membre introuvable');
				await removeMember(householdId, myMember.id);
			}
			await refreshHouseholds();
		} catch (e: any) {
			Alert.alert('Action échouée', e?.message || "Impossible d'effectuer l'action");
		} finally {
			setBusy(null);
		}
	};

	const handleInvite = async (householdId: string) => {
		try {
			setInvitingId(householdId);
			const { inviteCode } = await generateInviteCode(householdId);
			if (!inviteCode) throw new Error("Code d'invitation non disponible");

			// Always copy to clipboard
			await Clipboard.setStringAsync(inviteCode);

			if (Platform.OS === 'web') {
				// Fallback to browser alert which reliably shows on web
				if (typeof window !== 'undefined') {
					window.alert(
						`Code d'invitation: ${inviteCode}\n\nLe code a été copié dans le presse-papiers.`
					);
				}
			} else {
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
			}
		} catch (e: any) {
			Alert.alert('Erreur', e?.message || "Impossible de générer un code d'invitation");
		} finally {
			setInvitingId(null);
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
								<Text className="text-gray-500 text-sm">{({
									family: 'Famille',
									couple: 'Couple',
									colocation: 'Colocation',
									single: 'Personne seule',
								} as Record<string, string>)[item.type] || item.type}</Text>
							</View>
							{currentHouseholdId === item.id ? (
								<Text className="text-green-600 font-medium">Actif</Text>
							) : (
								<TouchableOpacity onPress={() => setCurrentHousehold(item.id)}>
									<Text className="text-blue-600">Activer</Text>
								</TouchableOpacity>
							)}
						</View>


						<View className="flex-row gap-3 mt-3">
							<Button
								variant="outline"
								onPress={() => router.push(`/households/settings?id=${item.id}`)}
							>
								Paramètres
							</Button>
							{item.type !== 'single' && (
								<Button
									variant="outline"
									disabled={invitingId === item.id}
									onPress={() => handleInvite(item.id)}
								>
									Inviter
								</Button>
							)}
							<Button
								variant="destructive"
								disabled={busy === item.id}
								onPress={() => handleLeaveOrDelete(item.id)}
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
