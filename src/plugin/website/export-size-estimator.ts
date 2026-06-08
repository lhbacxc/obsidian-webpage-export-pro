import { TFile } from "obsidian";
import { AssetLoader } from "src/plugin/asset-loaders/base-asset";
import { AssetType } from "src/plugin/asset-loaders/asset-types";
import { ExportPipelineOptions } from "src/plugin/website/pipeline-options";
import { MarkdownRendererAPI } from "src/plugin/render-api/render-api";

export type ExportSizeRiskLevel = "low" | "medium" | "high";

export interface ExportSizeEstimate {
	estimatedBytes: number;
	mainHtmlBytes: number;
	rawMediaBytes: number;
	mediaInlineBytes: number;
	metadataBytes: number;
	attachmentDataBytes: number;
	selectedFileCount: number;
	pageCount: number;
	attachmentCount: number;
	mediaOccurrenceCount: number;
	riskLevel: ExportSizeRiskLevel;
	isCombinedHtml: boolean;
}

interface MediaOccurrence {
	file: TFile;
	size: number;
	sourcePath: string;
}

const BASE_PAGE_OVERHEAD_BYTES = 80 * 1024;
const COMBINED_HEAD_OVERHEAD_BYTES = 2 * 1024 * 1024;
const WEBPAGE_METADATA_OVERHEAD_BYTES = 2 * 1024;
const FILE_METADATA_OVERHEAD_BYTES = 1 * 1024;
const WEBSITE_METADATA_OVERHEAD_BYTES = 48 * 1024;
const URI_ENCODING_OVERHEAD = 1.08;

export class ExportSizeEstimator {
	static async estimate(files: TFile[], options: ExportPipelineOptions): Promise<ExportSizeEstimate> {
		const selectedFiles = files.filter((file) => file);
		const pageFiles = selectedFiles.filter((file) => MarkdownRendererAPI.isConvertable(file.extension));
		const mediaOccurrences: MediaOccurrence[] = [];
		const attachmentMap = new Map<string, TFile>();

		for (const file of pageFiles) {
			const occurrences = await this.getMediaOccurrences(file);
			mediaOccurrences.push(...occurrences);
			for (const occurrence of occurrences) {
				attachmentMap.set(occurrence.file.path, occurrence.file);
			}
		}

		for (const file of selectedFiles) {
			if (this.isAttachmentFile(file)) {
				attachmentMap.set(file.path, file);
			}
		}

		const pageSizes = pageFiles.map((file) => this.estimatePageHtmlBytes(file, mediaOccurrencesForFile(mediaOccurrences, file), options));
		const mainHtmlBytes = options.combineAsSingleFile
			? (pageSizes[0] ?? BASE_PAGE_OVERHEAD_BYTES) + this.estimateCombinedHeadBytes(options)
			: pageSizes.reduce((total, size) => total + size, 0);

		const rawMediaBytes = mediaOccurrences.reduce((total, occurrence) => total + occurrence.size, 0);
		const mediaInlineBytes = options.inlineMedia
			? mediaOccurrences.reduce((total, occurrence) => total + this.dataUrlBytes(occurrence.file, occurrence.size), 0)
			: 0;

		const attachmentDataBytes = options.combineAsSingleFile
			? Array.from(attachmentMap.values()).reduce((total, file) => total + this.estimateEncodedAttachmentDataBytes(file), 0)
			: 0;

		const metadataBytes = options.combineAsSingleFile
			? this.estimateCombinedMetadataBytes(pageSizes, attachmentMap.size)
			: 0;

		const estimatedBytes = Math.max(0, Math.round(mainHtmlBytes + metadataBytes + attachmentDataBytes));
		const riskLevel = this.getRiskLevel(estimatedBytes);

		return {
			estimatedBytes,
			mainHtmlBytes,
			rawMediaBytes,
			mediaInlineBytes,
			metadataBytes,
			attachmentDataBytes,
			selectedFileCount: selectedFiles.length,
			pageCount: pageFiles.length,
			attachmentCount: attachmentMap.size,
			mediaOccurrenceCount: mediaOccurrences.length,
			riskLevel,
			isCombinedHtml: options.combineAsSingleFile,
		};

		function mediaOccurrencesForFile(occurrences: MediaOccurrence[], page: TFile): MediaOccurrence[] {
			return occurrences.filter((occurrence) => occurrence.sourcePath === page.path);
		}
	}

	static formatBytes(bytes: number): string {
		const units = ["B", "KB", "MB", "GB"];
		let value = bytes;
		let unitIndex = 0;

		while (value >= 1024 && unitIndex < units.length - 1) {
			value /= 1024;
			unitIndex++;
		}

		const precision = value >= 100 || unitIndex === 0 ? 0 : value >= 10 ? 1 : 2;
		return `${value.toFixed(precision)} ${units[unitIndex]}`;
	}

