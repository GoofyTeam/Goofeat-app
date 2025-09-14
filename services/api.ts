import { API_URL_V1, API_URL_V2 } from '@/config';
import { clearTokenStorage, getTokenStorage } from './storage';

let onUnauthorized: (() => void) | undefined;

export function setUnauthorizedHandler(handler?: () => void) {
	onUnauthorized = handler;
}

export async function apiFetch<T = unknown>(
	path: string,
	options: RequestInit & { version?: 'v1' | 'v2' } = {}
): Promise<{ data: T; response: Response }> {
	const { version = 'v1', ...fetchOptions } = options;
	const token = getTokenStorage();

	const headers = new Headers(fetchOptions.headers || {});
	if (token) headers.set('Authorization', `Bearer ${token}`);
	if (
		!headers.has('Content-Type') &&
		fetchOptions.body &&
		!(fetchOptions.body instanceof FormData)
	) {
		headers.set('Content-Type', 'application/json');
	}

	// Choisir l'URL de base selon la version
	const baseUrl = version === 'v2' ? API_URL_V2 : API_URL_V1;

	const res = await fetch(`${baseUrl}${path}`, {
		...fetchOptions,
		headers,
	});

	if (res.status === 401) {
		// Ensure we clear token and notify listeners
		clearTokenStorage();
		if (onUnauthorized) onUnauthorized();
	}

	let data: any = null;
	const contentType = res.headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		data = await res.json().catch(() => null);
	} else {
		data = await res.text().catch(() => null);
	}

	if (!res.ok) {
		const message =
			(data && (data.message || data.error)) || `Request failed: ${res.status}`;
		const err: any = new Error(message);
		err.status = res.status;
		err.response = res;
		err.data = data;
		throw err;
	}

	return { data: data as T, response: res };
}

export function buildQuery(params: Record<string, string | undefined>) {
	const usp = new URLSearchParams();
	Object.entries(params).forEach(([k, v]) => {
		if (v != null) usp.set(k, v);
	});
	const s = usp.toString();
	return s ? `?${s}` : '';
}
