import { AuthTemplate } from '@/components/AuthTemplate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import React, { useState, useMemo } from 'react';
import { Alert, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function Register() {
	const { register } = useAuth();
	const router = useRouter();
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const isValid = useMemo(() => {
		const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
		return (
			firstName.trim().length > 0 &&
			lastName.trim().length > 0 &&
			emailPattern.test(email.trim()) &&
			password.length >= 8 &&
			password === confirmPassword
		);
	}, [firstName, lastName, email, password, confirmPassword]);

	const handleRegister = async () => {
		if (!isValid) {
			const msg = 'Veuillez remplir correctement tous les champs.';
			Alert.alert('Formulaire invalide', msg);
			return;
		}
		setLoading(true);
		try {
			await register({ firstName, lastName, email, password });
			const successMsg = 'Compte créé. Veuillez vérifier votre e‑mail.';
			Alert.alert('Succès', successMsg);
			// Redirect to login with a notice to verify email
			router.replace('/login?notice=verify');
		} catch (e: any) {
			const message = e?.message || "Échec de l'inscription";
			Alert.alert('Erreur', message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthTemplate
			title="Créer un compte"
			description="Inscrivez-vous avec votre adresse e‑mail"
			displayDisclaimer
		>
			<View className="grid gap-6">
				<View className="grid gap-3">
					<Label>Prénom</Label>
					<Input value={firstName} onChangeText={setFirstName} />
				</View>
				<View className="grid gap-3">
					<Label>Nom</Label>
					<Input value={lastName} onChangeText={setLastName} />
				</View>
				<View className="grid gap-3">
					<Label>E‑mail</Label>
					<Input
						keyboardType="email-address"
						autoCapitalize="none"
						value={email}
						onChangeText={setEmail}
						placeholder="exemple@domaine.com"
					/>
					{email.length > 0 && !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email) ? (
						<Text className="text-destructive text-xs">
							Veuillez saisir une adresse e‑mail valide
						</Text>
					) : null}
				</View>
				<View className="grid gap-3">
					<Label>Mot de passe</Label>
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
					<Label>Confirmer le mot de passe</Label>
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

				<Button
					className="w-full"
					disabled={loading || !isValid}
					onPress={handleRegister}
				>
					Créer un compte
				</Button>
				<Text className="text-center text-sm">
					Vous avez déjà un compte ?{' '}
					<Link href="/login" asChild>
						<Text className="underline underline-offset-4">Se connecter</Text>
					</Link>
				</Text>
			</View>
		</AuthTemplate>
	);
}
