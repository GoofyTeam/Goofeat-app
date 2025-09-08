import { useAuth } from '@/context/AuthContext';
import { useIngredientContext } from '@/context/IngredientContext';
import { getStocks } from '@/services/stock';
import { useCallback, useEffect, useState } from 'react';

export interface Article {
  id: string;
  name: string;
  checked: boolean;
  quantity: number;
  unit: string;
  dlc: string;
}

export function useArticles() {
  const { ingredients } = useIngredientContext();
  const { token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [totalStocks, setTotalStocks] = useState(0);

  const loadStocks = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        console.log(
          'Chargement des stocks...',
          search ? `avec recherche: ${search}` : ''
        );
        const stocksResponse = await getStocks(token, {
          limit: 100,
          page: 1,
          search: search || undefined,
        });
        console.log('Stocks récupérés:', stocksResponse);
        console.log('Total stocks:', stocksResponse.total);

        // Mettre à jour le total
        setTotalStocks(stocksResponse.total);

        // Convertir les stocks en articles
        const articlesFromStocks = stocksResponse.data.map((stock) => ({
          id: stock.id,
          name: stock.product.name,
          checked: false,
          quantity: stock.quantity,
          unit: stock.unit,
          dlc: stock.dlc || '',
        }));

        console.log('Articles convertis:', articlesFromStocks);
        console.log("Nombre d'articles:", articlesFromStocks.length);
        setArticles(articlesFromStocks);
      } catch (error) {
        console.error('Erreur lors du chargement des stocks:', error);
        // Fallback sur les ingrédients du contexte local
        const articlesFromIngredients = ingredients.map((item) => ({
          id: item.id,
          name: item.name,
          checked: false,
          quantity: item.occurrences,
          unit: 'unité',
          dlc: '',
        }));
        setArticles(articlesFromIngredients);
      } finally {
        setLoading(false);
      }
    },
    [token, ingredients]
  );

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      loadStocks(text);
    }, 500); // Délai de 500ms pour éviter trop de requêtes

    setSearchTimeout(timeout);
  };

  const toggleCheck = (id: string) => {
    setArticles(
      articles.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const increment = (id: string) => {
    setArticles(
      articles.map((a) => {
        if (a.id === id) {
          const quantity = a.quantity + 1;
          return { ...a, quantity };
        }
        return a;
      })
    );
  };

  const decrement = (id: string) => {
    setArticles(
      articles.map((a) => {
        if (a.id === id) {
          const quantity = Math.max(0.1, a.quantity - 1);
          return { ...a, quantity };
        }
        return a;
      })
    );
  };

  const setDlc = (articleId: string, value: string) => {
    setArticles(
      articles.map((a) => {
        if (a.id === articleId) {
          return { ...a, dlc: value };
        }
        return a;
      })
    );
  };

  return {
    articles,
    loading,
    searchTerm,
    totalStocks,
    handleSearchChange,
    toggleCheck,
    increment,
    decrement,
    setDlc,
  };
}
