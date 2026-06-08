import { Notice, TFile, TFolder } from "obsidian";
import { Path } from "src/plugin/utils/path";
import { ExportPreset, Settings, SettingsPage } from "src/plugin/settings/settings";
import { Utils } from "src/plugin/utils/utils";
import { Website } from "src/plugin/website/website";
import { ExportLog, MarkdownRendererAPI } from "src/plugin/render-api/render-api";
import { ExportInfo, ExportModal } from "src/plugin/settings/export-modal";
import { Webpage } from "./website/webpage";
import { CloudPublisher, CloudPublishResult } from "./cloud-publish/cloud-publisher";
import { CloudPublishSettings } from "./cloud-publish/cloud-publish-settings";

export class HTMLExporter
{
	static async updateSettings(usePreviousSettings: boolean = false, overrideFiles: TFile[] | undefined = undefined, overrideExportPath: Path | undefined = undefined): Promise<ExportInfo | undefined>
	{
		if (!usePreviousSettings) 
		{
			const modal = new ExportModal();
			if(overrideFiles) modal.overridePickedFiles(overrideFiles);
			return await modal.open();
		}
		
		const files = Settings.exportOptions.filesToExport[0];
		const path = overrideExportPath ?? new Path(Settings.exportOptions.exportPath);

		if ((files.length == 0 && overrideFiles == undefined) || !path.exists || !path.isAbsolute || !path.isDirectory)
		{
			new Notice("Please set the export path and files to export in the settings first.", 5000);
			const modal = new ExportModal();
			if(overrideFiles) modal.overridePickedFiles(overrideFiles);
			return await modal.open();
		}

		return undefined;
	}

	public static async export(usePreviousSettings: boolean = true, overrideFiles: TFile[] | undefined = undefined, overrideExportPath: Path | undefined = undefined)
	{
		if (!usePreviousSettings)
		{
			const modal = new ExportModal();
			if(overrideFiles) modal.overridePickedFiles(overrideFiles);
			await modal.open(async (info) =>
			{
				const files = info.pickedFiles ?? overrideFiles ?? Settings.getFilesToExport();
				return await HTMLExporter.exportWithResult(files, info.exportPath, info.cloudPublishSettings, true);
			});
			return;
		}

		const info = await this.updateSettings(usePreviousSettings, overrideFiles, overrideExportPath);
		if ((!info && !usePreviousSettings) || (info && info.canceled)) return;

		const files = info?.pickedFiles ?? overrideFiles ?? Settings.getFilesToExport();
		const exportPath = overrideExportPath ?? info?.exportPath ?? new Path(Settings.exportOptions.exportPath);

		await HTMLExporter.exportWithResult(files, exportPath, info?.cloudPublishSettings ?? Settings.cloudPublish, false);
	}

	private static async exportWithResult(files: TFile[], exportPath: Path, cloudPublishSettings: CloudPublishSettings, quietProgress: boolean)
	{
		try
		{
			const website = await HTMLExporter.exportFiles(files, exportPath, true, Settings.deleteOldFiles, quietProgress);
			if (!website) return;

			const publishResult = await HTMLExporter.publishAfterExport(exportPath, cloudPublishSettings);
			new Notice(HTMLExporter.exportCompleteMessage(exportPath, publishResult), 8000);
			return { exportPath, publishResult };
		}
		catch (error)
		{
			new Notice("❌ Export Failed: " + error, 5000);
			ExportLog.error(error, "Export Failed", true);
			return { exportPath, error };
		}
	}

	private static async publishAfterExport(exportPath: Path, cloudPublishSettings: CloudPublishSettings): Promise<CloudPublishResult | undefined>
	{
		if (!cloudPublishSettings.enabled) return;

		try
		{
			const publisher = new CloudPublisher(cloudPublishSettings);
			const result = await publisher.publish({
				destination: exportPath,
				exportOptions: Settings.exportOptions,
				settings: cloudPublishSettings,
			});

			for (const warning of result.warnings)
			{
				ExportLog.warning(warning);
			}

			return result;
		}
		catch (error)
		{
			ExportLog.error(error, "Cloud publish failed", true);
			return {
				uploadedCount: 0,
				failedCount: 1,
				warnings: ["Cloud publish failed: " + error],
			};
		}
	}

