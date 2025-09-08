import { UnitType } from '@/constants/Units';
import { useAuth } from '@/context/AuthContext';
import { useIngredientContext } from '@/context/IngredientContext';
import {
  createProduct,
  createStock,
  Ingredient,
  ProductData,
  searchIngredients,
  StockData,
} from '@/services/stock';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export interface ManualFormData {
  name: string;
  brand: string;
  quantity: string;
  unit: UnitType | '';
  dlc: string;
  selectedIngredientId: string;
}

export function useManualForm(onSuccess?: () => void) {
  const [manualForm, setManualForm] = useState<ManualFormData>({
    name: '',
    brand: '',
    quantity: '',
    unit: '',
    dlc: '',
    selectedIngredientId: '',
  });

  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const { addIngredient } = useIngredientContext();
  const { token } = useAuth();

  const searchIngredientsDebounced = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchIngredients(searchTerm, 10);
      setSearchResults(results);
      setShowDropdown(true);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleNameChange = (text: string) => {
    setManualForm((prev) => ({ ...prev, name: text }));

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchIngredientsDebounced(text);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleIngredientSelect = (ingredient: Ingredient) => {
    setManualForm((prev) => ({
      ...prev,
      name: ingredient.name,
      selectedIngredientId: ingredient.id,
    }));
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleFieldChange = (field: keyof ManualFormData, value: string) => {
    setManualForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setManualForm({
      name: '',
      brand: '',
      quantity: '',
      unit: '',
      dlc: '',
      selectedIngredientId: '',
    });
  };

  const validateForm = (): boolean => {
    if (!manualForm.name.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est requis');
      return false;
    }

    if (!manualForm.quantity.trim()) {
      Alert.alert('Erreur', 'La quantité est requise');
      return false;
    }

    if (!manualForm.unit.trim()) {
      Alert.alert('Erreur', "L'unité est requise");
      return false;
    }

    const quantity = parseFloat(manualForm.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Erreur', 'La quantité doit être un nombre positif');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    console.log('handleManualSubmit appelé');

    if (!validateForm()) {
      return;
    }

    const quantity = parseFloat(manualForm.quantity);

    try {
      console.log('Début de la création du produit');

      // Créer le produit d'abord
      const productData: ProductData = {
        code: Date.now().toString(),
        name: manualForm.name,
        description: `${manualForm.name} - ${manualForm.brand}`,
        imageUrl: '',
        defaultDlcTime: '30 days',
        defaultUnit: manualForm.unit,
        unitSize: 1,
        packagingSize: 1,
        ingredients: manualForm.selectedIngredientId
          ? [manualForm.selectedIngredientId]
          : [],
      };

      console.log('Création du produit:', productData);
      const createdProduct = await createProduct(productData, token);
      console.log('Produit créé avec succès:', createdProduct);

      // Créer le stock avec l'ID du produit créé
      const stockData: StockData = {
        productId: createdProduct.id,
        categoryId: manualForm.selectedIngredientId || undefined,
        quantity: quantity,
        unit: manualForm.unit,
        dlc: manualForm.dlc || undefined,
      };

      console.log('Création du stock:', stockData);
      await createStock(stockData, token);
      console.log('Stock créé avec succès');

      // Ajouter au contexte local pour l'affichage immédiat
      const ingredientItem = {
        id: Date.now().toString(),
        code: Date.now().toString(),
        name: manualForm.name,
        ingredientId: manualForm.selectedIngredientId || Date.now().toString(),
        ingredient: {
          category: null,
          createdAt: new Date().toISOString(),
          nameEn: manualForm.name,
          nameFr: manualForm.name,
          offTag: '',
          parentOffTags: null,
          updatedAt: new Date().toISOString(),
          wikidata: '',
        },
        occurrences: 1,
      };

      addIngredient(ingredientItem);
      resetForm();

      console.log('Article ajouté au stock avec succès !');
      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de l'ajout au stock:", error);
      console.error("Détails de l'erreur:", error);
    }
  };

  return {
    manualForm,
    searchResults,
    isSearching,
    showDropdown,
    handleNameChange,
    handleIngredientSelect,
    handleFieldChange,
    handleSubmit,
    setShowDropdown,
  };
}
