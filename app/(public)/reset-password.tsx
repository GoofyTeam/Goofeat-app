import { AuthTemplate } from '@/components/AuthTemplate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { resetPassword } from '@/services/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
      setError('Please fill all fields correctly.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      Alert.alert('Success', 'Password updated');
      router.replace('/login');
    } catch (e: any) {
      setError(e?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthTemplate title="Reset password" description="Enter your new password below">
      <View className="grid gap-6">
        {!params.token && (
          <View className="grid gap-3">
            <Label>Token</Label>
            <Input autoCapitalize="none" value={token} onChangeText={setToken} />
          </View>
        )}
        <View className="grid gap-3">
          <Label>New password</Label>
          <Input secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />
          {password.length > 0 && password.length < 8 ? (
            <Text className="text-destructive text-xs">Password must be at least 8 characters</Text>
          ) : null}
        </View>
        <View className="grid gap-3">
          <Label>Confirm new password</Label>
          <Input secureTextEntry autoCapitalize="none" value={confirmPassword} onChangeText={setConfirmPassword} />
          {confirmPassword.length > 0 && confirmPassword !== password ? (
            <Text className="text-destructive text-xs">Passwords do not match</Text>
          ) : null}
        </View>
        {error ? <Text className="text-destructive text-sm">{error}</Text> : null}
        <Button className="w-full" disabled={loading || !isValid} onPress={onSubmit}>Reset password</Button>
        {!params.token && (
          <Text className="text-center text-sm">
            Don’t have a token?{' '}
            <Button variant="link" onPress={() => router.push('/forgot-password')}>Request a reset link</Button>
          </Text>
        )}
      </View>
    </AuthTemplate>
  );
}
 