	private static exportCompleteMessage(exportPath: Path, publishResult: CloudPublishResult | undefined): string
	{
		let message = "✅ Finished HTML Export:\n\n" + exportPath;
		if (!publishResult) return message;

		message = "✅ Finished HTML Export\n✅ Cloud publish successful";
		message += `\n\nUploaded: ${publishResult.uploadedCount}`;
		if (publishResult.failedCount > 0) message += `, ${publishResult.failedCount} failed`;
		if (publishResult.warnings.length > 0) message += "\n\nWarnings:\n" + publishResult.warnings.slice(0, 3).join("\n");
		return message;
	}

	public static async exportFiles(files: TFile[], destination: Path, saveFiles: boolean, deleteOld: boolean, quietProgress: boolean = false) : Promise<Website | undefined>
	{
		const previousDisplayProgress = Settings.exportOptions.displayProgress;
		if (quietProgress) Settings.exportOptions.displayProgress = false;
		let website = undefined;
		try
		{
			await MarkdownRendererAPI.beginBatch(Settings.exportOptions);
			website = await (await new Website(destination).load(files)).build();

			if (!website)
			{
				new Notice("❌ Export Cancelled", 5000);
				return;
			}

			if (deleteOld)
			{
				let i = 0;
				ExportLog.addToProgressCap(website.index.deletedFiles.length / 2);
				for (const dFile of website.index.deletedFiles)
				{
					const path = new Path(dFile, destination.path);
					
					// don't delete font files
					// this is a hacky way to prevent it from deleting the matjax and other font files used in only certain files
					if (path.extension == "woff" || path.extension == "woff2" || path.extension == "ttf" || path.extension == "otf")
					{
						ExportLog.progress(0.5, "Deleting Old Files", "Skipping: " + path.path, "var(--color-yellow)");
						continue;
					}

					await path.delete();
					ExportLog.progress(0.5, "Deleting Old Files", "Deleting: " + path.path, "var(--color-red)");
					i++;
				};

				await Path.removeEmptyDirectories(destination.path);
			}
			
			if (saveFiles) 
			{
				if (Settings.exportOptions.combineAsSingleFile)
				{
					await website.saveAsCombinedHTML();
				}
				else
				{
					await Utils.downloadAttachments(website.index.newFiles.filter((f) => !(f instanceof Webpage)));
					await Utils.downloadAttachments(website.index.updatedFiles.filter((f) => !(f instanceof Webpage)));

					if (Settings.exportPreset != ExportPreset.RawDocuments)
					{
						await Utils.downloadAttachments([website.index.websiteDataAttachment()]);
						await Utils.downloadAttachments([website.index.indexDataAttachment()]);
					}
				}
			}
		}
		catch (e)
		{
			new Notice("❌ Export Failed: " + e, 5000);
			ExportLog.error(e, "Export Failed", true);
		}
		finally
		{
			MarkdownRendererAPI.endBatch();
			Settings.exportOptions.displayProgress = previousDisplayProgress;
		}

		return website;
	}

	public static async exportFolder(folder: TFolder, rootExportPath: Path, saveFiles: boolean, clearDirectory: boolean) : Promise<Website | undefined>
	{
		const folderPath = new Path(folder.path);
		const allFiles = app.vault.getFiles();
		const files = allFiles.filter((file) => new Path(file.path).directory.path.startsWith(folderPath.path));

		return await this.exportFiles(files, rootExportPath, saveFiles, clearDirectory);
	}

	public static async exportVault(rootExportPath: Path, saveFiles: boolean, clearDirectory: boolean) : Promise<Website | undefined>
	{
		const files = app.vault.getFiles();
		return await this.exportFiles(files, rootExportPath, saveFiles, clearDirectory);
	}

}
