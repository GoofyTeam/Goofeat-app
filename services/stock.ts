import { apiFetch, buildQuery } from '@/services/api';

export interface StockData {
	productId?: string;
	categoryId?: string;
	quantity: number;
	unit: string;
	dlc?: string;
	householdId?: string;
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
        const { data } = await apiFetch<StockResponse>(`/stocks`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            body: JSON.stringify(stockData),
        });
        return data;
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
        const { data } = await apiFetch<any>(
            `/product/barcode/${encodeURIComponent(barcode)}`,
            { method: 'GET' }
        );
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
        const { data } = await apiFetch<ProductResponse>(`/product`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            body: JSON.stringify(productData),
        });
        return data;
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
	householdId?: string;
}

/**
 * Récupère tous les stocks de l'utilisateur avec pagination et recherche
 */
export async function getStocks(
    token?: string,
    params?: GetStocksParams
): Promise<StocksApiResponse> {
    try {
        const qs = buildQuery({
            page: params?.page?.toString(),
            limit: params?.limit?.toString(),
            offset: params?.offset?.toString(),
            search: params?.search,
            householdId: params?.householdId,
        });
        const { data } = await apiFetch<StocksApiResponse>(`/stocks${qs}`, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
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
        const { data } = await apiFetch<StockResponse>(`/stocks/${stockId}`, {
            method: 'PATCH',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            body: JSON.stringify(stockData),
        });
        return data;
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
        const qs = buildQuery({
            search: search || undefined,
            limit: String(limit ?? 10),
        });
        const { data } = await apiFetch<Ingredient[]>(`/ingredients${qs}`, {
            method: 'GET',
        });
        return data;
    } catch (error) {
        console.error("Erreur lors de la recherche d'ingrédients:", error);
        throw error;
    }
}
