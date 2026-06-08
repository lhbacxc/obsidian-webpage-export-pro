export type CloudPublishMode = "presigned-url" | "revocable-link";
export type CloudUploadStrategy = "auto" | "single-html" | "directory";

export interface CloudPublishSettings {
	enabled: boolean;
	uploadStrategy: CloudUploadStrategy;
	accountId: string;
	accessKeyId: string;
	secretAccessKey: string;
	endpointUrl: string;
	bucket: string;
	keyPrefix: string;
	publishMode: CloudPublishMode;
	createPresignedUrl: boolean;
	keepLocalFilesAfterPublish: boolean;
	presignedUrlExpireSeconds: number;
	workerBaseUrl: string;
	workerAdminToken: string;
	webdavUrl: string;
	webdavUsername: string;
	webdavPassword: string;
	webdavRemotePath: string;
}

export const DEFAULT_CLOUD_PUBLISH_SETTINGS: CloudPublishSettings = {
	enabled: false,
	uploadStrategy: "auto",
	accountId: "",
	accessKeyId: "",
	secretAccessKey: "",
	endpointUrl: "",
	bucket: "",
	keyPrefix: "",
	publishMode: "presigned-url",
	createPresignedUrl: true,
	keepLocalFilesAfterPublish: true,
	presignedUrlExpireSeconds: 604800,
	workerBaseUrl: "",
	workerAdminToken: "",
	webdavUrl: "",
	webdavUsername: "",
	webdavPassword: "",
	webdavRemotePath: "obsidian-webpage-export/cloud-publish.json",
};

const uploadStrategies: CloudUploadStrategy[] = ["auto", "single-html", "directory"];
const publishModes: CloudPublishMode[] = ["presigned-url", "revocable-link"];

function stringValue(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function booleanValue(value: unknown, fallback: boolean): boolean {
	return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown, fallback: number): number {
	const number = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function enumValue<T extends string>(value: unknown, values: T[], fallback: T): T {
	return values.includes(value as T) ? value as T : fallback;
}

export function sanitizeCloudPublishSettings(source: unknown): CloudPublishSettings {
	const raw = source && typeof source === "object" ? source as Partial<CloudPublishSettings> : {};
	const defaults = DEFAULT_CLOUD_PUBLISH_SETTINGS;

	return {
		enabled: booleanValue(raw.enabled, defaults.enabled),
		uploadStrategy: enumValue(raw.uploadStrategy, uploadStrategies, defaults.uploadStrategy),
		accountId: stringValue(raw.accountId).trim(),
		accessKeyId: stringValue(raw.accessKeyId).trim(),
		secretAccessKey: stringValue(raw.secretAccessKey),
		endpointUrl: stringValue(raw.endpointUrl).trim(),
		bucket: stringValue(raw.bucket).trim(),
		keyPrefix: normalizeKeyPrefix(stringValue(raw.keyPrefix)),
		publishMode: enumValue(raw.publishMode, publishModes, defaults.publishMode),
		createPresignedUrl: booleanValue(raw.createPresignedUrl, defaults.createPresignedUrl),
		keepLocalFilesAfterPublish: booleanValue(raw.keepLocalFilesAfterPublish, defaults.keepLocalFilesAfterPublish),
		presignedUrlExpireSeconds: numberValue(raw.presignedUrlExpireSeconds, defaults.presignedUrlExpireSeconds),
		workerBaseUrl: stringValue(raw.workerBaseUrl).trim(),
		workerAdminToken: stringValue(raw.workerAdminToken),
		webdavUrl: stringValue(raw.webdavUrl).trim(),
		webdavUsername: stringValue(raw.webdavUsername).trim(),
		webdavPassword: stringValue(raw.webdavPassword),
		webdavRemotePath: normalizeWebdavPath(stringValue(raw.webdavRemotePath) || defaults.webdavRemotePath),
	};
}

export function pickCloudPublishSettings(source: unknown): CloudPublishSettings {
	const raw = source && typeof source === "object" ? source as { cloudPublish?: unknown } : {};
	return sanitizeCloudPublishSettings(raw.cloudPublish ?? source);
}

export function normalizeKeyPrefix(prefix: string): string {
	return prefix
		.replaceAll("\\", "/")
		.replace(/^\/+/, "")
		.replace(/\/+$/, "");
}

export function normalizeWebdavPath(path: string): string {
	return path
		.replaceAll("\\", "/")
		.replace(/^\/+/, "");
}

export function cloudPublishConfigComplete(settings: CloudPublishSettings): boolean {
	return !!(
		settings.accessKeyId.trim() &&
		settings.secretAccessKey &&
		settings.bucket.trim() &&
		(settings.endpointUrl.trim() || settings.accountId.trim())
	);
}
