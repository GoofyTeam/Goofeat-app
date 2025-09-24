import { AuthTemplate } from '@/components/AuthTemplate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { resetPassword } from '@/services/auth';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

export default function ResetPasswordScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ token?: string }>();
	const [token, setToken] = useState(params.token || '');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isValid = useMemo(() => {
		const hasToken = (params.token || token).trim().length > 0;
		const strongEnough = password.length >= 8;
		const matches = password === confirmPassword;
		return hasToken && strongEnough && matches;
	}, [params.token, token, password, confirmPassword]);

	const onSubmit = async () => {
		if (!isValid) {
			setError('Veuillez remplir correctement tous les champs.');
			return;
		}
		setLoading(true);
		try {
			await resetPassword(token, password);
			const successMsg = 'Mot de passe mis à jour';
			Alert.alert('Succès', successMsg);
			router.replace('/login');
		} catch (e: any) {
			setError(e?.message || 'Échec de la réinitialisation du mot de passe');
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthTemplate
			title="Réinitialiser le mot de passe"
			description="Saisissez votre nouveau mot de passe ci‑dessous"
		>
			<View className="grid gap-6">
				{!params.token && (
					<View className="grid gap-3">
						<Label>Jeton</Label>
						<Input
							autoCapitalize="none"
							value={token}
							onChangeText={setToken}
						/>
					</View>
				)}
				<View className="grid gap-3">
					<Label>Nouveau mot de passe</Label>
					<Input
						secureTextEntry
						autoCapitalize="none"
						value={password}
						onChangeText={setPassword}
					/>
					{password.length > 0 && password.length < 8 ? (
						<Text className="text-destructive text-xs">
							Le mot de passe doit contenir au moins 8 caractères
						</Text>
					) : null}
				</View>
				<View className="grid gap-3">
					<Label>Confirmez le nouveau mot de passe</Label>
					<Input
						secureTextEntry
						autoCapitalize="none"
						value={confirmPassword}
						onChangeText={setConfirmPassword}
					/>
					{confirmPassword.length > 0 && confirmPassword !== password ? (
						<Text className="text-destructive text-xs">
							Les mots de passe ne correspondent pas
						</Text>
					) : null}
				</View>
				{error ? (
					<Text className="text-destructive text-sm">{error}</Text>
				) : null}
				<Button
					className="w-full"
					disabled={loading || !isValid}
					onPress={onSubmit}
				>
					Réinitialiser le mot de passe
				</Button>
				{!params.token && (
					<Text className="text-center text-sm">
						Vous n’avez pas de jeton ?{' '}
						<Link href="/forgot-password" asChild>
							<Text className="underline underline-offset-4">
								Demander un lien de réinitialisation
							</Text>
						</Link>
					</Text>
				)}
			</View>
		</AuthTemplate>
	);
}
