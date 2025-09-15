import { apiFetch, buildQuery } from '@/services/api';

export interface RecipeIngredientDto {
	id: string;
	ingredientId: string;
	quantity: number;
	unit: string;
	isOptional: boolean;
	ingredient: {
		id: string;
		parentOffTags: string[]; // e.g. ['en:en:milk', 'en:en:whole-milk']
	};
}

export interface RecipeDto {
	id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	preparationTime?: number;
	cookingTime?: number;
	servings: number;
	difficulty?: string;
	nutriScore?: string;
	categories?: string[];
	instructions?: {
		name?: string;
		steps: {
			number: number;
			step: string;
			ingredients?: string[];
			equipment?: string[];
		}[];
	}[];
	ingredients: RecipeIngredientDto[];
}

export interface PaginatedRecipesResponse {
	data: RecipeDto[];
	total: number;
	page: number;
	limit: number;
}

export interface ValidateRecipeResponse {
	success: boolean;
	message: string;
	recipe: {
		id: string;
		name: string;
		originalServings: number;
		requestedServings: number;
		scalingRatio: number;
	};
	ingredientsUsed?: {
		ingredientId: string;
		ingredientName: string;
		originalQuantity: number;
		adjustedQuantity: number;
		unit: string;
	}[];
	missingIngredients?: {
		ingredientName: string;
		requiredQuantity: number;
		availableQuantity: number;
		shortage: number;
		unit: string;
	}[];
}

export interface GetRecipesParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string; // e.g. 'createdAt:DESC'
	categories?: string[];
	difficulty?: string;
}

export async function getRecipes(
	params: GetRecipesParams = {}
): Promise<PaginatedRecipesResponse> {
	const searchParams: Record<string, string | undefined> = {
		page: params.page ? String(params.page) : undefined,
		limit: params.limit ? String(params.limit) : undefined,
		search: params.search,
	};

	// NestJS paginate expects filter[...] format; keep it minimal here
	if (params.categories && params.categories.length > 0) {
		searchParams['filter.categories'] = params.categories.join(',');
	}
	if (params.difficulty) {
		searchParams['filter.difficulty'] = params.difficulty;
	}

	const qs = buildQuery(searchParams);
	const { data } = await apiFetch<PaginatedRecipesResponse>(`/recipes${qs}`, {
		method: 'GET',
	});
	return data;
}

export async function getRecipe(id: string): Promise<RecipeDto> {
	const { data } = await apiFetch<RecipeDto>(`/recipes/${id}`, {
		method: 'GET',
	});
	return data;
}

export async function searchRecipes(
	query: string
): Promise<{ data: RecipeDto[] } & Partial<PaginatedRecipesResponse>> {
	const qs = buildQuery({ query });
	const { data } = await apiFetch<any>(`/recipes/search${qs}`, {
		method: 'GET',
	});
	// Search endpoint returns a custom shape via Elasticsearch; normalize best-effort
	if (Array.isArray(data?.results)) return { data: data.results };
	if (Array.isArray(data?.recipes)) return { data: data.recipes };
	return { data: [] };
}

export async function getMakeableRecipes(): Promise<
	{ data: RecipeDto[] } & Partial<PaginatedRecipesResponse>
> {
	const { data } = await apiFetch<any>(`/recipes/makeable`, { method: 'GET' });
	if (Array.isArray(data?.data)) return data;
	if (Array.isArray(data?.recipes)) return { data: data.recipes };
	return { data: [] };
}

export async function validateRecipe(
	id: string,
	payload: { servings: number; notes?: string }
): Promise<ValidateRecipeResponse> {
	const { data } = await apiFetch<ValidateRecipeResponse>(
		`/recipes/${id}/validate`,
		{
			method: 'POST',
			body: JSON.stringify(payload),
		}
	);
	return data;
}
