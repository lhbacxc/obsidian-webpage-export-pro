# 云发布链接历史命令设计

## 背景

当前云发布会在导出面板内显示本次生成的预签名 URL，但关闭面板后没有统一入口查看已经发布过的链接。用户希望在 Obsidian 命令面板中执行一个命令，查看所有导出文件的发布入口链接、过期时间和到期时间。

## 目标

- 在命令面板新增一个查看云发布链接历史的命令。
- 每次预签名 URL 发布成功后，记录一条入口链接历史。
- 同一入口 HTML 文件名只占一栏；重新导出同名笔记时，用新链接替换旧记录。
- 历史面板显示链接类型、R2 object key、创建时间、过期秒数、到期时间和状态。
- 历史面板支持按笔记名搜索，并支持按状态筛选全部、未过期和已过期记录。
- 未过期记录显示链接和复制按钮。
- 已过期记录只显示“已过期”，不再展示旧链接。

## 非目标

- 不实现预签名 URL 续期。预签名 URL 生成后无法修改，续期本质是重新生成新 URL，本轮不做。
- 不重新上传文件。
- 不实现 Worker + KV 可撤销链接。可撤销链接仍沿用当前预留状态。
- 不为目录导出的每个资源文件分别生成链接。历史记录只对应入口 HTML。

## 数据结构

在插件设置中新增 `cloudPublishHistory` 数组，记录内容包括：

- `id`：本地历史记录 ID。
- `linkType`：链接类型，当前主要为 `presigned-url`。
- `url`：未过期时可复制的链接。
- `entryKey`：入口 HTML 对应的 R2 object key。
- `exportPath`：本地导出路径。
- `createdAt`：生成链接的时间戳。
- `expiresInSeconds`：本次链接过期秒数。
- `expiresAt`：到期时间戳。
- `uploadedCount`：本次上传成功数量。

历史记录保存在 Obsidian 插件数据中，随 `SettingsPage.saveSettings()` 持久化。

历史记录按入口 HTML 文件名归并。归并时只取 `entryKey` 的最后一段文件名，例如 `prefix/CFR2 测试文件.html` 和 `CFR2 测试文件.html` 都归为 `CFR2 测试文件.html`。新记录会替换旧记录；旧数据加载时也会自动折叠为同名最新一条。

## 交互设计

命令面板新增命令：

- `View cloud publish link history`

执行后打开 Modal：

- 无记录时显示空状态。
- 顶部显示搜索框，按入口 HTML 文件名进行不区分大小写的模糊匹配。
- 顶部显示状态筛选器，默认 `全部`，可切换为 `未过期` 或 `已过期`。
- 搜索和状态筛选组合生效；无匹配结果时显示空结果提示。
- 按创建时间倒序展示记录。
- 未过期记录显示只读链接输入框和复制按钮。
- 已过期记录显示“已过期”，不显示旧链接。

## 实现位置

- `src/plugin/main.ts`：注册命令。
- `src/plugin/exporter.ts`：云发布成功后写入入口链接历史。
- `src/plugin/cloud-publish/cloud-publish-history.ts`：定义历史类型、清洗和追加逻辑。
- `src/plugin/settings/cloud-publish-history-modal.ts`：展示历史 Modal。
- `src/plugin/settings/settings.ts`：新增历史设置字段，加载时清洗。
- `src/plugin/translations/*`：新增面板文案。
- `项目概览.md`：同步功能说明、改动记录和限制。

## 验证计划

- 执行 `npm run build`，确认 TypeScript 与生产构建通过。
- 执行 `git diff --check`，确认没有空白错误。
