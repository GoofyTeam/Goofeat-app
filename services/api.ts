import { API_URL } from '@/config';
import { clearTokenStorage, getTokenStorage } from './storage';

let onUnauthorized: (() => void) | undefined;

export function setUnauthorizedHandler(handler?: () => void) {
	onUnauthorized = handler;
}

export async function apiFetch<T = unknown>(
	path: string,
	options: RequestInit = {}
): Promise<{ data: T; response: Response }> {
	const token = getTokenStorage();

	const headers = new Headers(options.headers || {});
	if (token) headers.set('Authorization', `Bearer ${token}`);
	if (
		!headers.has('Content-Type') &&
		options.body &&
		!(options.body instanceof FormData)
	) {
		headers.set('Content-Type', 'application/json');
	}

	const res = await fetch(`${API_URL}${path}`, {
		...options,
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
