export const startOfToday = (): Date => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today;
};

export const toDateOnly = (date: Date): Date => {
	const normalized = new Date(date);
	normalized.setHours(0, 0, 0, 0);
	return normalized;
};

export const formatDateForApi = (date: Date | null): string | undefined => {
	if (!date) {
		return undefined;
	}

	const normalized = toDateOnly(date);
	const year = normalized.getFullYear();
	const month = `${normalized.getMonth() + 1}`.padStart(2, '0');
	const day = `${normalized.getDate()}`.padStart(2, '0');

	return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (date: Date | null): string => {
	if (!date) {
		return '';
	}

	const normalized = toDateOnly(date);
	const day = `${normalized.getDate()}`.padStart(2, '0');
	const month = `${normalized.getMonth() + 1}`.padStart(2, '0');
	const year = normalized.getFullYear();

	return `${day}/${month}/${year}`;
};

export const parseDisplayDate = (value: string): Date | null => {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const parts = trimmed.split('/');
	if (parts.length !== 3) {
		return null;
	}

	const [dayPart, monthPart, yearPart] = parts;
	const day = Number.parseInt(dayPart, 10);
	const month = Number.parseInt(monthPart, 10);
	const year = Number.parseInt(yearPart, 10);

	if (
		Number.isNaN(day) ||
		Number.isNaN(month) ||
		Number.isNaN(year) ||
		yearPart.length !== 4
	) {
		return null;
	}

	const candidate = new Date(year, month - 1, day);
	if (
		Number.isNaN(candidate.getTime()) ||
		candidate.getFullYear() !== year ||
		candidate.getMonth() !== month - 1 ||
		candidate.getDate() !== day
	) {
		return null;
	}

	return toDateOnly(candidate);
};

export const isBeforeToday = (date: Date): boolean =>
	toDateOnly(date).getTime() < startOfToday().getTime();
