const pathTools = require("upath");
import type { TFile } from "obsidian";
import { readdir } from "fs/promises";
import { ExportPipelineOptions } from "src/plugin/website/pipeline-options";
import { Path } from "src/plugin/utils/path";
import { getCombinedHtmlFileName } from "src/plugin/website/website";
import { CloudPublishSettings, cloudPublishConfigComplete, CloudUploadStrategy, normalizeKeyPrefix } from "./cloud-publish-settings";
import { R2Client, R2UploadObject } from "./r2-client";
import { ExportLog } from "../render-api/render-api";

export interface CloudPublishResult {
	uploadedCount: number;
	failedCount: number;
	entryKey?: string;
	presignedUrl?: string;
	uploadedPaths: string[];
	warnings: string[];
}

export interface CloudPublishRequest {
	destination: Path;
	files: TFile[];
	exportOptions: ExportPipelineOptions;
	settings: CloudPublishSettings;
}

interface UploadCandidate extends R2UploadObject {
	isEntry: boolean;
}

export class CloudPublisher {
	private readonly r2Client: R2Client;

	constructor(private readonly settings: CloudPublishSettings) {
		this.r2Client = new R2Client(settings);
	}

	async publish(request: CloudPublishRequest): Promise<CloudPublishResult> {
		const result: CloudPublishResult = {
			uploadedCount: 0,
			failedCount: 0,
			uploadedPaths: [],
			warnings: [],
		};

		if (!this.settings.enabled) return result;
		if (!cloudPublishConfigComplete(this.settings)) {
			result.warnings.push("Cloud publish skipped because R2 settings are incomplete.");
			return result;
		}

		const candidates = await collectUploadCandidates(request.destination, request.files, request.exportOptions, this.settings);
		if (candidates.length === 0) {
			result.warnings.push("Cloud publish skipped because no exported files were found.");
			return result;
		}

		for (const candidate of candidates) {
			if (ExportLog.wasCancelled()) return result;
			try {
				await this.r2Client.uploadObject(candidate);
				result.uploadedCount++;
				result.uploadedPaths.push(candidate.path.absoluted().pathname);
				if (candidate.isEntry) result.entryKey = candidate.key;
			}
			catch (error) {
				result.failedCount++;
				result.warnings.push(`Failed to upload ${candidate.key}: ${error}`);
			}
		}

		if (ExportLog.wasCancelled()) return result;
		if (this.settings.createPresignedUrl && result.entryKey && this.settings.publishMode === "presigned-url") {
			try {
				result.presignedUrl = this.r2Client.createPresignedGetUrl(result.entryKey, this.settings.presignedUrlExpireSeconds);
			}
			catch (error) {
				result.warnings.push("Failed to create presigned URL: " + error);
			}
		}

		if (this.settings.publishMode === "revocable-link") {
			result.warnings.push("Revocable links are reserved but not implemented yet. Uploaded files are available in R2.");
		}

		return result;
	}
}

export async function collectUploadCandidates(destination: Path, sourceFiles: TFile[], exportOptions: ExportPipelineOptions, settings: CloudPublishSettings): Promise<UploadCandidate[]> {
	const strategy = resolveStrategy(settings.uploadStrategy, exportOptions);
	if (strategy === "single-html") {
		const htmlPath = findSingleHtmlExport(destination, sourceFiles, exportOptions);
		if (!htmlPath) return [];
		return [{
			path: htmlPath,
			key: objectKeyForPath(destination, htmlPath, settings, true),
			isEntry: true,
		}];
	}

	const files = await listFilesRecursive(destination);
	const entryPath = findEntryPath(destination, files);

	return files.map(file => ({
		path: file,
		key: objectKeyForPath(destination, file, settings, false),
		isEntry: entryPath?.absoluted().pathname === file.absoluted().pathname,
	}));
}

function resolveStrategy(strategy: CloudUploadStrategy, exportOptions: ExportPipelineOptions): Exclude<CloudUploadStrategy, "auto"> {
	if (strategy === "auto") return exportOptions.combineAsSingleFile ? "single-html" : "directory";
	return strategy;
}

function findSingleHtmlExport(destination: Path, sourceFiles: TFile[], exportOptions: ExportPipelineOptions): Path | undefined {
	if (sourceFiles.length === 0) return;
	const expected = destination.joinString(getCombinedHtmlFileName(sourceFiles, exportOptions));
	if (expected.exists && expected.isFileFS) return expected;
	return;
}

function findEntryPath(destination: Path, files: Path[]): Path | undefined {
	const index = destination.joinString("index.html");
	const indexPath = index.absoluted().pathname;
	return files.find(file => file.absoluted().pathname === indexPath) ??
		files.find(file => file.extensionName.toLowerCase() === "html");
}

async function listFilesRecursive(root: Path): Promise<Path[]> {
	const files: Path[] = [];
	const rootPath = root.absoluted().pathname;

	async function visit(directory: string) {
		const entries = await readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = pathTools.join(directory, entry.name);
			if (entry.isDirectory()) {
				await visit(fullPath);
			}
			else if (entry.isFile()) {
				files.push(new Path(fullPath, ""));
			}
		}
	}

	if (root.exists && root.isDirectoryFS) {
		await visit(rootPath);
	}

	return files;
}

function objectKeyForPath(root: Path, file: Path, settings: CloudPublishSettings, singleFile: boolean): string {
	const prefix = normalizeKeyPrefix(settings.keyPrefix);
	const relative = singleFile
		? file.fullName
		: pathTools.relative(root.absoluted().pathname, file.absoluted().pathname);
	const normalizedRelative = relative.replaceAll("\\", "/").replace(/^\/+/, "");
	return [prefix, normalizedRelative].filter(part => part.length > 0).join("/");
}
