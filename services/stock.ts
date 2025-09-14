import { API_URL_V1 } from '@/config';

export interface StockData {
	productId?: string;
	categoryId?: string;
	quantity: number;
	unit: string;
	dlc?: string;
}

export interface StockResponse {
	id: string;
	quantity: number;
	unit: string;
	totalQuantity: number;
	baseUnit: string;
	dlc: string;
	createdAt: string;
	updatedAt: string;
	addedByMemberId: string;
	lastUpdatedByMemberId: string;
	productId: string;
	categoryId?: string;
}

export interface StockWithProduct extends StockResponse {
	product: {
		id: string;
		name: string;
	};
}

export interface StocksApiResponse {
	data: StockWithProduct[];
	total: number;
	page: number;
	limit: number;
}

export interface Ingredient {
	id: string;
	name: string;
	wikidata: string | null;
	parentOffTags: string[] | null;
}

export interface ProductData {
	code: string;
	name: string;
	description: string;
	imageUrl: string;
	defaultDlcTime: string;
	defaultUnit: string;
	unitSize: number;
	packagingSize: number;
	ingredients: string[];
}

export interface ProductResponse {
	id: string;
	code: string;
	name: string;
	description: string;
	imageUrl: string;
	defaultDlcTime: string;
	defaultUnit: string;
	unitSize: number;
	packagingSize: number;
	ingredients: string[];
	createdAt: string;
	updatedAt: string;
}

/**
 * Crée un nouveau stock via l'API
 */
export async function createStock(
	stockData: StockData,
	token?: string
): Promise<StockResponse> {
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_URL_V1}/stocks`, {
			method: 'POST',
			headers,
			body: JSON.stringify(stockData),
		});

		if (!response.ok) {
			throw new Error(`Erreur ${response.status}: ${response.statusText}`);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error('Erreur lors de la création du stock:', error);
		throw error;
	}
}

/**
 * Récupère les informations d'un produit via son code-barres
 */
export async function getProductByBarcode(barcode: string): Promise<any> {
	try {
		const response = await fetch(`${API_URL_V1}/product/barcode/${barcode}`, {
			method: 'GET',
		});

		if (!response.ok) {
			throw new Error(`Erreur ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Erreur lors de la récupération du produit:', error);
		throw error;
	}
}

/**
 * Crée un nouveau produit via l'API
 */
export async function createProduct(
	productData: ProductData,
	token?: string
): Promise<ProductResponse> {
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_URL_V1}/product`, {
			method: 'POST',
			headers,
			body: JSON.stringify(productData),
		});

		if (!response.ok) {
			throw new Error(`Erreur ${response.status}: ${response.statusText}`);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error('Erreur lors de la création du produit:', error);
		throw error;
	}
}

export interface GetStocksParams {
	page?: number;
	limit?: number;
	offset?: number;
	search?: string;
}

/**
 * Récupère tous les stocks de l'utilisateur avec pagination et recherche
 */
export async function getStocks(
	token?: string,
	params?: GetStocksParams
): Promise<StocksApiResponse> {
	try {
		const headers: Record<string, string> = {};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		// Construire les paramètres de requête
		const queryParams = new URLSearchParams();
		if (params?.page) queryParams.append('page', params.page.toString());
		if (params?.limit) queryParams.append('limit', params.limit.toString());
		if (params?.offset) queryParams.append('offset', params.offset.toString());
		if (params?.search) queryParams.append('search', params.search);

		const queryString = queryParams.toString();
		const url = queryString
			? `${API_URL_V1}/stocks?${queryString}`
			: `${API_URL_V1}/stocks`;

		const response = await fetch(url, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`Erreur ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Erreur lors de la récupération des stocks:', error);
		throw error;
	}
}

/**
 * Met à jour un stock existant via l'API
 */
export async function updateStock(
	stockId: string,
	stockData: StockData,
	token?: string
): Promise<StockResponse> {
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${API_URL_V1}/stocks/${stockId}`, {
			method: 'PATCH',
			headers,
			body: JSON.stringify(stockData),
		});

		if (!response.ok) {
			throw new Error(`Erreur ${response.status}: ${response.statusText}`);
		}

		const result = await response.json();
		return result;
	} catch (error) {
		console.error('Erreur lors de la mise à jour du stock:', error);
		throw error;
	}
}

/**
 * Recherche des ingrédients par terme de recherche
 */
export async function searchIngredients(
	search: string,
	limit: number = 10
): Promise<Ingredient[]> {
	try {
		const response = await fetch(
			`${API_URL_V1}/ingredients?search=${encodeURIComponent(search)}&limit=${limit}`,
			{
				method: 'GET',
			}
		);

		if (!response.ok) {
			throw new Error(`Erreur ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Erreur lors de la recherche d'ingrédients:", error);
		throw error;
	}
}
