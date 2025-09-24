import { formatDateForDisplay, startOfToday } from '@/lib/date';

export type Criticality = 'expired' | 'critical' | 'urgent' | 'warning' | 'normal';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const parseDlcDate = (dlc: string): Date | null => {
	const trimmed = dlc.trim();
	if (!trimmed) {
		return null;
	}

	const [datePart] = trimmed.split('T');
	if (!datePart) {
		return null;
	}

	const segments = datePart.split('-');
	if (segments.length !== 3) {
		return null;
	}

	const [yearPart, monthPart, dayPart] = segments;
	const year = Number.parseInt(yearPart, 10);
	const month = Number.parseInt(monthPart, 10);
	const day = Number.parseInt(dayPart, 10);

	if (
		Number.isNaN(year) ||
		Number.isNaN(month) ||
		Number.isNaN(day)
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

	candidate.setHours(0, 0, 0, 0);
	return candidate;
};

export const computeDaysUntilExpiry = (dlc: string): number | null => {
	const parsed = parseDlcDate(dlc);
	if (!parsed) {
		return null;
	}

	const today = startOfToday();
	const diff = (parsed.getTime() - today.getTime()) / MS_PER_DAY;
	return Math.round(diff);
};

export const resolveCriticality = (daysUntil: number | null): Criticality => {
	if (daysUntil === null) return 'normal';
	if (daysUntil < 0) return 'expired';
	if (daysUntil <= 1) return 'critical';
	if (daysUntil <= 3) return 'urgent';
	if (daysUntil <= 7) return 'warning';
	return 'normal';
};

export const formatDlcDateForDisplay = (dlc: string): string | null => {
	const parsed = parseDlcDate(dlc);
	if (!parsed) {
		return null;
	}

	return formatDateForDisplay(parsed);
};