	private static async getMediaOccurrences(file: TFile): Promise<MediaOccurrence[]> {
		const occurrences: MediaOccurrence[] = [];
		const seenKeys = new Set<string>();
		const addLink = (link: string | undefined) => {
			if (!link) return;
			const resolved = app.metadataCache.getFirstLinkpathDest(cleanLink(link), file.path);
			if (!resolved || !this.isMediaFile(resolved)) return;
			const key = `${link}:${occurrences.length}`;
			if (seenKeys.has(key)) return;
			seenKeys.add(key);
			occurrences.push({ file: resolved, size: resolved.stat.size, sourcePath: file.path });
		};

		const cache = app.metadataCache.getFileCache(file);
		for (const embed of cache?.embeds ?? []) {
			addLink(embed.link);
		}

		if (file.extension === "md") {
			try {
				const content = await app.vault.cachedRead(file);
				for (const link of this.extractEmbeddedLinks(content)) {
					addLink(link);
				}
			}
			catch {
				// Metadata cache coverage is usually enough; keep estimation resilient.
			}
		}

		if (this.isMediaFile(file)) {
			occurrences.push({ file, size: file.stat.size, sourcePath: file.path });
		}

		return occurrences;
	}

	private static extractEmbeddedLinks(content: string): string[] {
		const links: string[] = [];
		for (const match of content.matchAll(/!\[\[([^\]]+)\]\]/g)) {
			links.push(match[1].split("|")[0]);
		}
		for (const match of content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
			links.push(match[1]);
		}
		for (const match of content.matchAll(/<(?:img|video|audio|source)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
			links.push(match[1]);
		}
		return links;
	}

	private static estimatePageHtmlBytes(file: TFile, occurrences: MediaOccurrence[], options: ExportPipelineOptions): number {
		const mediaBytes = options.inlineMedia
			? occurrences.reduce((total, occurrence) => total + this.dataUrlBytes(occurrence.file, occurrence.size), 0)
			: occurrences.reduce((total, occurrence) => total + occurrence.file.path.length + 64, 0);
		const sourceTextEstimate = this.isMediaFile(file) ? 24 * 1024 : file.stat.size * 1.5;

		return Math.round(BASE_PAGE_OVERHEAD_BYTES + sourceTextEstimate + mediaBytes);
	}

	private static estimateCombinedMetadataBytes(pageSizes: number[], attachmentCount: number): number {
		const webpageDataJsonBytes = pageSizes.reduce((total, size) => total + size + WEBPAGE_METADATA_OVERHEAD_BYTES, 0);
		const fileInfoJsonBytes = pageSizes.length * FILE_METADATA_OVERHEAD_BYTES + attachmentCount * FILE_METADATA_OVERHEAD_BYTES;
		return this.base64Length(Math.ceil((WEBSITE_METADATA_OVERHEAD_BYTES + webpageDataJsonBytes + fileInfoJsonBytes) * URI_ENCODING_OVERHEAD));
	}

	private static estimateEncodedAttachmentDataBytes(file: TFile): number {
		const base64DataBytes = this.base64Length(file.stat.size);
		const jsonBytes = base64DataBytes + FILE_METADATA_OVERHEAD_BYTES;
		return this.base64Length(Math.ceil(jsonBytes * URI_ENCODING_OVERHEAD));
	}

	private static estimateCombinedHeadBytes(options: ExportPipelineOptions): number {
		let total = 0;
		if (options.includeCSS) total += 700 * 1024;
		if (options.includeJS) total += 1200 * 1024;
		if (options.inlineFonts) total += 200 * 1024;
		return Math.max(total, COMBINED_HEAD_OVERHEAD_BYTES);
	}

	private static dataUrlBytes(file: TFile, rawBytes: number): number {
		const ext = file.extension;
		const mediaType = this.mediaType(file);
		const prefix = `data:${mediaType}/${ext === "svg" ? "svg+xml" : ext};base64,`;
		return prefix.length + this.base64Length(rawBytes);
	}

	private static base64Length(rawBytes: number): number {
		return Math.ceil(rawBytes / 3) * 4;
	}

	private static isAttachmentFile(file: TFile): boolean {
		return !MarkdownRendererAPI.isConvertable(file.extension) || this.isMediaFile(file);
	}

	private static isMediaFile(file: TFile): boolean {
		return AssetLoader.extentionToType(file.extension) === AssetType.Media;
	}

	private static mediaType(file: TFile): string {
		// @ts-ignore
		return app.viewRegistry.typeByExtension[file.extension] ?? (file.extension.match(/mp3|wav|ogg|aac|m4a|flac|opus/) ? "audio" : "video");
	}

	private static getRiskLevel(bytes: number): ExportSizeRiskLevel {
		if (bytes >= 250 * 1024 * 1024) return "high";
		if (bytes >= 80 * 1024 * 1024) return "medium";
		return "low";
	}

}

function cleanLink(link: string): string {
	return link.split("#")[0].split("?")[0].trim();
}
