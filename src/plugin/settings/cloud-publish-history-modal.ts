import { Modal, Notice, Setting } from "obsidian";
import { Settings } from "./settings";
import { cloudPublishHistoryDisplayName, formatCloudPublishHistoryExpiry, isCloudPublishHistoryExpired, CloudPublishHistoryEntry } from "../cloud-publish/cloud-publish-history";
import { i18n } from "../translations/language";

type CloudPublishHistoryStatusFilter = "all" | "active" | "expired";

export class CloudPublishHistoryModal extends Modal {
	private searchQuery = "";
	private statusFilter: CloudPublishHistoryStatusFilter = "all";
	private listEl?: HTMLElement;

	constructor() {
		super(app);
	}

	onOpen() {
		const lang = i18n.cloudPublishHistory;
		const { contentEl } = this;

		this.titleEl.setText(lang.title);
		contentEl.empty();

		if (Settings.cloudPublishHistory.length === 0) {
			contentEl.createEl("p", { text: lang.empty, cls: "setting-item-description" });
			return;
		}

		this.renderFilters(contentEl);
		this.listEl = contentEl.createDiv();
		this.renderList();
	}

	private renderFilters(container: HTMLElement) {
		const lang = i18n.cloudPublishHistory;
		const filterWrap = container.createDiv();
		filterWrap.style.marginBottom = "1em";

		new Setting(filterWrap)
			.setName(lang.search)
			.addText((text) => {
				text.setPlaceholder(lang.searchPlaceholder);
				text.setValue(this.searchQuery);
				text.onChange((value) => {
					this.searchQuery = value;
					this.renderList();
				});
			})
			.addDropdown((dropdown) => {
				dropdown
					.addOption("all", lang.all)
					.addOption("active", lang.active)
					.addOption("expired", lang.expired)
					.setValue(this.statusFilter)
					.onChange((value) => {
						this.statusFilter = value as CloudPublishHistoryStatusFilter;
						this.renderList();
					});
			});
	}

	private renderList() {
		const list = this.listEl;
		if (!list) return;

		list.empty();
		const entries = this.filteredEntries();
		if (entries.length === 0) {
			list.createEl("p", { text: i18n.cloudPublishHistory.noMatches, cls: "setting-item-description" });
			return;
		}

		for (const entry of entries) {
			this.renderEntry(list, entry);
		}
	}

	private filteredEntries(): CloudPublishHistoryEntry[] {
		const query = this.searchQuery.trim().toLowerCase();
		return Settings.cloudPublishHistory.filter((entry) => {
			const displayName = cloudPublishHistoryDisplayName(entry).toLowerCase();
			const matchesSearch = !query || displayName.includes(query);
			if (!matchesSearch) return false;

			if (this.statusFilter === "all") return true;
			const expired = isCloudPublishHistoryExpired(entry);
			return this.statusFilter === "expired" ? expired : !expired;
		});
	}

	private renderEntry(container: HTMLElement, entry: CloudPublishHistoryEntry) {
		const lang = i18n.cloudPublishHistory;
		const expired = isCloudPublishHistoryExpired(entry);
		const status = expired ? lang.expired : lang.active;
		const linkType = entry.linkType === "revocable-link" ? lang.revocableLink : lang.presignedUrl;
		const createdAt = new Date(entry.createdAt).toLocaleString();
		const expiresAt = formatCloudPublishHistoryExpiry(entry);
		const displayName = cloudPublishHistoryDisplayName(entry);
		const description = [
			`${lang.linkType}: ${linkType}`,
			`${lang.entryKey}: ${entry.entryKey}`,
			`${lang.createdAt}: ${createdAt}`,
			`${lang.expiresIn}: ${entry.expiresInSeconds}s`,
			`${lang.expiresAt}: ${expiresAt}`,
			`${lang.uploadedCount}: ${entry.uploadedCount}`,
			`${lang.status}: ${status}`,
		].join("\n");

		const setting = new Setting(container)
			.setName(displayName)
			.setDesc(description);

		setting.descEl.style.whiteSpace = "pre-wrap";

		if (expired || !entry.url) return;

		setting.addText((text) => {
			text.setValue(entry.url ?? "");
			text.inputEl.readOnly = true;
			text.inputEl.style.width = "24em";
		});

		setting.addButton((button) => button
			.setButtonText(lang.copy)
			.onClick(async () => {
				await navigator.clipboard.writeText(entry.url ?? "");
				new Notice(lang.copied, 3000);
			}));
	}
}
