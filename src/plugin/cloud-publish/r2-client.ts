import { requestUrl } from "obsidian";
import { createHash, createHmac } from "crypto";
import mime from "mime";
import { CloudPublishSettings } from "./cloud-publish-settings";
import { Path } from "src/plugin/utils/path";

const SERVICE = "s3";
const REGION = "auto";
const ALGORITHM = "AWS4-HMAC-SHA256";
const MAX_PRESIGNED_EXPIRES = 604800;

export interface R2UploadObject {
	key: string;
	path: Path;
}

export class R2Client {
	private readonly settings: CloudPublishSettings;

	constructor(settings: CloudPublishSettings) {
		this.settings = settings;
	}

	async uploadObject(object: R2UploadObject): Promise<void> {
		const body = await object.path.readAsBuffer();
		if (!body) throw new Error("Could not read local file: " + object.path.path);

		const url = this.objectUrl(object.key);
		const now = new Date();
		const payloadHash = sha256Hex(body);
		const headers: Record<string, string> = {
			"Authorization": this.authorizationHeader("PUT", url, now, payloadHash),
			"Content-Type": contentTypeForPath(object.path),
			"x-amz-content-sha256": payloadHash,
			"x-amz-date": amzDate(now),
		};

		const response = await requestUrl({
			url: url.toString(),
			method: "PUT",
			headers,
			body: bufferToArrayBuffer(body),
			throw: false,
		});

		if (response.status < 200 || response.status >= 300) {
			throw new Error(`R2 upload failed (${response.status}): ${response.text?.slice(0, 500) ?? ""}`);
		}
	}

	createPresignedGetUrl(key: string, expiresSeconds: number): string {
		const expires = Math.max(1, Math.min(Math.floor(expiresSeconds), MAX_PRESIGNED_EXPIRES));
		const now = new Date();
		const date = shortDate(now);
		const credentialScope = `${date}/${REGION}/${SERVICE}/aws4_request`;
		const url = this.objectUrl(key);

		url.searchParams.set("X-Amz-Algorithm", ALGORITHM);
		url.searchParams.set("X-Amz-Credential", `${this.settings.accessKeyId}/${credentialScope}`);
		url.searchParams.set("X-Amz-Date", amzDate(now));
		url.searchParams.set("X-Amz-Expires", expires.toString());
		url.searchParams.set("X-Amz-SignedHeaders", "host");

		const canonicalRequest = [
			"GET",
			url.pathname,
			canonicalQueryString(url),
			`host:${url.host}\n`,
			"host",
			"UNSIGNED-PAYLOAD",
		].join("\n");

		const stringToSign = [
			ALGORITHM,
			amzDate(now),
			credentialScope,
			sha256Hex(canonicalRequest),
		].join("\n");

		const signature = hmacHex(signingKey(this.settings.secretAccessKey, date), stringToSign);
		url.searchParams.set("X-Amz-Signature", signature);
		return url.toString();
	}

	private authorizationHeader(method: "PUT", url: URL, now: Date, payloadHash: string): string {
		const date = shortDate(now);
		const credentialScope = `${date}/${REGION}/${SERVICE}/aws4_request`;
		const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

		const canonicalRequest = [
			method,
			url.pathname,
			canonicalQueryString(url),
			`host:${url.host}\n` +
			`x-amz-content-sha256:${payloadHash}\n` +
			`x-amz-date:${amzDate(now)}\n`,
			signedHeaders,
			payloadHash,
		].join("\n");

		const stringToSign = [
			ALGORITHM,
			amzDate(now),
			credentialScope,
			sha256Hex(canonicalRequest),
		].join("\n");

		const signature = hmacHex(signingKey(this.settings.secretAccessKey, date), stringToSign);
		return `${ALGORITHM} Credential=${this.settings.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
	}

	private objectUrl(key: string): URL {
		const endpoint = normalizeEndpoint(this.settings);
		const url = new URL(endpoint);
		const bucket = encodePathSegment(this.settings.bucket);
		const encodedKey = key.split("/").map(encodePathSegment).join("/");
		url.pathname = joinUrlPath(url.pathname, bucket, encodedKey);
		url.search = "";
		return url;
	}
}

function normalizeEndpoint(settings: CloudPublishSettings): string {
	const endpoint = settings.endpointUrl.trim() || `https://${settings.accountId.trim()}.r2.cloudflarestorage.com`;
	return endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
}

function joinUrlPath(...parts: string[]): string {
	return "/" + parts
		.map(part => part.replace(/^\/+/, "").replace(/\/+$/, ""))
		.filter(part => part.length > 0)
		.join("/");
}

function encodePathSegment(segment: string): string {
	return encodeURIComponent(segment).replace(/[!'()*]/g, char => "%" + char.charCodeAt(0).toString(16).toUpperCase());
}

function canonicalQueryString(url: URL): string {
	const params: string[] = [];
	url.searchParams.forEach((value, key) => {
		params.push(`${rfc3986(key)}=${rfc3986(value)}`);
	});
	return params.sort().join("&");
}

function rfc3986(value: string): string {
	return encodeURIComponent(value).replace(/[!'()*]/g, char => "%" + char.charCodeAt(0).toString(16).toUpperCase());
}

function shortDate(date: Date): string {
	return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function amzDate(date: Date): string {
	return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function sha256Hex(data: string | Buffer): string {
	return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
	return createHmac("sha256", key).update(data).digest();
}

function hmacHex(key: Buffer | string, data: string): string {
	return createHmac("sha256", key).update(data).digest("hex");
}

function signingKey(secretAccessKey: string, date: string): Buffer {
	const kDate = hmac("AWS4" + secretAccessKey, date);
	const kRegion = hmac(kDate, REGION);
	const kService = hmac(kRegion, SERVICE);
	return hmac(kService, "aws4_request");
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
	return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

function contentTypeForPath(path: Path): string {
	return mime.getType(path.extensionName) || "application/octet-stream";
}
