import { requestUrl } from "obsidian";
import { CloudPublishSettings, normalizeWebdavPath } from "./cloud-publish-settings";

export async function downloadWebdavConfig(settings: CloudPublishSettings): Promise<unknown> {
	const url = webdavFileUrl(settings);
	const response = await requestUrl({
		url,
		method: "GET",
		headers: webdavHeaders(settings),
		throw: false,
	});

	if (response.status < 200 || response.status >= 300) {
		throw new Error(`WebDAV download failed (${response.status}): ${response.text?.slice(0, 500) ?? ""}`);
	}

	try {
		return JSON.parse(response.text);
	}
	catch (error) {
		throw new Error("WebDAV config is not valid JSON: " + error);
	}
}

function webdavFileUrl(settings: CloudPublishSettings): string {
	const base = settings.webdavUrl.trim().replace(/\/+$/, "");
	const remotePath = normalizeWebdavPath(settings.webdavRemotePath);
	if (!base) throw new Error("WebDAV URL is empty.");
	if (!remotePath) throw new Error("WebDAV remote path is empty.");
	return `${base}/${remotePath.split("/").map(encodeURIComponent).join("/")}`;
}

function webdavHeaders(settings: CloudPublishSettings): Record<string, string> {
	const headers: Record<string, string> = {
		"Accept": "application/json",
	};

	if (settings.webdavUsername || settings.webdavPassword) {
		const token = Buffer.from(`${settings.webdavUsername}:${settings.webdavPassword}`).toString("base64");
		headers["Authorization"] = `Basic ${token}`;
	}

	return headers;
}
