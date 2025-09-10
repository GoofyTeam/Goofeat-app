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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UnitSelect from '@/components/UnitSelect';
import { CATEGORIES } from '@/constants/Categories';
import { UnitType } from '@/constants/Units';
import { useAuth } from '@/context/AuthContext';
import { Article } from '@/hooks/useArticles';
import { StockData, updateStock } from '@/services/stock';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    unit: '' as UnitType | '',
    dlc: '',
    categoryId: '',
  });

  // Réinitialiser le formulaire quand l'article change
  useEffect(() => {
    if (article) {
      setFormData({
        quantity: article.quantity.toString(),
        unit: article.unit,
        dlc: article.dlc ? article.dlc.split('T')[0] : '', // Format YYYY-MM-DD pour input date
        categoryId: '', // Pas de catégorie stockée dans Article pour l'instant
      });
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

    setLoading(true);

    try {
      const stockData: StockData = {
        quantity,
        unit: formData.unit,
        dlc: formData.dlc || undefined,
        categoryId: formData.categoryId || undefined,
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
      <DialogContent className='sm:max-w-md bg-white'>
        <DialogHeader>
          <DialogTitle>Modifier l&apos;article</DialogTitle>
          <DialogDescription>
            Modifiez les informations de &quot;{article.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <View className='space-y-4'>
          {/* Quantité */}
          <View className='space-y-2'>
            <Label htmlFor='quantity'>Quantité *</Label>
            <Input
              id='quantity'
              value={formData.quantity}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, quantity: text }))
              }
              placeholder='Entrez la quantité'
              keyboardType='numeric'
              editable={!loading}
            />
          </View>

          {/* Unité */}
          <View className='space-y-2'>
            <Label htmlFor='unit'>Unité *</Label>
            <UnitSelect
              value={formData.unit}
              onValueChange={(unit) =>
                setFormData((prev) => ({ ...prev, unit }))
              }
              placeholder='Sélectionner une unité'
            />
          </View>

          {/* Catégorie */}
          <View className='space-y-2'>
            <Label htmlFor='category'>Catégorie</Label>
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
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Sélectionner une catégorie'>
                  {formData.categoryId
                    ? CATEGORIES.find((c) => c.id === formData.categoryId)?.name
                    : 'Sélectionner une catégorie'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className='z-50 bg-white'>
                {CATEGORIES.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    label={category.name}
                  />
                ))}
              </SelectContent>
            </Select>
          </View>

          {/* DLC */}
          <View className='space-y-2'>
            <Label htmlFor='dlc'>Date limite de consommation</Label>
            <Input
              id='dlc'
              value={formData.dlc}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, dlc: text }))
              }
              placeholder='YYYY-MM-DD'
              editable={!loading}
            />
            <Text className='text-xs text-gray-500'>
              Format: AAAA-MM-JJ (optionnel)
            </Text>
          </View>
        </View>

        <DialogFooter>
          <Button
            variant='outline'
            onPress={handleClose}
            disabled={loading}
            className='mr-2'
          >
            Annuler
          </Button>
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
