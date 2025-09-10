export interface Category {
  id: string;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Légumes' },
  { id: '2', name: 'Fruits' },
  { id: '3', name: 'Céréales' },
  { id: '4', name: 'Protéines végétales' },
  { id: '5', name: 'Produits laitiers' },
  { id: '6', name: 'Viande blanche' },
  { id: '7', name: 'Poisson' },
  { id: '8', name: 'Légumineuses' },
  { id: '9', name: 'Noix et graines' },
  { id: '10', name: 'Herbes et épices' },
  { id: '11', name: 'Céréales complètes' },
  { id: '12', name: 'Produits bio' },
  { id: '13', name: 'Viande rouge' },
  { id: '14', name: 'Produits transformés' },
  { id: '15', name: 'Boissons' },
  { id: '16', name: 'Surgelés' },
  { id: '17', name: 'Conserves' },
  { id: '18', name: 'Épicerie salée' },
  { id: '19', name: 'Épicerie sucrée' },
  { id: '20', name: 'Hygiène et beauté' },
  { id: '21', name: 'Entretien' },
  { id: '22', name: 'Autres' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((category) => category.id === id);
};

export const getCategoryByName = (name: string): Category | undefined => {
  return CATEGORIES.find((category) => category.name === name);
};
