import { AuthTemplate } from '@/components/AuthTemplate';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { verifyEmail } from '@/services/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      if (!params.token) return;
      setStatus('pending');
      try {
        const res = await verifyEmail(params.token);
        setMessage(res?.message || 'Email verified');
        setStatus('success');
      } catch (e: any) {
        setMessage(e?.message || 'Verification failed');
        setStatus('error');
      }
    };
    run();
  }, [params.token]);

  return (
    <AuthTemplate title="Verify email" description="Confirming your email address…">
      <Text className="text-center">{status === 'pending' ? 'Verifying…' : message}</Text>
      <Button className="w-full" onPress={() => router.replace('/login')}>Go to login</Button>
    </AuthTemplate>
  );
}
 
