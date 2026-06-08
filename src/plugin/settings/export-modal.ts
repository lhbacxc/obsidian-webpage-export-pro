import { ButtonComponent, Modal, Notice, Setting, TFile } from 'obsidian';
import { Utils } from 'src/plugin/utils/utils';
import HTMLExportPlugin from 'src/plugin/main';
import { ExportPreset, Settings, SettingsPage } from './settings';
import { FilePickerTree } from 'src/plugin/features/file-picker';
import { Path } from 'src/plugin/utils/path';
import { FileDialogs } from 'src/plugin/utils/file-dialogs';
import { createFileInput } from './settings-components';
import { Website } from 'src/plugin/website/website';
import { Index } from 'src/plugin/website';
import { i18n } from '../translations/language';
import { CloudPublishMode, CloudPublishSettings, sanitizeCloudPublishSettings } from '../cloud-publish/cloud-publish-settings';
import { CloudPublishResult } from '../cloud-publish/cloud-publisher';
import { ExportLog } from '../render-api/render-api';

export interface ExportInfo
{
	canceled: boolean;
	pickedFiles: TFile[];
	exportPath: Path;
	validPath: boolean;
	cloudPublishSettings: CloudPublishSettings;
}

export interface ExportModalResult {
	exportPath: Path;
	publishResult?: CloudPublishResult;
	error?: unknown;
}

export type ExportModalSubmitHandler = (info: ExportInfo, modal: ExportModal) => Promise<ExportModalResult | undefined>;

export class ExportModal extends Modal 
{
	private isClosed: boolean = true;
	private canceled: boolean = true;
	private filePickerModalEl: HTMLElement;
	private filePicker: FilePickerTree;
	private pickedFiles: TFile[] | undefined = undefined;
	private validPath: boolean = true;
	private exportButton?: ButtonComponent;
	private exportResultEl?: HTMLElement;
	private exportStatusEl?: HTMLElement;
	private exportProgressValueEl?: HTMLProgressElement;
	private exportProgressTitleEl?: HTMLElement;
	private exportProgressSubEl?: HTMLElement;
	private exportLinkInput?: HTMLInputElement;
	private exportCopyButton?: ButtonComponent;
	public static title: string = i18n.exportModal.title;

	public exportInfo: ExportInfo;

	constructor() {
		super(app);
	}

	overridePickedFiles(files: TFile[])
	{
		this.pickedFiles = files;
	}

