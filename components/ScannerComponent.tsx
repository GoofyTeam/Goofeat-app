import { Button } from '@/components/ui/button';
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
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface ScannerComponentProps {
  onSuccess?: () => void;
}

export default function ScannerComponent({ onSuccess }: ScannerComponentProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const { addIngredient } = useIngredientContext();
  const { token } = useAuth();
  const { currentHouseholdId } = useHousehold();
  const isFocused = useIsFocused();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View className='p-6 items-center gap-4'>
        <Text className='text-center'>
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
      const data = await getProductByBarcode(code);

      Alert.alert(
        'Ajouter au stock',
        data.name,
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Ajouter',
            onPress: async () => {
              try {
                // Créer le stock via l'API
                const stockData = {
                  productId: data.id || data.productId,
                  categoryId: data.categoryId,
                  quantity: 1,
                  unit: data.unit || 'unit',
                  dlc: data.dlc,
                  householdId: currentHouseholdId,
                };

                await createStock(stockData, token);

                // Aussi ajouter au contexte local pour l'affichage immédiat
                addIngredient(data);

                Alert.alert('Succès', 'Article ajouté au stock avec succès !');
                onSuccess?.();
              } catch (error) {
                console.error("Erreur lors de l'ajout au stock:", error);
                Alert.alert(
                  'Erreur',
                  "Impossible d'ajouter l'article au stock"
                );
              }
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error sending barcode:', error);
      Alert.alert(
        'Erreur',
        'Impossible de récupérer les informations du produit'
      );
    }

    // Reset scanning after a few seconds (optional)
    setTimeout(() => setScanned(false), 3000);
  }

  return (
    <View className='flex-1 gap-4'>
      {/* Fixed aspect ratio container helps Android render the preview reliably */}
      <View className='w-full rounded-xl overflow-hidden bg-black/10' style={{ aspectRatio: 3 / 4 }}>
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
          <View className='flex-1 items-center justify-center bg-black/20'>
            <Text className='text-gray-500'>Scanner inactif</Text>
          </View>
        )}
      </View>
      <Button onPress={toggleCameraFacing}>Tourner la caméra</Button>
    </View>
  );
}
