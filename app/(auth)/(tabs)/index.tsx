import ManualFormComponent from '@/components/ManualFormComponent';
import ScannerComponent from '@/components/ScannerComponent';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TopNav } from '@/components/TopNav';
import { useState } from 'react';
import { View } from 'react-native';

export default function HomeScreen() {
	const [isManualMode, setIsManualMode] = useState(false);

	return (
		<View className="flex-1 p-6 gap-6">
			<View>
				<TopNav />
				<Text className="text-3xl font-bold">
					{isManualMode ? 'Ajouter un article' : 'Scanner un article'}
				</Text>
			</View>

			<View className="gap-6">
				<View className="flex-row gap-3">
					<Button
						variant={!isManualMode ? 'default' : 'outline'}
						onPress={() => setIsManualMode(false)}
						className="flex-1"
					>
						Scanner
					</Button>
					<Button
						variant={isManualMode ? 'default' : 'outline'}
						onPress={() => setIsManualMode(true)}
						className="flex-1"
					>
						Saisie manuelle
					</Button>
				</View>

				{isManualMode ? <ManualFormComponent /> : <ScannerComponent />}
			</View>
		</View>
	);
}
