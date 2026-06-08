import { i18n } from "./language";

export const language: i18n =
{
	cancel: "取消",
	browse: "浏览",
	pathInputPlaceholder: "输入或浏览路径...",
	pathValidations:
	{
		noEmpty: "路径不能为空",
		mustExist: "路径不存在",
		noTilde: "不允许使用带有波浪号 (~) 的主目录",
		noAbsolute: "路径不能是绝对路径",
		noRelative: "路径不能是相对路径",
		noFiles: "路径不能是文件",
		noFolders: "路径不能是文件夹",
		mustHaveExtension: "路径必须包含扩展名: {0}",
	},
	updateAvailable: "有更新可用",
	exportAsHTML: "导出为HTML",
	exportModal:
	{
		title: "导出为HTML",
		exportAsTitle: "将 {0} 导出为HTML",
		moreOptions: "更多选项请查看插件设置页面。",
		openAfterExport: "导出后打开",
		exportButton: "导出",
		cloudPublish: {
			title: "本次云发布",
			description: "这些选项只影响本次导出，不会写回插件设置。",
			disabled: "关闭",
			presignedUrl: "预签名 URL",
			revocableLink: "可撤销链接",
			keepLocalFiles: "云发布后保留本地 HTML 文件",
			keepLocalFilesDescription: "关闭后，仅在本次云发布成功后删除本次导出的本地产物。",
			expireSeconds: "过期秒数",
			expireSecondsDescription: "仅用于本次导出的预签名 URL，最大支持 604800 秒。",
			expireSecondsError: "请输入正整数。",
		},
		result: {
			title: "导出结果",
			empty: "导出完成后会在这里显示发布链接。",
			running: "正在后台导出并发布...",
			finished: "导出完成",
			failed: "导出失败",
			cancelled: "导出已取消",
			uploaded: "已上传",
			failedCount: "上传失败",
			noLink: "暂无可复制链接",
			copy: "复制链接",
			copied: "链接已复制",
		},
		filePicker:
		{
			title: "选择导出库中的所有文件",
			selectAll: "全选",
			save: "保存",
		},
		currentSite:
		{
			noSite: "此路径当前不包含已导出的网站。",
			oldSite: "此路径包含使用不同插件版本创建的导出内容。",
			pathContainsSite: "站点",
			fileCount: "文件数量",
			lastExported: "最后导出时间",
		},
		exportMode: {
			title: "导出模式",
			online: "如果您的文件将通过HTTP服务器在线访问，请使用此选项。",
			local: "这将导出一个包含所有内容的单个（较大）HTML文件。仅适用于离线共享。",
			rawDocuments: "导出普通的HTML文档，带有简单的样式和脚本，但无额外功能。",
		},
		purgeExport: {
			description: "清除站点缓存以重新导出所有文件。",
			clearCache: "清除缓存",
			confirmation: "您确定吗？",
			clearWarning: "此操作将删除站点的元数据（但不会删除所有导出的HTML文件）。\n\n这将强制站点重新导出所有文件。\n\n此外，如果您在再次导出之前更改了选定的导出文件，某些文件可能会保留在文件系统中未使用。\n\n此操作不可撤销。",
		},
	},
	settings:
	{
		title: "HTML导出设置",
		support: "支持该插件的持续开发。",
		debug: "将调试信息复制到剪贴板",
		unavailableSetting: "⚠️ 此功能在 {0} 模式下不可用。",
		pageFeatures: {
			title: "页面功能",
			description: "控制导出页面的各种功能。"
		},
		baseFeatures:
		{
			info_selector: "用于定位元素的CSS选择器。功能将相对于该元素放置。",
			info_type: "该功能将放置在该元素之前、之后，还是内部（开头或结尾）。",
			info_displayTitle: "功能上方显示的描述性标题",
			info_featurePlacement: "将此功能放置在页面上的位置（相对于选择器）。",
		},
		document: {
			title: "文档",
			description: "控制文档本身的设置",
			info_allowFoldingLists: "是否允许列表折叠",
			info_allowFoldingHeadings: "是否允许标题折叠",
			info_documentWidth: "文档的宽度"
		},
		sidebars: {
			title: "侧边栏",
			description: "包含文件导航、大纲、主题切换、图形视图等所有其他功能。",
			info_allowResizing: "是否允许用户调整侧边栏的大小",
			info_allowCollapsing: "是否允许用户折叠侧边栏",
			info_rightDefaultWidth: "右侧边栏的默认宽度",
			info_leftDefaultWidth: "左侧边栏的默认宽度"
		},
		fileNavigation: {
			title: "文件导航",
			description: "显示一个文件树，用于浏览导出的库。",
			info_showCustomIcons: "为树中的每个文件显示一个自定义图标",
			info_showDefaultFolderIcons: "为树中的每个文件夹显示一个默认图标",
			info_showDefaultFileIcons: "为树中的每个文件显示一个默认图标",
			info_defaultFolderIcon: "用于文件夹的图标。使用'lucide//'前缀使用Lucide图标",
			info_defaultFileIcon: "用于文件的图标。使用'lucide//'前缀使用Lucide图标",
			info_defaultMediaIcon: "用于媒体文件的图标。使用'lucide//'前缀使用Lucide图标",
			info_exposeStartingPath: "在页面首次加载时是否显示文件树中的当前文件"
		},
		outline: {
			title: "大纲",
			description: "显示当前文档的标题列表。",
			info_startCollapsed: "大纲是否开始折叠？",
			info_minCollapseDepth: "应折叠标题的最小深度"
		},
		graphView: {
			title: "图形视图",
			description: "显示您的库的可视化交互表示。（注意：此功能仅适用于托管在Web服务器上的导出）",
			info_showOrphanNodes: "显示未连接到任何其他节点的节点。",
			info_showAttachments: "将附件（如图像和PDF）显示为图中的节点。",
			info_allowGlobalGraph: "允许用户查看所有节点的全局图。",
			info_allowExpand: "允许用户将图形视图弹出至全屏显示。",
			info_attractionForce: "链接节点之间的吸引力有多大？吸引力越大，图形将显得越集中。",
			info_linkLength: "节点之间的链接应有多长？链接越短，节点将聚集得更紧密。",
			info_repulsionForce: "节点之间的排斥力有多大？排斥力越大，分离的节点将分散得越远。",
			info_centralForce: "节点被吸引到中心的程度有多大？吸引力越大，图形看起来越密集和呈圆形。",
			info_edgePruning: "超过此阈值长度的边将不会显示，但仍然参与图形计算。这有助于大型复杂图形显得更加有序。悬停在节点上时，仍会显示这些链接。",
			info_minNodeRadius: "最小节点的大小是多少？节点越小，吸引其他节点的力量越小。",
			info_maxNodeRadius: "最大节点的大小是多少？节点大小取决于它们的链接数量。节点越大，吸引其他节点的力量越大。这有助于围绕最重要的节点形成良好的分组。"
		},
		search: {
			title: "搜索栏",
			description: "允许您搜索库，列出匹配的文件和标题。（注意：此功能仅适用于托管在Web服务器上的导出）",
			placeholder: "搜索..."
		},
		linkPreview: {
			title: "链接预览",
			description: "当鼠标悬停在指向其他文档的内部链接上时显示预览。"
		},
		themeToggle: {
			title: "主题切换",
			description: "允许动态切换暗色和亮色主题。"
		},
		customHead: {
			title: "自定义HTML / JS",
			description: "插入一个指定的HTML文件到页面上，可包含自定义JS或CSS。",
			info_sourcePath: "包含的本地HTML文件路径。",
			validationError: "必须是一个指向HTML文件的路径。"
		},
		backlinks: {
			title: "反向链接",
			description: "显示链接到当前文档的所有文档。"
		},
		tags: {
			title: "标签",
			description: "显示当前打开文档的标签。",
			info_showInlineTags: "在页面顶部显示文档内定义的标签。",
			info_showFrontmatterTags: "在页面顶部显示文档前置区域定义的标签。"
		},
		aliases: {
			title: "别名",
			description: "显示当前文档的别名。"
		},
		properties: {
			title: "属性",
			description: "以表格形式显示当前文档的所有属性。",
			info_hideProperties: "要从属性视图中隐藏的属性列表"
		},
		rss: {
			title: "RSS",
			description: "为导出的站点生成RSS源",
			info_siteUrl: "此站点将托管的URL",
			info_siteUrlPlaceholder: "https://example.com/mysite",
			info_authorName: "站点作者的名称"
		},
		styleOptionsSection: {
			title: "样式选项",
			description: "配置导出中包含的样式"
		},
		makeOfflineCompatible: {
			title: "使页面离线兼容",
			description: "下载所有在线资源、图像、脚本，使页面可以离线查看，或者使网站不依赖CDN。"
		},
		includePluginCSS: {
			title: "包含插件的CSS",
			description: "在导出的HTML中包含以下插件的CSS。如果插件功能未正确呈现，请尝试将插件添加到此列表中。避免无必要添加插件，因为更多的CSS会增加页面的加载时间。"
		},
		includeStyleCssIds: {
			title: "包含特定ID的样式",
			description: "在导出的HTML中包含带有以下ID的样式标签的CSS。"
		},
		generalSettingsSection: {
			title: "通用设置",
			description: "控制网站图标和站点元数据等简单设置",
		},
		favicon: {
			title: "网站图标",
			description: "站点的网站图标的本地路径",
		},
		siteName: {
			title: "站点名称",
			description: "库/导出站点的名称",
		},
		iconEmojiStyle: {
			title: "图标表情符号样式",
			description: "用于自定义图标的表情符号样式",
		},
		themeName: {
			title: "主题",
			description: "导出使用的已安装主题",
		},
		exportSettingsSection: {
			title: "导出设置",
			description: "控制更多技术性导出设置，如控制链接的生成方式",
		},
		relativeHeaderLinks: {
			title: "使用相对标题链接",
			description: "为标题使用相对链接而不是绝对链接",
		},
		slugifyPaths: {
			title: "路径别名化",
			description: "使所有路径和文件名符合网络风格（小写，无空格）",
		},
		addPageIcon: {
			title: "添加页面图标",
			description: "在页面标题中添加文件的图标",
		},
		cloudPublishSettingsSection: {
			title: "云发布",
			description: "将导出的 HTML 上传到 Cloudflare R2，并可选择生成访问链接。",
		},
		cloudPublishEnabled: {
			title: "导出后上传",
			description: "开启后，本地导出成功时会继续上传到 Cloudflare R2。",
		},
		cloudUploadStrategy: {
			title: "上传策略",
			description: "自动模式会在单文件导出时上传单个 HTML，在普通网站导出时上传整个导出目录。",
			options: {
				"自动": "auto",
				"单个 HTML": "single-html",
				"整个目录": "directory",
			},
		},
		r2AccountId: {
			title: "R2 Account ID",
			description: "Endpoint URL 为空时，用于自动生成 R2 endpoint。",
		},
		r2EndpointUrl: {
			title: "R2 Endpoint URL",
			description: "可选的 S3 兼容 endpoint。留空时使用 Account ID 自动生成。",
		},
		r2Bucket: {
			title: "R2 Bucket",
			description: "接收导出文件的 bucket。",
		},
		r2KeyPrefix: {
			title: "R2 Key 前缀",
			description: "上传 object key 前追加的可选前缀。",
		},
		r2AccessKeyId: {
			title: "R2 Access Key ID",
			description: "Cloudflare R2 的 S3 access key ID。",
		},
		r2SecretAccessKey: {
			title: "R2 Secret Access Key",
			description: "会以明文形式保存在本地插件配置中。",
		},
		cloudPublishMode: {
			title: "发布模式",
			description: "可撤销链接模式为后续 Worker + KV 实现预留。",
			options: {
				"预签名 URL": "presigned-url",
				"可撤销链接": "revocable-link",
			},
		},
		createPresignedUrl: {
			title: "生成预签名 URL",
			description: "上传后为导出入口 HTML 生成预签名 URL。",
		},
		presignedUrlExpireSeconds: {
			title: "预签名 URL 过期秒数",
			description: "最大支持 604800 秒。",
			validationError: "请输入正整数。",
		},
		workerBaseUrl: {
			title: "Worker Base URL",
			description: "为可撤销链接预留，第一版暂不使用。",
		},
		workerAdminToken: {
			title: "Worker Admin Token",
			description: "为可撤销链接预留，会以明文形式保存在本地插件配置中。",
		},
		revocableLinkReserved: {
			title: "可撤销链接",
			description: "当前已预留接口，但 Worker + KV 可撤销链接第一版暂不实现。",
		},
		webdavUrl: {
			title: "WebDAV URL",
			description: "用于下载远端配置的 WebDAV 目录 URL。",
		},
		webdavUsername: {
			title: "WebDAV 用户名",
			description: "可选的 Basic Auth 用户名。",
		},
		webdavPassword: {
			title: "WebDAV 密码",
			description: "可选的 Basic Auth 密码，会以明文形式保存在本地插件配置中。",
		},
		webdavRemotePath: {
			title: "WebDAV 远端路径",
			description: "WebDAV URL 下的远端 JSON 配置路径。",
		},
		webdavDownloadCloud: {
			title: "下载云发布配置",
			description: "从 WebDAV 下载配置，并且只覆盖云发布相关设置。",
			button: "下载云发布配置",
		},
		webdavDownloadAll: {
			title: "覆盖全部插件配置",
			description: "从 WebDAV 下载配置，确认后覆盖完整插件设置。",
			button: "覆盖全部",
		},
		obsidianSettingsSection: {
			title: "Obsidian设置",
			description: "控制插件在Obsidian中的运行方式",
		},
		logLevel: {
			title: "日志级别",
			description: "设置在控制台中显示的日志级别",
		},
		titleProperty: {
			title: "标题属性",
			description: "用作文档标题的属性",
		},
	}
}
