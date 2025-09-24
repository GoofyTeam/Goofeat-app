import { AuthTemplate } from '@/components/AuthTemplate';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { verifyEmail } from '@/services/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function VerifyEmailScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{ token?: string }>();
	const [status, setStatus] = useState<
		'idle' | 'pending' | 'success' | 'error'
	>('idle');
	const [message, setMessage] = useState<string>('');

	useEffect(() => {
		const run = async () => {
			if (!params.token) return;
			setStatus('pending');
			try {
				const res = await verifyEmail(params.token);
				setMessage(res?.message || 'Adresse e‑mail vérifiée');
				setStatus('success');
			} catch (e: any) {
				setMessage(e?.message || 'Échec de la vérification');
				setStatus('error');
			}
		};
		run();
	}, [params.token]);

	return (
		<AuthTemplate
			title="Vérifier l’e‑mail"
			description="Confirmation de votre adresse e‑mail…"
		>
			<Text className="text-center">
				{status === 'pending' ? 'Vérification en cours…' : message}
			</Text>
			<Button className="w-full" onPress={() => router.replace('/login')}>
				Aller à la connexion
			</Button>
		</AuthTemplate>
	);
}
