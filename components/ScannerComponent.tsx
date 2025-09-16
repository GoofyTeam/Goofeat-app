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
import { Text } from '@/components/ui/text';
import { useAuth } from '@/context/AuthContext';
import { useIngredientContext } from '@/context/IngredientContext';
import { createStock, getProductByBarcode } from '@/services/stock';
import { useHousehold } from '@/context/HouseholdContext';
import {
	BarcodeScanningResult,
	CameraType,
	CameraView,
	useCameraPermissions,
} from 'expo-camera';
import DateTimePicker, {
	DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
	formatDateForApi,
	formatDateForDisplay,
	isBeforeToday,
	startOfToday,
	toDateOnly,
} from '@/lib/date';

interface ScannerComponentProps {
	onSuccess?: () => void;
}

interface BarcodeProduct {
	id?: string;
	productId?: string;
	name: string;
	categoryId?: string;
	unit?: string;
	defaultUnit?: string;
	dlc?: string;
	[key: string]: any;
}

export default function ScannerComponent({ onSuccess }: ScannerComponentProps) {
	const [facing, setFacing] = useState<CameraType>('back');
	const [permission, requestPermission] = useCameraPermissions();
	const [scanned, setScanned] = useState(false);
	const [pendingProduct, setPendingProduct] = useState<BarcodeProduct | null>(
		null
	);
	const [modalVisible, setModalVisible] = useState(false);
	const [quantity, setQuantity] = useState('1');
	const [selectedDlc, setSelectedDlc] = useState<Date | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const { addIngredient } = useIngredientContext();
	const { token } = useAuth();
	const { currentHouseholdId } = useHousehold();
	const isFocused = useIsFocused();

	const sanitizeDlcDate = (date: Date) => {
		const normalized = toDateOnly(date);
		return isBeforeToday(normalized) ? startOfToday() : normalized;
	};

	const resetModalState = () => {
		setPendingProduct(null);
		setQuantity('1');
		setSelectedDlc(null);
		setShowDatePicker(false);
	};

	const closeModal = () => {
		setModalVisible(false);
		resetModalState();
		setScanned(false);
	};

	const handleModalOpenChange = (open: boolean) => {
		if (open) {
			setModalVisible(true);
			return;
		}

		closeModal();
	};

	const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
		if (Platform.OS === 'android') {
			setShowDatePicker(false);
		}

		if (event.type === 'dismissed') {
			return;
		}

		if (date) {
			const normalizedDate = toDateOnly(date);
			if (isBeforeToday(normalizedDate)) {
				Alert.alert(
					'Date invalide',
					"La date limite ne peut pas être antérieure à aujourd'hui"
				);
				setSelectedDlc(startOfToday());
				return;
			}

			setSelectedDlc(normalizedDate);
		}
	};

	const handleCancel = () => {
		if (isSubmitting) {
			return;
		}
		handleModalOpenChange(false);
	};

	const handleAddToStock = async () => {
		if (!pendingProduct) {
			return;
		}

		const quantityValue = parseFloat(quantity.replace(',', '.'));

		if (Number.isNaN(quantityValue) || quantityValue <= 0) {
			Alert.alert('Erreur', 'La quantité doit être un nombre positif');
			return;
		}

		setIsSubmitting(true);

		try {
			const stockData = {
				productId: pendingProduct.id || pendingProduct.productId,
				categoryId: pendingProduct.categoryId,
				quantity: quantityValue,
				unit: pendingProduct.unit || pendingProduct.defaultUnit || 'unit',
				dlc: formatDateForApi(selectedDlc),
				householdId: currentHouseholdId,
			};

			await createStock(stockData, token);

			addIngredient(pendingProduct as any);

			Alert.alert('Succès', 'Article ajouté au stock avec succès !');
			onSuccess?.();
			closeModal();
			return;
		} catch (error) {
			console.error("Erreur lors de l'ajout au stock:", error);
			Alert.alert('Erreur', "Impossible d'ajouter l'article au stock");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!permission) return <View />;

	if (!permission.granted) {
		return (
			<View className="p-6 items-center gap-4">
				<Text className="text-center">
					Nous avons besoin de votre permission pour montrer la caméra
				</Text>
				<Button onPress={requestPermission}>Donner les permissions</Button>
			</View>
		);
	}

	function toggleCameraFacing() {
		setFacing((current) => (current === 'back' ? 'front' : 'back'));
	}

	async function handleBarcodeScanned(result: BarcodeScanningResult) {
		if (scanned) return;
		setScanned(true);

		const code = result?.data;

		try {
			const data = (await getProductByBarcode(code)) as BarcodeProduct;

			const initialDlc = data.dlc ? new Date(data.dlc) : null;
			const parsedDlc =
				initialDlc && !Number.isNaN(initialDlc.getTime()) ? initialDlc : null;
			const sanitizedDlc = parsedDlc ? sanitizeDlcDate(parsedDlc) : null;

			setPendingProduct(data);
			setQuantity('1');
			setSelectedDlc(sanitizedDlc);
			setShowDatePicker(false);
			setModalVisible(true);
		} catch (error) {
			console.error('Error sending barcode:', error);
			Alert.alert(
				'Erreur',
				'Impossible de récupérer les informations du produit'
			);
			setScanned(false);
		}
	}

	const unitLabel = pendingProduct?.unit ?? pendingProduct?.defaultUnit;

	return (
		<View className="flex-1 gap-4">
			{/* Fixed aspect ratio container helps Android render the preview reliably */}
			<View
				className="w-full rounded-xl overflow-hidden bg-black/10"
				style={{ aspectRatio: 3 / 4 }}
			>
				{isFocused ? (
					<CameraView
						key={`camera-${facing}`}
						facing={facing}
						style={{ flex: 1 }}
						barcodeScannerSettings={{
							barcodeTypes: ['ean13', 'upc_a', 'ean8', 'upc_e', 'code128'],
						}}
						onBarcodeScanned={handleBarcodeScanned}
					/>
				) : (
					<View className="flex-1 items-center justify-center bg-black/20">
						<Text className="text-gray-500">Scanner inactif</Text>
					</View>
				)}
			</View>
			<Button onPress={toggleCameraFacing}>Tourner la caméra</Button>

			<Dialog open={modalVisible} onOpenChange={handleModalOpenChange}>
				<DialogContent className="sm:max-w-md bg-white">
					<DialogHeader>
						<DialogTitle>Ajouter au stock</DialogTitle>
						<DialogDescription>
							{pendingProduct?.name ?? 'Confirmez les informations du produit'}
						</DialogDescription>
					</DialogHeader>

					<View className="gap-4">
						<View className="gap-2">
							<Label htmlFor="quantity">Quantité *</Label>
							<Input
								id="quantity"
								value={quantity}
								onChangeText={setQuantity}
								keyboardType="numeric"
								placeholder="1"
								editable={!isSubmitting}
							/>
						</View>

						{unitLabel ? (
							<Text className="text-sm text-gray-500">Unité: {unitLabel}</Text>
						) : null}

						<View className="gap-2">
							<Label>Date limite de consommation</Label>
							<Button
								variant="outline"
								onPress={() => setShowDatePicker((prev) => !prev)}
								disabled={isSubmitting}
							>
								{selectedDlc
									? formatDateForDisplay(selectedDlc)
									: 'Sélectionner une date'}
							</Button>
							{selectedDlc ? (
								<Button
									variant="outline"
									onPress={() => setSelectedDlc(null)}
									disabled={isSubmitting}
								>
									Effacer la date
								</Button>
							) : null}
						</View>

						{showDatePicker && (
							<DateTimePicker
								value={selectedDlc ?? startOfToday()}
								mode="date"
								display={Platform.OS === 'ios' ? 'spinner' : 'default'}
								onChange={handleDateChange}
								minimumDate={startOfToday()}
							/>
						)}
					</View>

					<DialogFooter>
						<Button
							variant="outline"
							onPress={handleCancel}
							disabled={isSubmitting}
						>
							Annuler
						</Button>
						<Button onPress={handleAddToStock} disabled={isSubmitting}>
							{isSubmitting ? 'Ajout...' : 'Ajouter'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</View>
	);
}
