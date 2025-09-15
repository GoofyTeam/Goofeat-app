import { AuthTemplate } from '@/components/AuthTemplate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { forgotPassword } from '@/services/auth';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, View, Platform } from 'react-native';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    return emailPattern.test(email.trim());
  }, [email]);

	const onSubmit = async () => {
		setLoading(true);
		try {
			await forgotPassword(email);
			if (Platform.OS === 'web' && typeof window !== 'undefined') {
				window.alert('E-mail envoyé. Veuillez vérifier votre boîte de réception pour le lien de réinitialisation du mot de passe.');
			} else {
				Alert.alert('E-mail envoyé', 'Veuillez vérifier votre boîte de réception pour le lien de réinitialisation du mot de passe.');
			}
			router.push('/login');
		} catch (e: any) {
			const message = e?.message || "Échec de l'envoi de l'e-mail";
			if (Platform.OS === 'web' && typeof window !== 'undefined') window.alert(message);
			else Alert.alert('Erreur', message);
		} finally {
			setLoading(false);
		}
	};

  return (
    <AuthTemplate title="Mot de passe oublié" description="Nous vous enverrons un lien de réinitialisation par e-mail">
      <View className="grid gap-6">
        <View className="grid gap-3">
          <Label>E-mail</Label>
          <Input keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="exemple@domaine.com" />
          {email.length > 0 && !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email) ? (
            <Text className="text-destructive text-xs">Veuillez saisir une adresse e‑mail valide</Text>
          ) : null}
        </View>
        <Button className="w-full" disabled={loading || !isValid} onPress={onSubmit}>Envoyer le lien de réinitialisation</Button>
        <Text className="text-center text-sm">
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link href="/login" asChild>
            <Text className="underline underline-offset-4">Retour à la connexion</Text>
          </Link>
        </Text>
      </View>
    </AuthTemplate>
  );
}