	/**
	 * @brief Opens the modal and async blocks until the modal is closed.
	 * @returns True if the EXPORT button was pressed, false is the export was canceled.
	 * @override
	*/
	async open(onExport?: ExportModalSubmitHandler): Promise<ExportInfo>
	{
		this.isClosed = false;
		this.canceled = true;
		const lang = i18n.exportModal;

		super.open();

		if(!this.filePickerModalEl)
		{
			this.filePickerModalEl = this.containerEl.createDiv({ cls: 'modal' });
			this.containerEl.insertBefore(this.filePickerModalEl, this.modalEl);
			this.filePickerModalEl.style.position = 'relative';
			this.filePickerModalEl.style.zIndex = "1";
			this.filePickerModalEl.style.width = "25em";
			this.filePickerModalEl.style.padding = "0";
			this.filePickerModalEl.style.margin = "10px";
			this.filePickerModalEl.style.maxHeight = "80%";
			this.filePickerModalEl.style.boxShadow = "0 0 7px 1px inset #00000060";
			
			const scrollArea = this.filePickerModalEl.createDiv({ cls: 'tree-scroll-area' });
			scrollArea.style.height = "100%";
			scrollArea.style.width = "100%";
			scrollArea.style.overflowY = "auto";
			scrollArea.style.overflowX = "hidden";
			scrollArea.style.padding = "1em";
			scrollArea.style.boxShadow = "0 0 7px 1px inset #00000060";

			const paths = app.vault.getFiles().map(file => new Path(file.path));
			this.filePicker = new FilePickerTree(paths, true, true);
			this.filePicker.regexBlacklist.push(...Settings.filePickerBlacklist);
			this.filePicker.regexBlacklist.push(...[Settings.exportOptions.customHeadOptions.sourcePath, Settings.exportOptions.faviconPath]);
			this.filePicker.regexWhitelist.push(...Settings.filePickerWhitelist);
			
			this.filePicker.generateWithItemsClosed = true;
			this.filePicker.showFileExtentionTags = true;
			this.filePicker.hideFileExtentionTags = ["md"];
			this.filePicker.title = lang.filePicker.title;
			this.filePicker.class = "file-picker";
			await this.filePicker.generate(scrollArea);
			
			if((this.pickedFiles?.length ?? 0 > 0) || Settings.exportOptions.filesToExport.length > 0) 
			{
				const filesToPick = this.pickedFiles?.map(file => file.path) ?? Settings.exportOptions.filesToExport;
				this.filePicker.setSelectedFiles(filesToPick);
			}

			const saveFiles = new Setting(this.filePickerModalEl).addButton((button) => 
			{
				button.setButtonText(lang.filePicker.save).onClick(async () =>
				{
					Settings.exportOptions.filesToExport = this.filePicker.getSelectedFilesSavePaths();
					await SettingsPage.saveSettings();
				});
			});

			saveFiles.settingEl.style.border = "none";
			saveFiles.settingEl.style.marginRight = "1em";
		}


		const { contentEl } = this;

		contentEl.empty();

		this.titleEl.setText(ExportModal.title);

		if (HTMLExportPlugin.updateInfo.updateAvailable) 
		{
			// create red notice showing the update is available
			const updateNotice = contentEl.createEl('strong', { text: `${i18n.updateAvailable}: ${HTMLExportPlugin.updateInfo.currentVersion} ⟶ ${HTMLExportPlugin.updateInfo.latestVersion}` });
			updateNotice.setAttribute("style",
				`margin-block-start: calc(var(--h3-size)/2);
			background-color: var(--interactive-normal);
			padding: 4px;
			padding-left: 1em;
			padding-right: 1em;
			color: var(--color-red);
			border-radius: 5px;
			display: block;
			width: fit-content;`)

			// create normal block with update notes
			const updateNotes = contentEl.createEl('div', { text: HTMLExportPlugin.updateInfo.updateNote });
			updateNotes.setAttribute("style",
				`margin-block-start: calc(var(--h3-size)/2);
			background-color: var(--background-secondary-alt);
			padding: 4px;
			padding-left: 1em;
			padding-right: 1em;
			color: var(--text-normal);
			font-size: var(--font-ui-smaller);
			border-radius: 5px;
			display: block;
			width: fit-content;
			white-space: pre-wrap;`)
		}

		const modeDescriptions = 
		{
			"online": lang.exportMode.online,
			"local": lang.exportMode.local,
			"raw-documents":  lang.exportMode.rawDocuments
		}

		const exportModeSetting = new Setting(contentEl)
			.setName(lang.exportMode.title)
			// @ts-ignore
			.setDesc(modeDescriptions[Settings.exportPreset])
			.setHeading()
			.addDropdown((dropdown) => dropdown
				.addOption('online', 'Online Website')
				.addOption('local', 'Local Website')
				.addOption('raw-documents', 'Raw HTML Documents')
				.setValue(["online", "local", "raw-documents"].contains(Settings.exportPreset) ? Settings.exportPreset : 'website')
				.onChange(async (value) =>
				{
					Settings.exportPreset = value as ExportPreset;

					switch (value) {
						case 'online':
							await Settings.onlinePreset();
							break;
						case 'local':
							await Settings.localPreset();
							break;
						case 'raw-documents':
							await Settings.rawDocumentsPreset();
							break;
					}

					this.open();
				}
				));
		exportModeSetting.descEl.style.whiteSpace = "pre-wrap";
		exportModeSetting.settingEl.style.paddingRight = "1em";

		

		// add purge export button
		new Setting(contentEl)
			
			.addButton((button) => button
			.setButtonText(lang.purgeExport.clearCache)
			.onClick(async () =>
			{
				// create a modal to confirm the deletion
				const confirmModal = new Modal(app);
				confirmModal.titleEl.setText(lang.purgeExport.confirmation);
				let warning = confirmModal.contentEl.createEl('p', { text: lang.purgeExport.clearWarning });
				warning.style.whiteSpace = "pre-wrap";
				confirmModal.open();

				new Setting(confirmModal.contentEl)
				.addButton((button) => button
				.setButtonText(i18n.cancel)
				.onClick(() => confirmModal.close()))
				.addButton((button) => button
				.setButtonText(lang.purgeExport.clearCache)
				.onClick(async () =>
				{
					const path = new Path(exportPathInput.textInput.getValue());
					const website = await new Website(path).load();
					await website.index.clearCache();
					onChanged(path);
					confirmModal.close();
				}));
			})).setDesc(lang.purgeExport.description);

		

		let temporaryPublishMode: CloudPublishMode = Settings.cloudPublish.publishMode;
		let temporaryExpireSeconds = Settings.cloudPublish.presignedUrlExpireSeconds;

		const cloudPublishSetting = new Setting(contentEl)
			.setName(lang.cloudPublish.title)
			.setDesc(lang.cloudPublish.description)
			.setHeading()
			.addDropdown((dropdown) => dropdown
				.addOption("presigned-url", lang.cloudPublish.presignedUrl)
				.addOption("revocable-link", lang.cloudPublish.revocableLink)
				.setValue(temporaryPublishMode)
				.onChange((value) =>
				{
					temporaryPublishMode = value as CloudPublishMode;
				}));
		cloudPublishSetting.settingEl.style.paddingRight = "1em";

		const expireError = contentEl.createDiv({ cls: "setting-item-description" });
		expireError.style.color = "var(--color-red)";
		expireError.style.marginBottom = "0.75rem";
		new Setting(contentEl)
			.setName(lang.cloudPublish.expireSeconds)
			.setDesc(lang.cloudPublish.expireSecondsDescription)
			.addText((text) => text
				.setValue(temporaryExpireSeconds.toString())
				.onChange((value) =>
				{
					if (!/^[1-9]\d*$/.test(value))
					{
						expireError.setText(lang.cloudPublish.expireSecondsError);
						setExportDisabled(true);
						return;
					}

					expireError.setText("");
					temporaryExpireSeconds = parseInt(value, 10);
					onChangedValidate(new Path(exportPathInput.textInput.getValue()));
				}));

		let exportButton : ButtonComponent | undefined = undefined;

		function setExportDisabled(disabled: boolean)
		{
			if(exportButton) 
			{
				exportButton.setDisabled(disabled);
				if (exportButton.disabled) exportButton.buttonEl.style.opacity = "0.5";
				else exportButton.buttonEl.style.opacity = "1";
			}
		}

		const validatePath = (path: Path) => path.validate(
		{
			allowEmpty: false,
			allowRelative: false,
			allowAbsolute: true,
			allowDirectories: true,
			allowTildeHomeDirectory: true,
			requireExists: true
		});

		const onChangedValidate = (path: Path) => (!validatePath(path).valid) ? setExportDisabled(true) : setExportDisabled(false);

		const onChanged = async (path: Path) =>
		{
			onChangedValidate(path);
			const valid = validatePath(path);
			this.validPath = valid.valid;
			if (!valid)
			{
				exportDescription.setText("");
				return;
			}

			const website = new Website(path);
			const index = new Index();
			await index.load(website, website.exportOptions);

			if (!index.oldWebsiteData)
			{
				exportDescription.setText(lang.currentSite.noSite);
				return;
			}

			if (index.oldWebsiteData.pluginVersion != HTMLExportPlugin.pluginVersion)
			{
				exportDescription.setText(lang.currentSite.oldSite);
				return;
			}

			const lastExportDate = new Date(index.oldWebsiteData.modifiedTime).toLocaleString();
			const lastExportFiles = index.oldWebsiteData.allFiles?.length;
			const lastExportName = index.oldWebsiteData.siteName;

			exportDescription.setText(`${lang.currentSite.pathContainsSite}: "${lastExportName}"\n${lang.currentSite.fileCount}: ${lastExportFiles}\n${lang.currentSite.lastExported}: ${lastExportDate}`);
			exportDescription.style.whiteSpace = "pre-wrap";
		}

		const exportPathInput = createFileInput(contentEl, () => Settings.exportOptions.exportPath, (value) => Settings.exportOptions.exportPath = value,
		{
			name: '',
			description: '',
			placeholder: i18n.pathInputPlaceholder,
			defaultPath: FileDialogs.idealDefaultPath(),
			pickFolder: true,
			validation: validatePath,
			onChanged: onChanged
		});

		const { fileInput } = exportPathInput;
		
		fileInput.addButton((button) => {
			this.exportButton = button;
			exportButton = button;
			setExportDisabled(!this.validPath);
			button.setButtonText(lang.exportButton).onClick(async () => 
			{
				this.canceled = false;
				this.pickedFiles = this.filePicker.getSelectedFiles();
				this.exportInfo = {
					canceled: false,
					pickedFiles: this.pickedFiles,
					exportPath: new Path(exportPathInput.textInput.getValue()),
					validPath: this.validPath,
					cloudPublishSettings: sanitizeCloudPublishSettings({
						...Settings.cloudPublish,
						publishMode: temporaryPublishMode,
						createPresignedUrl: temporaryPublishMode === "presigned-url",
						presignedUrlExpireSeconds: temporaryExpireSeconds,
					}),
				};

				if (!onExport)
				{
					this.close();
					return;
				}

				this.setExportRunning(true);
				this.showExportStatus(lang.result.running);
				this.showExportProgress(0, lang.result.running, "", "var(--interactive-accent)");
				ExportLog.setProgressListener((update) => this.showExportProgress(update.fraction, update.message, update.subMessage, update.progressColor));
				try
				{
					const result = await onExport(this.exportInfo, this);
					this.showExportResult(result);
				}
				catch (error)
				{
					this.showExportResult({ exportPath: this.exportInfo.exportPath, error });
				}
				finally
				{
					ExportLog.setProgressListener(undefined);
					this.setExportRunning(false);
				}
			});
		});

		// add description of export at this path
		const exportDescription = contentEl.createEl('div', { text: 'Loading site at path...', cls: 'setting-item-description'});
		exportDescription.style.marginBottom = "1em";
		onChanged(new Path(exportPathInput.textInput.getValue()));

		this.filePickerModalEl.style.height = this.modalEl.clientHeight * 2 + "px";

		new Setting(contentEl)
		.setDesc(lang.moreOptions)
		.addExtraButton((button) => button.setTooltip('Open plugin settings').onClick(() => {
			//@ts-ignore
			app.setting.open();
			//@ts-ignore
			app.setting.openTabById('webpage-html-export');
		}));

		this.createResultSection(contentEl);

		await Utils.waitUntil(() => this.isClosed, 60 * 60 * 1000, 10);
		
		this.pickedFiles = this.filePicker.getSelectedFiles();
		this.filePickerModalEl.remove();
		this.exportInfo = this.exportInfo ?? {
			canceled: this.canceled,
			pickedFiles: this.pickedFiles,
			exportPath: new Path(Settings.exportOptions.exportPath),
			validPath: this.validPath,
			cloudPublishSettings: sanitizeCloudPublishSettings(Settings.cloudPublish),
		};

		return this.exportInfo;
	}

