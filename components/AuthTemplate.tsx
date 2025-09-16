import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

type AuthTemplateProps = {
	title: string;
	description?: string;
	children: React.ReactNode;
	noticeText?: string;
	displayDisclaimer?: boolean;
};

export function AuthTemplate({
	title,
	description,
	children,
	noticeText,
	displayDisclaimer,
}: AuthTemplateProps) {
	return (
		<View className="bg-muted flex-1 flex flex-col items-center justify-center gap-6 p-6 md:p-10">
			<View className="flex w-full max-w-sm flex-col gap-6">
				{noticeText ? (
					<View className="border border-amber-300 bg-amber-50 rounded-md p-3">
						<Text className="text-amber-800">{noticeText}</Text>
					</View>
				) : null}

				<Card className="border-gray-400">
					<CardHeader className="text-center">
						<CardTitle className="text-xl">{title}</CardTitle>
						{description ? (
							<CardDescription className="text-gray-500">
								{description}
							</CardDescription>
						) : null}
					</CardHeader>
					<CardContent>
						<View className="flex flex-col gap-6">
							{children}
						</View>
					</CardContent>
				</Card>

                {displayDisclaimer && (
                    <Text className="text-gray-500 text-center text-xs text-balance">
                        En cliquant sur Continuer, vous acceptez nos Conditions d’utilisation et notre Politique de confidentialité.
                    </Text>
                )}
			</View>
		</View>
	);
}
