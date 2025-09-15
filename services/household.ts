import { apiFetch } from '@/services/api';

// Types aligned with backend DTOs and entities
export type HouseholdType = 'family' | 'couple' | 'colocation' | 'single';

export type Household = {
	id: string;
	name: string;
	type: HouseholdType;
	description?: string;
	inviteCode?: string | null;
	inviteCodeExpiresAt?: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type HouseholdWithMembers = Household & {
	members?: HouseholdMember[];
};

export type HouseholdMemberRole =
	| 'admin'
	| 'parent'
	| 'child'
	| 'guest'
	| 'roommate';

export type HouseholdMember = {
	id: string;
	userId: string;
	householdId: string;
	role: HouseholdMemberRole;
	canEditStock: boolean;
	needsApproval: boolean;
	canViewAllStocks: boolean;
	canInviteMembers: boolean;
	nickname?: string | null;
	joinedAt: string;
	isActive: boolean;
	user: {
		id: string;
		email: string;
		firstName?: string;
		lastName?: string;
	};
};

export type CreateHouseholdDto = {
	name: string;
	type: HouseholdType;
	description?: string;
	settings?: Record<string, unknown>;
};

export type UpdateHouseholdDto = Partial<CreateHouseholdDto> & {
	isActive?: boolean;
};

export type InviteMemberDto = {
	email: string;
	role: HouseholdMemberRole;
	nickname?: string;
};

export type JoinHouseholdDto = {
	inviteCode: string;
	nickname?: string;
};

export type HouseholdSettings = {
	notifications?: {
		stockUpdates?: boolean;
		childActions?: boolean;
		expirationAlerts?: boolean;
		memberJoined?: boolean;
		onlyParentsForApproval?: boolean;
		digestMode?: 'instant' | 'daily' | 'weekly' | 'disabled';
	};
	childApproval?: {
		enabled?: boolean;
		autoExpireHours?: number;
		maxQuantityWithoutApproval?: number;
	};
};

export type UpdateHouseholdSettingsDto = HouseholdSettings;

// API functions

export async function createHousehold(dto: CreateHouseholdDto) {
	const { data } = await apiFetch<HouseholdWithMembers>(`/households`, {
		method: 'POST',
		body: JSON.stringify(dto),
	});
	return data;
}

export async function listHouseholds() {
	const { data } = await apiFetch<Household[]>(`/households`, {
		method: 'GET',
	});
	return data;
}

export async function getHousehold(id: string) {
	const { data } = await apiFetch<HouseholdWithMembers>(`/households/${id}`, {
		method: 'GET',
	});
	return data;
}

export async function updateHousehold(id: string, dto: UpdateHouseholdDto) {
	const { data } = await apiFetch<HouseholdWithMembers>(`/households/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(dto),
	});
	return data;
}

export async function deleteHousehold(id: string) {
	const { data } = await apiFetch<{ message: string }>(`/households/${id}`, {
		method: 'DELETE',
	});
	return data;
}

export async function generateInviteCode(id: string) {
	const { data } = await apiFetch<{ inviteCode: string }>(
		`/households/${id}/generate-invite-code`,
		{ method: 'POST' }
	);
	return data;
}

export async function inviteMember(householdId: string, dto: InviteMemberDto) {
	const { data } = await apiFetch<{ message: string }>(
		`/households/${householdId}/invite`,
		{ method: 'POST', body: JSON.stringify(dto) }
	);
	return data;
}

export async function joinHousehold(dto: JoinHouseholdDto) {
	const { data } = await apiFetch<HouseholdWithMembers>(`/households/join`, {
		method: 'POST',
		body: JSON.stringify(dto),
	});
	return data;
}

export async function listMembers(householdId: string) {
	const { data } = await apiFetch<HouseholdMember[]>(
		`/households/${householdId}/members`,
		{ method: 'GET' }
	);
	return data;
}

export async function updateMember(
	householdId: string,
	memberId: string,
	dto: Partial<
		Pick<
			HouseholdMember,
			| 'role'
			| 'nickname'
			| 'canEditStock'
			| 'needsApproval'
			| 'canViewAllStocks'
			| 'canInviteMembers'
			| 'isActive'
		>
	>
) {
	const { data } = await apiFetch<HouseholdMember>(
		`/households/${householdId}/members/${memberId}`,
		{ method: 'PATCH', body: JSON.stringify(dto) }
	);
	return data;
}

export async function removeMember(householdId: string, memberId: string) {
	const { data } = await apiFetch<{ message: string }>(
		`/households/${householdId}/members/${memberId}`,
		{ method: 'DELETE' }
	);
	return data;
}

export async function getHouseholdSettings(householdId: string) {
	const { data } = await apiFetch<HouseholdSettings>(
		`/households/${householdId}/settings`,
		{ method: 'GET' }
	);
	return data;
}

export async function updateHouseholdSettings(
	householdId: string,
	dto: UpdateHouseholdSettingsDto
) {
	const { data } = await apiFetch<HouseholdWithMembers>(
		`/households/${householdId}/settings`,
		{ method: 'PATCH', body: JSON.stringify(dto) }
	);
	return data;
}
