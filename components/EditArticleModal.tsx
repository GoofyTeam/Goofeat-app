import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UnitSelect from '@/components/UnitSelect';
import { UnitType } from '@/constants/Units';
import { useAuth } from '@/context/AuthContext';
import { useHousehold } from '@/context/HouseholdContext';
import { Article } from '@/hooks/useArticles';
import { StockData, updateStock } from '@/services/stock';
import {
	formatDateForApi,
	formatDateForDisplay,
	isBeforeToday,
	parseDisplayDate,
	startOfToday,
	toDateOnly,
} from '@/lib/date';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import DateTimePicker, {
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

interface EditArticleModalProps {
	article: Article | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export default function EditArticleModal({
	article,
	isOpen,
	onClose,
	onSuccess,
}: EditArticleModalProps) {
	const { token } = useAuth();
	const { currentHouseholdId } = useHousehold();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		quantity: '',
		unit: '' as UnitType | '',
		dlc: '',
		// categoryId: '',
	});
	const [showDatePicker, setShowDatePicker] = useState(false);
	const selectedDlcDate = useMemo(
		() => parseDisplayDate(formData.dlc),
		[formData.dlc]
	);

	const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
		if (Platform.OS === 'android') {
			setShowDatePicker(false);
		}

		if (event.type === 'dismissed') {
			return;
		}

		if (date) {
			const normalized = toDateOnly(date);
			if (isBeforeToday(normalized)) {
				Alert.alert(
					'Date invalide',
					"La date limite ne peut pas être antérieure à aujourd'hui"
				);
				setFormData((prev) => ({
					...prev,
					dlc: formatDateForDisplay(startOfToday()),
				}));
				return;
			}

			setFormData((prev) => ({
				...prev,
				dlc: formatDateForDisplay(normalized),
			}));
		}
	};

	const handleClearDate = () => {
		setFormData((prev) => ({ ...prev, dlc: '' }));
		setShowDatePicker(false);
	};

	// Réinitialiser le formulaire quand l'article change
	useEffect(() => {
		if (article) {
			const rawDlc = article.dlc ? article.dlc.split('T')[0] : '';
			let displayDlc = '';
			if (rawDlc) {
				const [year, month, day] = rawDlc.split('-');
				if (year && month && day) {
					displayDlc = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
				}
			}

			setFormData({
				quantity: article.quantity.toString(),
				unit: article.unit,
				dlc: displayDlc,
				// categoryId: '',
			});
			setShowDatePicker(false);
		}
	}, [article]);

	const handleSubmit = async () => {
		if (!article) return;

		// Validation
		if (!formData.quantity || !formData.unit) {
			Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
			return;
		}

		const quantity = parseFloat(formData.quantity);
		if (isNaN(quantity) || quantity <= 0) {
			Alert.alert('Erreur', 'La quantité doit être un nombre positif');
			return;
		}

		const trimmedDlc = formData.dlc.trim();
		let formattedDlc: string | undefined;

		if (trimmedDlc) {
			const parsedDlc = parseDisplayDate(trimmedDlc);
			if (!parsedDlc) {
				Alert.alert('Erreur', 'La date doit être au format JJ/MM/AAAA');
				return;
			}

			if (isBeforeToday(parsedDlc)) {
				Alert.alert(
					'Erreur',
					"La date limite ne peut pas être antérieure à aujourd'hui"
				);
				return;
			}

			formattedDlc = formatDateForApi(parsedDlc);
		}

		setLoading(true);

		try {
			const stockData: StockData = {
				quantity,
				unit: formData.unit,
				dlc: formattedDlc,
				// categoryId: formData.categoryId || undefined,
				householdId: currentHouseholdId,
			};

			await updateStock(article.id, stockData, token);

			Alert.alert('Succès', 'Article mis à jour avec succès');
			onSuccess();
			onClose();
		} catch (error) {
			console.error('Erreur lors de la mise à jour:', error);
			Alert.alert('Erreur', "Impossible de mettre à jour l'article");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (!loading) {
			onClose();
		}
	};

	if (!article) return null;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md bg-white">
				<DialogHeader>
					<DialogTitle>Modifier l&apos;article</DialogTitle>
					<DialogDescription>
						Modifiez les informations de &quot;{article.name}&quot;
					</DialogDescription>
				</DialogHeader>

				<View className="gap-4">
					{/* Quantité */}
					<View className="gap-2">
						<Label htmlFor="quantity">Quantité *</Label>
						<Input
							id="quantity"
							value={formData.quantity}
							onChangeText={(text) =>
								setFormData((prev) => ({ ...prev, quantity: text }))
							}
							placeholder="Entrez la quantité"
							keyboardType="numeric"
							editable={!loading}
						/>
					</View>

					{/* Unité */}
					<View className="gap-2">
						<Label htmlFor="unit">Unité *</Label>
						<UnitSelect
							value={formData.unit}
							onValueChange={(unit) =>
								setFormData((prev) => ({ ...prev, unit }))
							}
							placeholder="Sélectionner une unité"
						/>
					</View>

					{/* Catégorie */}
					{/* <View className="gap-2">
						<Label htmlFor="category">Catégorie</Label>
						<Select
							onValueChange={(option: any) => {
								if (option && option.value) {
									setFormData((prev) => ({
										...prev,
										categoryId: option.value,
									}));
								}
							}}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Sélectionner une catégorie">
									{formData.categoryId
										? CATEGORIES.find((c) => c.id === formData.categoryId)?.name
										: 'Sélectionner une catégorie'}
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="z-50 bg-white">
								{CATEGORIES.map((category) => (
									<SelectItem
										key={category.id}
										value={category.id}
										label={category.name}
									/>
								))}
							</SelectContent>
						</Select>
					</View> */}

					{/* DLC */}
					<View className="gap-2">
						<Label htmlFor="dlc">Date limite de consommation</Label>
						<Button
							variant="outline"
							onPress={() => setShowDatePicker((prev) => !prev)}
							disabled={loading}
						>
							{formData.dlc || 'Sélectionner une date'}
						</Button>
						{formData.dlc ? (
							<Button
								variant="outline"
								onPress={handleClearDate}
								disabled={loading}
							>
								Effacer la date
							</Button>
						) : null}
						{showDatePicker && (
							<DateTimePicker
								value={selectedDlcDate ?? startOfToday()}
								mode="date"
								display={Platform.OS === 'ios' ? 'spinner' : 'default'}
								onChange={handleDateChange}
								minimumDate={startOfToday()}
							/>
						)}
					</View>
				</View>

				<DialogFooter>
					<Button
						onPress={handleSubmit}
						disabled={loading || !formData.quantity || !formData.unit}
					>
						{loading ? 'Mise à jour...' : 'Mettre à jour'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