	private createResultSection(contentEl: HTMLElement)
	{
		const lang = i18n.exportModal.result;
		this.exportResultEl = contentEl.createDiv({ cls: "setting-item" });
		this.exportResultEl.style.display = "block";
		this.exportResultEl.style.borderTop = "1px solid var(--background-modifier-border)";
		this.exportResultEl.style.paddingTop = "1em";
		this.exportResultEl.style.marginTop = "0.5em";

		this.exportResultEl.createEl("div", { text: lang.title }).style.fontWeight = "600";
		this.exportStatusEl = this.exportResultEl.createDiv({ cls: "setting-item-description", text: lang.empty });
		this.exportStatusEl.style.marginTop = "0.35em";
		this.exportStatusEl.style.whiteSpace = "pre-wrap";

		const progressWrap = this.exportResultEl.createDiv();
		progressWrap.style.marginTop = "0.75em";

		this.exportProgressTitleEl = progressWrap.createDiv();
		this.exportProgressTitleEl.style.fontWeight = "600";
		this.exportProgressTitleEl.style.marginBottom = "0.35em";

		this.exportProgressValueEl = progressWrap.createEl("progress");
		this.exportProgressValueEl.max = 1;
		this.exportProgressValueEl.value = 0;
		this.exportProgressValueEl.style.width = "100%";
		this.exportProgressValueEl.style.height = "1rem";

		this.exportProgressSubEl = progressWrap.createDiv({ cls: "setting-item-description" });
		this.exportProgressSubEl.style.marginTop = "0.35em";
		this.exportProgressSubEl.style.whiteSpace = "pre-wrap";

		const linkRow = this.exportResultEl.createDiv();
		linkRow.style.display = "flex";
		linkRow.style.gap = "0.5em";
		linkRow.style.marginTop = "0.75em";

		this.exportLinkInput = linkRow.createEl("input");
		this.exportLinkInput.type = "text";
		this.exportLinkInput.readOnly = true;
		this.exportLinkInput.placeholder = lang.noLink;
		this.exportLinkInput.style.flex = "1";

		this.exportCopyButton = new ButtonComponent(linkRow);
		this.exportCopyButton.setButtonText(lang.copy);
		this.exportCopyButton.setDisabled(true);
		this.exportCopyButton.onClick(async () =>
		{
			const link = this.exportLinkInput?.value ?? "";
			if (!link) return;
			await navigator.clipboard.writeText(link);
			new Notice(lang.copied, 3000);
		});
	}

