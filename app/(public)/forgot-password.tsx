import { AuthTemplate } from '@/components/AuthTemplate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { forgotPassword } from '@/services/auth';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
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
			Alert.alert('Email sent', 'Check your inbox for reset instructions');
			router.push('/login');
		} catch (e: any) {
			Alert.alert('Error', e?.message || 'Failed to send email');
		} finally {
			setLoading(false);
		}
	};

  return (
    <AuthTemplate title="Forgot password" description="We’ll send you a reset link to your email">
      <View className="grid gap-6">
        <View className="grid gap-3">
          <Label>Email</Label>
          <Input keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="m@example.com" />
          {email.length > 0 && !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email) ? (
            <Text className="text-destructive text-xs">Enter a valid email address</Text>
          ) : null}
        </View>
        <Button className="w-full" disabled={loading || !isValid} onPress={onSubmit}>Send reset link</Button>
        <Text className="text-center text-sm">
          Remembered your password?{' '}
          <Link href="/login" asChild>
            <Text className="underline underline-offset-4">Back to login</Text>
          </Link>
        </Text>
      </View>
    </AuthTemplate>
  );
}
