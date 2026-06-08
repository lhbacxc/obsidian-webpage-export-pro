import { CloudPublishMode } from "./cloud-publish-settings";

export type CloudPublishHistoryLinkType = CloudPublishMode;

export interface CloudPublishHistoryEntry {
	id: string;
	linkType: CloudPublishHistoryLinkType;
	url?: string;
	entryKey: string;
	exportPath: string;
	createdAt: number;
	expiresInSeconds: number;
	expiresAt: number;
	uploadedCount: number;
}

const MAX_HISTORY_ENTRIES = 50;
const MAX_PRESIGNED_EXPIRES = 604800;

export function sanitizeCloudPublishHistory(source: unknown): CloudPublishHistoryEntry[] {
	if (!Array.isArray(source)) return [];

	const entries = source
		.map((item, index) => sanitizeCloudPublishHistoryEntry(item, index))
		.filter((entry): entry is CloudPublishHistoryEntry => !!entry)
		.sort((a, b) => b.createdAt - a.createdAt);

	const seen = new Set<string>();
	const deduped: CloudPublishHistoryEntry[] = [];
	for (const entry of entries) {
		const key = cloudPublishHistoryIdentityKey(entry.entryKey);
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(entry);
	}

	return deduped
		.slice(0, MAX_HISTORY_ENTRIES);
}

export function appendCloudPublishHistory(history: CloudPublishHistoryEntry[], entry: Omit<CloudPublishHistoryEntry, "id">): CloudPublishHistoryEntry[] {
	const identityKey = cloudPublishHistoryIdentityKey(entry.entryKey);
	const previous = history.find(item => cloudPublishHistoryIdentityKey(item.entryKey) === identityKey);
	const next: CloudPublishHistoryEntry = {
		...entry,
		id: previous?.id ?? `${entry.createdAt}-${entry.entryKey}-${history.length}`,
	};

	const remaining = history.filter(item => cloudPublishHistoryIdentityKey(item.entryKey) !== identityKey);
	return sanitizeCloudPublishHistory([next, ...remaining]);
}

export function isCloudPublishHistoryExpired(entry: CloudPublishHistoryEntry, now: number = Date.now()): boolean {
	return Number.isFinite(entry.expiresAt) ? entry.expiresAt <= now : false;
}

export function cloudPublishHistoryDisplayName(entry: CloudPublishHistoryEntry): string {
	return entry.entryKey.split("/").filter(part => part.length > 0).pop() ?? entry.entryKey;
}

export function formatCloudPublishHistoryExpiry(entry: CloudPublishHistoryEntry): string {
	return new Date(entry.expiresAt).toLocaleString();
}

function cloudPublishHistoryIdentityKey(entryKey: string): string {
	return entryKey.split("/").filter(part => part.length > 0).pop()?.toLowerCase() ?? entryKey.toLowerCase();
}

function sanitizeCloudPublishHistoryEntry(source: unknown, index: number): CloudPublishHistoryEntry | undefined {
	const raw = source && typeof source === "object" ? source as Partial<CloudPublishHistoryEntry> : {};
	const createdAt = normalizeTimestamp(raw.createdAt);
	const expiresInSeconds = normalizeCloudPublishExpiresInSeconds(raw.expiresInSeconds);
	const expiresAt = normalizeTimestamp(raw.expiresAt) || createdAt + expiresInSeconds * 1000;
	const entryKey = typeof raw.entryKey === "string" ? raw.entryKey.trim() : "";
	const exportPath = typeof raw.exportPath === "string" ? raw.exportPath.trim() : "";

	if (!entryKey || !exportPath || !createdAt || !expiresAt) return;

	return {
		id: typeof raw.id === "string" && raw.id.trim() ? raw.id : `${createdAt}-${entryKey}-${index}`,
		linkType: raw.linkType === "revocable-link" ? "revocable-link" : "presigned-url",
		url: typeof raw.url === "string" && raw.url.trim() ? raw.url.trim() : undefined,
		entryKey,
		exportPath,
		createdAt,
		expiresInSeconds,
		expiresAt,
		uploadedCount: normalizeCount(raw.uploadedCount),
	};
}

function normalizeTimestamp(value: unknown): number {
	const timestamp = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
	return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
}

export function normalizeCloudPublishExpiresInSeconds(value: unknown): number {
	const expires = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
	if (!Number.isFinite(expires) || expires <= 0) return MAX_PRESIGNED_EXPIRES;
	return Math.min(Math.floor(expires), MAX_PRESIGNED_EXPIRES);
}

function normalizeCount(value: unknown): number {
	const count = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
	return Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
}
