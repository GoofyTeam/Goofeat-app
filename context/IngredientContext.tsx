import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface Ingredient {
  category: string | null;
  createdAt: string;
  nameEn: string;
  nameFr: string;
  offTag: string;
  parentOffTags: string | null;
  updatedAt: string;
  wikidata: string;
}

export interface IngredientItem {
  code: string;
  id: string;
  name: string;
  ingredientId: string;
  ingredient: Ingredient;
  occurrences: number;
}

interface IngredientContextType {
  ingredients: IngredientItem[];
  addIngredient: (item: IngredientItem) => void;
  updateIngredient: (id: string, updatedItem: Partial<IngredientItem>) => void;
  removeIngredient: (id: string) => void;
  clearIngredients: () => void;
}

const IngredientContext = createContext<IngredientContextType | undefined>(undefined);

export const IngredientProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);

  const normalizeName = (name: string) => name.trim().toLowerCase();

  const addIngredient = (item: IngredientItem) => {
    const normalizedName = normalizeName(item.name);
    const existingIndex = ingredients.findIndex(
      (i) => normalizeName(i.name) === normalizedName
    );

    if (existingIndex === -1) {
      // Si l'ingrédient n'existe pas, l'ajouter avec 1 occurrence
      setIngredients((prev) => [...prev, { ...item, occurrences: 1 }]);
    } else {
      // Si l'ingrédient existe déjà, incrémenter les occurrences
      setIngredients((prev) =>
        prev.map((ingredient, index) =>
          index === existingIndex
            ? { ...ingredient, occurrences: ingredient.occurrences + 1 }
            : ingredient
        )
      );
    }
  };

  const updateIngredient = (id: string, updatedItem: Partial<IngredientItem>) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const clearIngredients = () => {
    setIngredients([]);
  };

  return (
    <IngredientContext.Provider
      value={{ ingredients, addIngredient, updateIngredient, removeIngredient, clearIngredients }}
    >
      {children}
    </IngredientContext.Provider>
  );
};

export const useIngredientContext = () => {
  const context = useContext(IngredientContext);
  if (!context) {
    throw new Error('useIngredientContext must be used within an IngredientProvider');
  }
  return context;
};
