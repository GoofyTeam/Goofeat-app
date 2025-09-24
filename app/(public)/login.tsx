import { AuthTemplate } from '@/components/AuthTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, View } from 'react-native';

export default function LoginScreen() {
	const router = useRouter();
	const { login } = useAuth();
	const params = useLocalSearchParams<{
		notice?: string;
	}>();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const isValid = useMemo(() => {
        const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
        return emailPattern.test(email.trim()) && password.length > 0;
    }, [email, password]);

	const handleLogin = async () => {
		setLoading(true);
    try {
        await login({ email, password });
        router.replace('/');
		} catch (err: any) {
			const message = err?.message || 'Échec de la connexion';
			if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert(message);
			else Alert.alert('Erreur', message);
		} finally {
			setLoading(false);
		}
	};

    return (
        <AuthTemplate
            title="Content de vous revoir"
            description="Connectez-vous avec votre e‑mail et votre mot de passe"
            noticeText={params?.notice === 'verify' ? 'Veuillez vérifier votre e‑mail pour activer votre compte.' : undefined}
        >
            <View className="grid gap-6">
                <View className="grid gap-3">
                    <Label>E‑mail</Label>
                    <Input testID="email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="exemple@domaine.com" />
                    {email.length > 0 && !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email) ? (
                        <Text className="text-destructive text-xs">Veuillez saisir une adresse e‑mail valide</Text>
                    ) : null}
                </View>
                <View className="grid gap-3">
                    <View className="flex-row items-center">
                        <Label>Mot de passe</Label>
                        <Link href="/forgot-password" asChild>
                            <Text className="ml-auto text-sm underline-offset-4">Mot de passe oublié ?</Text>
                        </Link>
                    </View>
                    <Input testID="password" secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />
                </View>
                <Button className="w-full" disabled={loading || !isValid} onPress={handleLogin}>Se connecter</Button>
                <Text className="text-center text-sm">
                    Pas encore de compte ?{' '}
                    <Link href="/register" asChild>
                        <Text className="underline underline-offset-4">Créer un compte</Text>
                    </Link>
                </Text>
            </View>
        </AuthTemplate>
    );
}