	private setExportRunning(running: boolean)
	{
		if (!this.exportButton) return;
		this.exportButton.setDisabled(running);
		this.exportButton.buttonEl.style.opacity = running ? "0.5" : "1";
	}

	private showExportStatus(message: string)
	{
		if (this.exportStatusEl) this.exportStatusEl.setText(message);
		if (this.exportProgressTitleEl) this.exportProgressTitleEl.setText("");
		if (this.exportProgressSubEl) this.exportProgressSubEl.setText("");
		if (this.exportLinkInput) this.exportLinkInput.value = "";
		this.exportCopyButton?.setDisabled(true);
	}

	private showExportProgress(fraction: number, message: string, subMessage: string, progressColor: string)
	{
		if (this.exportProgressValueEl)
		{
			this.exportProgressValueEl.value = fraction;
			this.exportProgressValueEl.style.setProperty("--accent", progressColor);
			this.exportProgressValueEl.style.color = progressColor;
		}

		if (this.exportProgressTitleEl)
		{
			const percent = Math.round(fraction * 100);
			this.exportProgressTitleEl.setText(`${percent}% ${message}`);
		}

		if (this.exportProgressSubEl)
		{
			this.exportProgressSubEl.setText(subMessage);
		}
	}

	private showExportResult(result: ExportModalResult | undefined)
	{
		const lang = i18n.exportModal.result;
		if (!result)
		{
			this.showExportStatus(lang.cancelled);
			return;
		}

		if (result.error)
		{
			this.showExportStatus(lang.failed + "\n" + result.error);
			return;
		}

		const publishResult = result.publishResult;
		let message = `${lang.finished}\n${result.exportPath.path}`;

		if (publishResult)
		{
			message += `\n${lang.uploaded}: ${publishResult.uploadedCount}`;
			if (publishResult.failedCount > 0) message += `\n${lang.failedCount}: ${publishResult.failedCount}`;
			if (publishResult.warnings.length > 0) message += "\n" + publishResult.warnings.slice(0, 3).join("\n");
		}

		if (this.exportStatusEl) this.exportStatusEl.setText(message);
		this.showExportProgress(1, lang.finished, result.exportPath.path, "var(--interactive-accent)");

		if (publishResult?.presignedUrl && this.exportLinkInput)
		{
			this.exportLinkInput.value = publishResult.presignedUrl;
			this.exportCopyButton?.setDisabled(false);
		}
		else if (this.exportLinkInput)
		{
			this.exportLinkInput.value = "";
			this.exportLinkInput.placeholder = lang.noLink;
			this.exportCopyButton?.setDisabled(true);
		}
	}

	onClose() 
	{
		const { contentEl } = this;
		contentEl.empty();
		this.isClosed = true;
		ExportModal.title = i18n.exportModal.title;
	}
}
