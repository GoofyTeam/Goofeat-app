import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { UnitGroups, UnitLabels, UnitType } from '@/constants/Units';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

interface UnitSelectProps {
  value: UnitType | '';
  onValueChange: (value: UnitType) => void;
  placeholder?: string;
}

export default function UnitSelect({
	value,
	onValueChange,
	placeholder = 'Sélectionner une unité',
}: UnitSelectProps) {
	const selectedOption = useMemo(
		() => (value ? { value, label: UnitLabels[value] } : undefined),
		[value]
	);

	const handleValueChange = (option: any) => {
		if (option?.value) {
			onValueChange(option.value);
		}
	};

	return (
		<View>
			<Select value={selectedOption} onValueChange={handleValueChange}>
				<SelectTrigger className='w-full'>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent className='z-50 bg-white max-h-80'>
					<ScrollView
						style={{ maxHeight: 320 }}
						contentContainerStyle={{ paddingVertical: 4 }}
						keyboardShouldPersistTaps='handled'
						nestedScrollEnabled
						onStartShouldSetResponderCapture={() => true}
						onMoveShouldSetResponderCapture={() => true}
						onResponderTerminationRequest={() => false}
						showsVerticalScrollIndicator={false}
					>
						{/* Groupe Masse */}
						<View className='px-3 py-2'>
							<Text className='text-sm font-semibold text-gray-600 mb-2'>
								Masse
							</Text>
							{UnitGroups.Mass.map((unit) => (
								<SelectItem key={unit} value={unit} label={UnitLabels[unit]} />
							))}
						</View>

						{/* Groupe Volume */}
						<View className='px-3 py-2'>
							<Text className='text-sm font-semibold text-gray-600 mb-2'>
								Volume
							</Text>
							{UnitGroups.Volume.map((unit) => (
								<SelectItem key={unit} value={unit} label={UnitLabels[unit]} />
							))}
						</View>

						{/* Groupe Pièces */}
						<View className='px-3 py-2'>
							<Text className='text-sm font-semibold text-gray-600 mb-2'>
								Pièces
							</Text>
							{UnitGroups.Piece.map((unit) => (
								<SelectItem key={unit} value={unit} label={UnitLabels[unit]} />
							))}
						</View>
					</ScrollView>
				</SelectContent>
			</Select>
		</View>
	);
}
