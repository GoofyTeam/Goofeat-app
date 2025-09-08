import { PieceUnit, UnitType } from '@/constants/Units';
import { useAuth } from '@/context/AuthContext';
import { useIngredientContext } from '@/context/IngredientContext';
import { getStocks } from '@/services/stock';
import { useCallback, useEffect, useState } from 'react';

export interface Article {
  id: string;
  name: string;
  checked: boolean;
  quantity: number;
  unit: UnitType;
  dlc: string;
}

export function useArticles() {
  const { ingredients } = useIngredientContext();
  const { token } = useAuth();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalStocks, setTotalStocks] = useState(0);

  const loadStocks = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Chargement des stocks...');
      const stocksResponse = await getStocks(token, {
        limit: 100,
        page: 1,
      });
      console.log('Stocks récupérés:', stocksResponse);
      console.log('Total stocks:', stocksResponse.total);

      setTotalStocks(stocksResponse.total);

      const articlesFromStocks = stocksResponse.data.map((stock) => ({
        id: stock.id,
        name: stock.product.name,
        checked: false,
        quantity: stock.quantity,
        unit: (stock.unit as UnitType) || PieceUnit.UNIT,
        dlc: stock.dlc || '',
      }));

      console.log('Articles convertis:', articlesFromStocks);
      console.log("Nombre d'articles:", articlesFromStocks.length);
      setAllArticles(articlesFromStocks);
      setFilteredArticles(articlesFromStocks);
    } catch (error) {
      console.error('Erreur lors du chargement des stocks:', error);

      const articlesFromIngredients = ingredients.map((item) => ({
        id: item.id,
        name: item.name,
        checked: false,
        quantity: item.occurrences,
        unit: PieceUnit.UNIT,
        dlc: '',
      }));
      setAllArticles(articlesFromIngredients);
      setFilteredArticles(articlesFromIngredients);
    } finally {
      setLoading(false);
    }
  }, [token, ingredients]);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  const filterArticles = useCallback(
    (searchText: string) => {
      if (!searchText.trim()) {
        setFilteredArticles(allArticles);
        return;
      }

      const filtered = allArticles.filter((article) =>
        article.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredArticles(filtered);
    },
    [allArticles]
  );

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    filterArticles(text);
  };

  const updateArticle = useCallback((id: string, updates: Partial<Article>) => {
    setAllArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    setFilteredArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const toggleCheck = (id: string) => {
    const article = allArticles.find((a) => a.id === id);
    if (article) {
      updateArticle(id, { checked: !article.checked });
    }
  };

  const increment = (id: string) => {
    const article = allArticles.find((a) => a.id === id);
    if (article) {
      updateArticle(id, { quantity: article.quantity + 1 });
    }
  };

  const decrement = (id: string) => {
    const article = allArticles.find((a) => a.id === id);
    if (article) {
      updateArticle(id, { quantity: Math.max(0.1, article.quantity - 1) });
    }
  };

  const setDlc = (articleId: string, value: string) => {
    updateArticle(articleId, { dlc: value });
  };

  const setUnit = (articleId: string, unit: UnitType) => {
    updateArticle(articleId, { unit });
  };

  return {
    articles: filteredArticles,
    loading,
    searchTerm,
    totalStocks,
    handleSearchChange,
    toggleCheck,
    increment,
    decrement,
    setDlc,
    setUnit,
  };
}
