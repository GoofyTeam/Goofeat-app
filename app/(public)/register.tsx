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
			Alert.alert('Invalid form', 'Please fill all fields correctly.');
			return;
		}
		setLoading(true);
		try {
			await register({ firstName, lastName, email, password });
			Alert.alert('Success', 'Account created. Please verify your email.');
			// Redirect to login with a notice to verify email
			router.replace('/login?notice=verify');
		} catch (e: any) {
			Alert.alert('Error', e.message || 'Registration failed');
		} finally {
			setLoading(false);
		}
	};

    return (
        <AuthTemplate
            title="Create an account"
            description="Register with your Apple or Google account"
            showSocial
            displayDisclaimer
        >
            <View className="grid gap-6">
                <View className="grid gap-3">
                    <Label>First name</Label>
                    <Input value={firstName} onChangeText={setFirstName} />
                </View>
                <View className="grid gap-3">
                    <Label>Last name</Label>
                    <Input value={lastName} onChangeText={setLastName} />
                </View>
                <View className="grid gap-3">
                    <Label>Email</Label>
                    <Input keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholder="m@example.com" />
                    {email.length > 0 && !/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email) ? (
                      <Text className="text-destructive text-xs">Enter a valid email address</Text>
                    ) : null}
                </View>
                <View className="grid gap-3">
                    <Label>Password</Label>
                    <Input secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />
                    {password.length > 0 && password.length < 8 ? (
                      <Text className="text-destructive text-xs">Password must be at least 8 characters</Text>
                    ) : null}
                </View>
                <View className="grid gap-3">
                    <Label>Confirm password</Label>
                    <Input secureTextEntry autoCapitalize="none" value={confirmPassword} onChangeText={setConfirmPassword} />
                    {confirmPassword.length > 0 && confirmPassword !== password ? (
                      <Text className="text-destructive text-xs">Passwords do not match</Text>
                    ) : null}
                </View>
                
                <Button className="w-full" disabled={loading || !isValid} onPress={handleRegister}>Create account</Button>
                <Text className="text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" asChild>
                        <Text className="underline underline-offset-4">Log in</Text>
                    </Link>
                </Text>
            </View>
        </AuthTemplate>
    );
}
