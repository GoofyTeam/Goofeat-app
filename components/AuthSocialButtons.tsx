import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { openOAuth } from '@/services/auth';

export function AuthSocialButtons({
	className,
	buttonClassName,
}: {
	className?: string;
	buttonClassName?: string;
}) {
	const onGoogle = async () => {
		await openOAuth('google');
	};

	// const onApple = async () => {
	// 	await openOAuth('apple');
	// };

	return (
    <View className={className} style={{ gap: 8 }}>
      {/* <Button className={buttonClassName} variant="outline" onPress={onApple}>
        <View className="flex-row items-center gap-2">
          <Ionicons name="logo-apple" size={18} />
          <Text>Continue with Apple</Text>
        </View>
      </Button> */}
      <Button className={buttonClassName} variant="outline" onPress={onGoogle}>
        <View className="flex-row items-center gap-2">
          <Ionicons name="logo-google" size={18} />
          <Text>Continue with Google</Text>
        </View>
      </Button>
    </View>
	);
}
