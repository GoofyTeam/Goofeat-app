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
import { SectionList, View } from 'react-native';

interface UnitSelectProps {
  value: UnitType | '';
  onValueChange: (value: UnitType) => void;
  placeholder?: string;
}

type UnitSectionItem = {
	value: UnitType;
	label: string;
};

type UnitSection = {
	title: string;
	data: UnitSectionItem[];
};

export default function UnitSelect({
	value,
	onValueChange,
	placeholder = 'Sélectionner une unité',
}: UnitSelectProps) {
	const selectedOption = useMemo(
		() => (value ? { value, label: UnitLabels[value] } : undefined),
		[value]
	);

	const unitSections = useMemo<UnitSection[]>(
		() =>
			[
				{
					title: 'Masse',
					data: UnitGroups.Mass.map((unit) => ({
						value: unit,
						label: UnitLabels[unit],
					})),
				},
				{
					title: 'Volume',
					data: UnitGroups.Volume.map((unit) => ({
						value: unit,
						label: UnitLabels[unit],
					})),
				},
				{
					title: 'Pièces',
					data: UnitGroups.Piece.map((unit) => ({
						value: unit,
						label: UnitLabels[unit],
					})),
				},
			].filter((section) => section.data.length > 0),
		[]
	);

	const lastSectionTitle = unitSections[unitSections.length - 1]?.title;

	const estimatedListHeight = useMemo(() => {
		const ITEM_HEIGHT = 48;
		const SECTION_HEADER_HEIGHT = 40;
		const SECTION_FOOTER_SPACING = 16;
		const totalItems = unitSections.reduce(
			(acc, section) => acc + section.data.length,
			0
		);
		const totalHeaderHeight = unitSections.length * SECTION_HEADER_HEIGHT;
		const totalFooterSpacing = Math.max(unitSections.length - 1, 0) * SECTION_FOOTER_SPACING;
		const rawHeight = totalItems * ITEM_HEIGHT + totalHeaderHeight + totalFooterSpacing;
		const fallbackHeight = ITEM_HEIGHT + SECTION_HEADER_HEIGHT;
		return Math.min(rawHeight || fallbackHeight, 320);
	}, [unitSections]);

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
					<SectionList<UnitSectionItem, UnitSection>
						sections={unitSections}
						keyExtractor={(item) => item.value}
						renderSectionHeader={({ section }) => (
							<View className='px-3 pt-2 pb-2'>
								<Text className='mb-2 text-sm font-semibold text-gray-600'>
									{section.title}
								</Text>
							</View>
						)}
						renderItem={({ item }) => (
							<View className='px-3'>
								<SelectItem value={item.value} label={item.label} />
							</View>
						)}
						renderSectionFooter={({ section }) =>
							section.title === lastSectionTitle ? (
								<View className='pb-2' />
							) : (
								<View className='py-2' />
							)
						}
						style={{ height: estimatedListHeight }}
						contentContainerStyle={{ paddingBottom: 4 }}
						keyboardShouldPersistTaps='handled'
						nestedScrollEnabled
						onStartShouldSetResponderCapture={() => true}
						onMoveShouldSetResponderCapture={() => true}
						onResponderTerminationRequest={() => false}
						showsVerticalScrollIndicator={false}
						stickySectionHeadersEnabled={false}
					/>
				</SelectContent>
			</Select>
		</View>
	);
}
