import { API_URL_V1 } from '@/config';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { apiFetch, buildQuery } from './api';
import { clearTokenStorage, getTokenStorage, setTokenStorage } from './storage';

export type User = {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	roles?: string[];
};

export type AuthResult = {
	access_token: string;
};

export async function register(dto: {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}) {
	const { data } = await apiFetch<AuthResult>('/auth/register', {
		method: 'POST',
		body: JSON.stringify(dto),
	});

	return data;
}

export async function login(dto: { email: string; password: string }) {
	const { data } = await apiFetch<AuthResult>('/auth/login', {
		method: 'POST',
		body: JSON.stringify(dto),
	});
	setTokenStorage(data.access_token);
	return data;
}

export async function me() {
	const { data } = await apiFetch<User>('/user/profile', { version: 'v2' });
	return data;
}

export async function verifyEmail(token: string) {
	const { data } = await apiFetch<{ message: string }>(
		`/auth/verify-email${buildQuery({ token })}`,
		{ method: 'GET' }
	);
	return data;
}

export async function forgotPassword(email: string) {
	const { data } = await apiFetch<{ message: string }>(
		`/auth/forgot-password`,
		{
			method: 'POST',
			body: JSON.stringify({ email }),
		}
	);
	return data;
}

export async function resetPassword(token: string, newPassword: string) {
	const { data } = await apiFetch<{ message: string }>(`/auth/reset-password`, {
		method: 'POST',
		body: JSON.stringify({ token, newPassword }),
	});
	return data;
}

export function logout() {
	clearTokenStorage();
}

// OAuth helpers

export function getOAuthStartUrl(provider: 'google' | 'apple') {
	return `${API_URL_V1}/auth/${provider}`;
}

export async function openOAuth(provider: 'google' | 'apple') {
	const redirectUri = Linking.createURL('/oauth/callback');
	const startUrl = getOAuthStartUrl(provider);

	// Use WebBrowser auth session across web/native so the window
	// auto-closes on redirect to our redirectUri.
	const res = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri);
	if (res.type === 'success' && res.url) {
		const url = new URL(res.url);
		const hash = url.hash?.startsWith('#') ? url.hash.substring(1) : url.hash;
		const hp = new URLSearchParams(hash || '');
		const token =
			hp.get('access_token') ||
			url.searchParams.get('access_token') ||
			undefined;
		if (token) {
			setTokenStorage(token);
			// On web, refresh so app state picks up the new token
			if (Platform.OS === 'web' && typeof window !== 'undefined') {
				window.location.reload();
			}
		}
	}
	return res;
}

// JWT decode (no verify) for exp check
export function decodeJwt<T = any>(token?: string): T | undefined {
	if (!token) return undefined;
	const parts = token.split('.');
	if (parts.length !== 3) return undefined;
	try {
		const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		const json = decodeURIComponent(
			atob(payload)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		return JSON.parse(json) as T;
	} catch {
		return undefined;
	}
}

export function isTokenExpired(token?: string) {
	const payload = decodeJwt<{ exp?: number }>(token || getTokenStorage());
	if (!payload?.exp) return false; // if no exp, treat as not expired
	const now = Math.floor(Date.now() / 1000);
	return payload.exp <= now;
}
