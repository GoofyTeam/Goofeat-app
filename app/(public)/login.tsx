import { AuthTemplate } from '@/components/AuthTemplate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

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
        Alert.alert('Success', 'Logged in successfully');
        router.replace('/');
		} catch (err: any) {
			Alert.alert('Error', err.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

    return (
        <AuthTemplate
            title="Welcome back"
            description="Login with your Apple or Google account"
            showSocial
            noticeText={params?.notice === 'verify' ? 'Please verify your email to activate your account.' : undefined}
        >
            <View className="grid gap-6">
                <View className="grid gap-3">
                    <Label>Email</Label>
                    <Input keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="m@example.com" />
                    {email.length > 0 && !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email) ? (
                        <Text className="text-destructive text-xs">Enter a valid email address</Text>
                    ) : null}
                </View>
                <View className="grid gap-3">
                    <View className="flex-row items-center">
                        <Label>Password</Label>
                        <Link href="/forgot-password" asChild>
                            <Text className="ml-auto text-sm underline-offset-4">Forgot your password?</Text>
                        </Link>
                    </View>
                    <Input secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />
                </View>
                <Button className="w-full" disabled={loading || !isValid} onPress={handleLogin}>Login</Button>
                <Text className="text-center text-sm">
                    Don’t have an account?{' '}
                    <Link href="/register" asChild>
                        <Text className="underline underline-offset-4">Sign up</Text>
                    </Link>
                </Text>
            </View>
        </AuthTemplate>
    );
}
