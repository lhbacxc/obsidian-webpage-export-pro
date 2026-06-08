import { i18n } from "./language";

export const language: i18n = 
{
	cancel: "Cancel",
	browse: "Browse",
	pathInputPlaceholder: "Type or browse a path...",
	pathValidations:
	{
		noEmpty: "Path cannot be empty",
		mustExist: "Path does not exist",
		noTilde: "Home directory with tilde (~) is not allowed",
		noAbsolute: "Path cannot be absolute",
		noRelative: "Path cannot be relative",
		noFiles: "Path cannot be a file",
		noFolders: "Path cannot be a directory",
		mustHaveExtension: "Path must have ext: {0}",
	},
	updateAvailable: "Update Available",
	exportAsHTML: "Export as HTML",
	viewCloudPublishHistory: "View cloud publish link history",
	cloudPublishHistory: {
		title: "Cloud Publish Link History",
		empty: "No cloud publish link history yet.",
		search: "Search note name",
		searchPlaceholder: "Type a note name...",
		all: "All",
		noMatches: "No link history matches the current filters.",
		linkType: "Link type",
		presignedUrl: "Presigned URL",
		revocableLink: "Revocable link",
		entryKey: "Entry object key",
		createdAt: "Created at",
		expiresIn: "Expires in",
		expiresAt: "Expires at",
		uploadedCount: "Uploaded count",
		status: "Status",
		active: "Active",
		expired: "Expired",
		copy: "Copy",
		copied: "Link copied",
	},
	exportModal: 
	{
		title: "Export to HTML",
		exportAsTitle: "Export {0} as HTML",
		moreOptions: "More options located on the plugin settings page.",
		openAfterExport: "Open after export",
		exportButton: "Export",
		cloudPublish: {
			title: "Cloud publish for this export",
			description: "These options only affect this export and are not saved to plugin settings.",
			disabled: "Off",
			presignedUrl: "Presigned URL",
			revocableLink: "Revocable link",
			keepLocalFiles: "Keep local HTML files after cloud publish",
			keepLocalFilesDescription: "When disabled, this export's local output is deleted only after cloud publish succeeds.",
			expireSeconds: "Expiry seconds",
			expireSecondsDescription: "Used only for this export's presigned URL. Maximum supported value is 604800 seconds.",
			expireSecondsError: "Enter a positive integer.",
		},
		result: {
			title: "Export result",
			empty: "The publish link will appear here after export.",
			running: "Exporting and publishing in the background...",
			finished: "Export finished",
			failed: "Export failed",
			cancelled: "Export cancelled",
			uploaded: "Uploaded",
			failedCount: "Upload failed",
			noLink: "No link to copy yet",
			copy: "Copy link",
			copied: "Link copied",
		},
		sizeEstimate: {
			title: "Export size estimate",
			loading: "Calculating estimated HTML size...",
			noFiles: "Select files to export.",
			estimated: "Estimated final HTML",
			risk: "Risk",
			riskLow: "Low",
			riskMedium: "Medium, may take longer",
			riskHigh: "High, may keep Obsidian exporting for a long time",
			files: "Selected files",
			pages: "Estimated pages",
			attachments: "Estimated attachments",
			mediaEmbeds: "Media embeds",
			inlineMedia: "Media inlining",
			combinedMetadata: "Single-file metadata wrapper",
			attachmentMetadata: "Attachment data wrapper",
			highRiskHint: "Consider directory export, or disable media inlining before exporting.",
			cancelExport: "Cancel export",
			cancelling: "Cancelling...",
			failed: "Size estimate failed",
		},
		filePicker: 
		{
			title: "Select all files in exported vault",
			selectAll: "Select All",
			save: "Save",
		},
		currentSite: 
		{
			noSite: "This path currently contains no exported website.",
			oldSite: "This path contains an export created with a different version of the plugin.",
			pathContainsSite: "Site",
			fileCount: "File count",
			lastExported: "Last exported",
		},
		exportMode: {
			title: "Export Mode",
			online: "Use this if your files will be accessed online (via an http server).",
			local: "This will export a single (large) html file containing the whole export. Only use this for offline sharing.",
			rawDocuments: "Export plain html documents with simple style and scripts but no additional features.",
		},
		purgeExport:
		{
			description: "Clear the site cache to re-export all files.",
			clearCache: "Clear Cache",
			confirmation: "Are you sure?",
			clearWarning: "This will delete the site metadata (but not all the exported html).\n\nThis will force the site to re-export all files.\n\nAlso if you change which files are selected for export before exporting again some files may be left on your file system unused.\n\nThis action cannot be undone.",
		},
	},
	settings: 
	{
		title: "HTML Export Settings",
		support: "Support the continued development of this plugin.",
		debug: "Copy debug info to clipboard",
		unavailableSetting: "⚠️ This feature is not available in {0} mode.",
		pageFeatures: {
			title: "Page Features",
			description: "Control various features of the exported page."
		},
		baseFeatures:
		{
			info_selector: "CSS selector for an element. The feature will be placed relative to this element.",
			info_type: "Will this feature be placed before, after, or inside (at the beggining or end).",
			info_displayTitle: "Descriptive title to show above the feature",
			info_featurePlacement: "Where to place this feature on the page. (Relative to the selector)",
		},
		document: {
			title: "Document",
			description: "Control settings on the document itself",
			info_allowFoldingLists: "Whether or not to allow lists to be folded",
			info_allowFoldingHeadings: "Whether or not to allow headings to be folded",
			info_documentWidth: "The width of the document"
		},
		sidebars: {
			title: "Sidebars",
			description: "Holds all the other features like the file nav, outline, theme toggle, graph view, etc...",
			info_allowResizing: "Whether or not to allow the sidebars to be resized",
			info_allowCollapsing: "Whether or not to allow the sidebars to be collapsed",
			info_rightDefaultWidth: "The default width of the right sidebar",
			info_leftDefaultWidth: "The default width of the left sidebar"
		},
		fileNavigation: {
			title: "File Navigation",
			description: "Shows a file tree used to explore the exported vault.",
			info_showCustomIcons: "Show custom icons for files and folders",
			info_showDefaultFolderIcons: "Show a default icon of a folder for every folder in the tree",
			info_showDefaultFileIcons: "Show a default icon of a file for every file in the tree",
			info_defaultFolderIcon: "The icon to use for folders. Prefix with 'lucide//' to use a Lucide icon",
			info_defaultFileIcon: "The icon to use for files. Prefix with 'lucide//' to use a Lucide icon",
			info_defaultMediaIcon: "The icon to use for media files. Prefix with 'lucide//' to use a Lucide icon",
			info_exposeStartingPath: "Whether or not to show the current file in the file tree when the page is first loaded"
		},
		outline: {
			title: "Outline", 
			description: "Shows a list of the open document's headers.",
			info_startCollapsed: "Should the outline start collapsed?",
			info_minCollapseDepth: "Only allow outline items to be collapsed if they are at least this many levels deep in the tree."
		},
		graphView: {
			title: "Graph View",
			description: "Shows a visual, interactive representation of your vault. (NOTE: this is only available for exports hosted on a web server)",
			info_showOrphanNodes: "Show nodes that are not connected to any other nodes.",
			info_showAttachments: "Show attachments like images and PDFs as nodes in the graph.",
			info_allowGlobalGraph: "Allow the user to view the global graph of all nodes.",
			info_allowExpand: "Allow the user to pop-out the graph view to take up the whole screen",
			info_attractionForce: "How much should linked nodes attract each other? This will make the graph appear more clustered.",
			info_linkLength: "How long should the links between nodes be? The shorter the links the more connected nodes will cluster together.",
			info_repulsionForce: "How much should nodes repel each other? This will make disconnected parts more spread out.",
			info_centralForce: "How much should nodes be attracted to the center? This will make the graph appear more dense and circular.",
			info_edgePruning: "Edges with a length above this threshold will not be rendered, however they will still contribute to the simulation. This can help large tangled graphs look more organised. Hovering over a node will still display these links.",
			info_minNodeRadius: "How small should the smallest nodes be? The smaller a node is the less it will attract other nodes.",
			info_maxNodeRadius: "How large should the largest nodes be? Nodes are sized by how many links they have. The larger a node is the more it will attract other nodes. This can be used to create a good grouping around the most important nodes."
		},
		search: {
			title: "Search Bar",
			description: "Allows you search the vault, listing matching files and headers. (NOTE: this is only available for exports hosted on a web server)",
			placeholder: "Search..."
		},
		linkPreview: {
			title: "Link Previews",
			description: "Show hover previews when you hover over internal links to other documents."
		},
		themeToggle: {
			title: "Theme Toggle",
			description: "Allows you to switch between dark and light theme dynamically."
		},
		customHead: {
			title: "Custom HTML / JS",
			description: "Insert a given .html file onto the page which can include custom JS or CSS",
			info_sourcePath: "The local path to the source .html file which will be included.",
			validationError: "Must be a path to a .html file"
		},
		backlinks: {
			title: "Backlinks",
			description: "Displays all the documents which link to the currently opened document."
		},
		tags: {
			title: "Tags",
			description: "Displays the tags for the currently opened document.",
			info_showInlineTags: "Show tags defined inside the document at the top of the page.",
			info_showFrontmatterTags: "Show tags defined in the frontmatter of the document at the top of the page."
		},
		aliases: {
			title: "Aliases",
			description: "Displays the aliases for the currently opened document."
		},
		properties: {
			title: "Properties",
			description: "Displays all the properties of the currently opened document as a table.",
			info_hideProperties: "A list of properties to hide from the properties view"
		},
		rss: {
			title: "RSS",
			description: "Generate an RSS feed for the exported site",
			info_siteUrl: "The url that this site will be hosted at",
			info_siteUrlPlaceholder: "https://example.com/mysite",
			info_authorName: "The name of the author of the site"
		},
		styleOptionsSection: {
			title: "Style Options",
			description: "Configure which styles are included with the export"
		},
		makeOfflineCompatible: {
			title: "Make Offline Compatible",
			description: "Download any online assets / images / scripts so the page can be viewed offline. Or so the website does not depend on a CDN."
		},
		includePluginCSS: {
			title: "Include CSS from Plugins",
			description: "Include the CSS from the following plugins in the exported HTML. If plugin features aren't rendering correctly, try adding the plugin to this list. Avoid adding plugins unless you specifically notice a problem, because more CSS will increase the loading time of your page."
		},
		includeStyleCssIds: {
			title: "Include Styles with IDs",
			description: "Include CSS from style tags with the following IDs in the exported HTML"
		},
		generalSettingsSection:{
			title: "General Settings",
			description: "Control simple settings like the favicon and site metadata",
		},
		favicon: {
			title: "Favicon image",
			description: "The local path to the favicon for the site",
		},
		siteName: {
			title: "Site Name",
			description: "The name of the vault / exported site",
		},
		iconEmojiStyle: {
			title: "Icon emoji style",
			description: "The style of emoji to use for custom icons",
		},
		themeName: {
			title: "Theme",
			description: "The installed theme to use for the export",
		},
		exportSettingsSection: {
			title: "Export Settings",
			description: "Control more technical export settings like controling how links are generated",
		},
		relativeHeaderLinks: {
			title: "Use Relative Header Links",
			description: "Use relative links for headers instead of absolute links",
		},
		slugifyPaths: {
			title: "Slugify Paths",
			description: "Make all paths and file names web style (lowercase, no spaces)",
		},
		addPageIcon: {
			title: "Add Page Icon",
			description: "Add the file's icon to the page header",
		},
		cloudPublishSettingsSection: {
			title: "Cloud Publish",
			description: "Upload exported HTML to Cloudflare R2 and optionally create a public access URL.",
		},
		cloudPublishEnabled: {
			title: "Upload after export",
			description: "When enabled, a successful local export will be uploaded to Cloudflare R2.",
		},
		cloudUploadStrategy: {
			title: "Upload strategy",
			description: "Auto uploads a single HTML file for combined exports, or the whole export directory for normal websites.",
			options: {
				"Auto": "auto",
				"Single HTML": "single-html",
				"Directory": "directory",
			},
		},
		r2AccountId: {
			title: "R2 Account ID",
			description: "Used to build the default R2 endpoint when Endpoint URL is empty.",
		},
		r2EndpointUrl: {
			title: "R2 Endpoint URL",
			description: "Optional S3-compatible endpoint. Leave empty to use the Account ID endpoint.",
		},
		r2Bucket: {
			title: "R2 Bucket",
			description: "Bucket that receives exported files.",
		},
		r2KeyPrefix: {
			title: "R2 Key Prefix",
			description: "Optional prefix added before uploaded object keys.",
		},
		r2AccessKeyId: {
			title: "R2 Access Key ID",
			description: "Cloudflare R2 S3 access key ID.",
		},
		r2SecretAccessKey: {
			title: "R2 Secret Access Key",
			description: "Stored locally in plugin data as plain text.",
		},
		cloudPublishMode: {
			title: "Publish mode",
			description: "Revocable links are reserved for a future Worker + KV implementation.",
			options: {
				"Presigned URL": "presigned-url",
				"Revocable link": "revocable-link",
			},
		},
		createPresignedUrl: {
			title: "Create presigned URL",
			description: "Create a presigned URL for the exported entry HTML after upload.",
		},
		presignedUrlExpireSeconds: {
			title: "Presigned URL expiry seconds",
			description: "Maximum supported value is 604800 seconds.",
			validationError: "Enter a positive integer.",
		},
		workerBaseUrl: {
			title: "Worker Base URL",
			description: "Reserved for revocable links. Not used by the first implementation.",
		},
		workerAdminToken: {
			title: "Worker Admin Token",
			description: "Reserved for revocable links. Stored locally as plain text.",
		},
		revocableLinkReserved: {
			title: "Revocable links",
			description: "The interface is reserved, but Worker + KV revocable links are not implemented yet.",
		},
		webdavUrl: {
			title: "WebDAV URL",
			description: "Base WebDAV directory URL used to download remote config.",
		},
		webdavUsername: {
			title: "WebDAV Username",
			description: "Optional Basic Auth username.",
		},
		webdavPassword: {
			title: "WebDAV Password",
			description: "Optional Basic Auth password. Stored locally as plain text.",
		},
		webdavRemotePath: {
			title: "WebDAV Remote Path",
			description: "Remote JSON config path under the WebDAV URL.",
		},
		webdavDownloadCloud: {
			title: "Download cloud publish config",
			description: "Download WebDAV config and only overwrite Cloud Publish settings.",
			button: "Download cloud config",
		},
		webdavDownloadAll: {
			title: "Overwrite all plugin settings",
			description: "Download WebDAV config and overwrite the full plugin settings after confirmation.",
			button: "Overwrite all",
		},
		obsidianSettingsSection: {
			title: "Obsidian Settings",
			description: "Control how the plugin functions inside Obsidian",
		},
		logLevel: {
			title: "Log Level",
			description: "Set the level of logging to display in the console",
		},
		titleProperty: {
			title: "Title Property",
			description: "The property to use as the title of the document",
		},
	}
}
