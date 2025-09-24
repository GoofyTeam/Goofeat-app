import { PieceUnit, UnitType } from '@/constants/Units';
import { useAuth } from '@/context/AuthContext';
import { useHousehold } from '@/context/HouseholdContext';
import { useIngredientContext } from '@/context/IngredientContext';
import { getStocks } from '@/services/stock';
import {
	Criticality,
	computeDaysUntilExpiry,
	resolveCriticality,
} from '@/lib/criticality';
import { useCallback, useEffect, useState } from 'react';

export interface Article {
	id: string;
	name: string;
	quantity: number;
	unit: UnitType;
	dlc: string;
	daysUntilExpiry: number | null;
	criticality: Criticality;
}

const sortArticlesByExpiry = <T extends Article>(items: T[]): T[] => {
	return [...items].sort((a, b) => {
		const aValue = a.daysUntilExpiry ?? Number.POSITIVE_INFINITY;
		const bValue = b.daysUntilExpiry ?? Number.POSITIVE_INFINITY;
		return aValue - bValue;
	});
};

export function useArticles() {
	const { ingredients } = useIngredientContext();
	const { token } = useAuth();
	const { currentHouseholdId } = useHousehold();
	const [allArticles, setAllArticles] = useState<Article[]>([]);
	const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [totalStocks, setTotalStocks] = useState(0);

	const loadStocks = useCallback(async () => {
		try {
			setLoading(true);
			const stocksResponse = await getStocks(token, {
				limit: 100,
				page: 1,
				householdId: currentHouseholdId,
			});

			setTotalStocks(stocksResponse.total);

			const articlesFromStocks = stocksResponse.data.map((stock) => {
				const dlc = stock.dlc || '';
				const daysUntilExpiry = computeDaysUntilExpiry(dlc);
				return {
					id: stock.id,
					name: stock.product.name,
					quantity: stock.quantity,
					unit: (stock.unit as UnitType) || PieceUnit.UNIT,
					dlc,
					daysUntilExpiry,
					criticality: resolveCriticality(daysUntilExpiry),
				};
			});

			const sortedArticles = sortArticlesByExpiry(articlesFromStocks);
			setAllArticles(sortedArticles);
			setFilteredArticles(sortedArticles);
		} catch (error) {
			console.error('Erreur lors du chargement des stocks:', error);

			const articlesFromIngredients = ingredients.map((item) => ({
				id: item.id,
				name: item.name,
				quantity: item.occurrences,
				unit: PieceUnit.UNIT,
				dlc: '',
				daysUntilExpiry: null,
				criticality: 'normal' as const,
			}));
			const sortedFallback = sortArticlesByExpiry(articlesFromIngredients);
			setAllArticles(sortedFallback);
			setFilteredArticles(sortedFallback);
		} finally {
			setLoading(false);
		}
	}, [token, ingredients, currentHouseholdId]);

	useEffect(() => {
		loadStocks();
	}, [loadStocks]);

	const filterArticles = useCallback(
		(searchText: string) => {
			if (!searchText.trim()) {
				setFilteredArticles(allArticles);
				return;
			}

			const lowerCaseSearch = searchText.toLowerCase();
			const filtered = allArticles.filter((article) =>
				article.name.toLowerCase().includes(lowerCaseSearch)
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
		const daysUntilExpiry = computeDaysUntilExpiry(value);
		updateArticle(articleId, {
			dlc: value,
			daysUntilExpiry,
			criticality: resolveCriticality(daysUntilExpiry),
		});
	};

	const setUnit = (articleId: string, unit: UnitType) => {
		updateArticle(articleId, { unit });
	};

	const refreshArticles = useCallback(() => {
		loadStocks();
	}, [loadStocks]);

	return {
		articles: filteredArticles,
		loading,
		searchTerm,
		totalStocks,
		handleSearchChange,
		increment,
		decrement,
		setDlc,
		setUnit,
		refreshArticles,
	};
}
