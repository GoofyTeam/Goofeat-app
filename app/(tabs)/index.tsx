import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useIngredientContext } from '@/context/IngredientContext';
import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, View } from 'react-native';

export default function HomeScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const {
    addIngredient,
  } = useIngredientContext();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View>
        <Text>Nous avons besoin de votre permission pour montrer la caméra</Text>
        <Button onPress={requestPermission}>Donner les permissions</Button>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (scanned) return;
    setScanned(true);

    const code = result?.data;
    const apiURL = "http://192.168.21.17:3000/product/barcode";
    try {
      const response = await fetch(`${apiURL}/${code}`, {
        method: 'GET',
      });

      const data = await response.json();

      Alert.alert(
        "Ajouter au stock",
        data.name, 
        [
          {
            text: "Annuler",
            style: "cancel"
          },
          {
            text: "Ajouter",
            onPress: () => {
              addIngredient(data);
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error sending barcode:', error);
    }

    // Reset scanning after a few seconds (optional)
    setTimeout(() => setScanned(false), 3000);
  }

  return (
    <View style={{ flex: 1, padding: 24, rowGap: 24 }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold' }}>Scanner un article</Text>
      <CameraView
        facing={facing}
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'upc_a', 'ean8', 'upc_e'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <Button onPress={toggleCameraFacing}>Tourner la caméra</Button>
    </View>
  );
}
