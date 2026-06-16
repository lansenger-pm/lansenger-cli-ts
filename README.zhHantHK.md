[English](README.md) | [简体中文](README.zhHans.md) | [繁体中文](README.zhHant.md) | [繁体中文香港](README.zhHantHK.md) | [Français](README.fr.md)

# Lansenger CLI (TypeScript)

Lansenger 命令列工具 — 在終端機直接呼叫藍信開放平台 API，發送訊息、管理群組、查詢人員/部門、操作行事曆與待辦等。

命令語法與 Python/Go 版完全一致，安裝任一版本即可使用。

## 安裝

```bash
npm install -g lansenger-cli
```

或從原始碼安裝：

```bash
git clone https://github.com/lansenger-pm/lansenger-cli-ts.git
cd lansenger-cli-ts
npm install
npm run build
npm link
```

需要 Node.js ≥ 18.0.0。

## 快速開始

### 1. 設定憑證

透過 `config set` 命令儲存憑證（按 profile 隔離儲存在 `~/.lansenger/sdk_state.json`，密鑰脫敏顯示，檔案權限 0600）：

```bash
lansenger config set app_id YOUR_APP_ID
lansenger config set app_secret YOUR_APP_SECRET
lansenger config set api_gateway_url https://apigw.lx.qianxin.com/open/apigw
```

**OAuth2 使用者認證（需要取得 userToken 時填寫）**：

```bash
lansenger config set passport_url https://passport.lx.qianxin.com
lansenger config set redirect_uri http://localhost:8765   # OAuth2 回呼地址（預設值）
```

**回呼接收（需要解析/驗簽回呼 Webhook 時填寫）**：

```bash
lansenger config set encoding_key YOUR_ENCODING_KEY
lansenger config set callback_token YOUR_CALLBACK_TOKEN
```

也可以透過環境變數設定（適合 CI/CD 或臨時使用）：

```bash
export LANSENGER_APP_ID=YOUR_APP_ID
export LANSENGER_APP_SECRET=YOUR_APP_SECRET
export LANSENGER_ENCODING_KEY=YOUR_ENCODING_KEY
export LANSENGER_CALLBACK_TOKEN=YOUR_CALLBACK_TOKEN
```

### 2. 檢視設定

```bash
lansenger config show
```

### 3. 健康檢查

驗證憑證是否正確、能否成功取得 app token：

```bash
lansenger health check
```

## 命令總覽

| 命令組 | 說明 | 子命令 |
|--------|------|--------|
| `config` | 管理憑證設定 | `set`, `show`, `clear`, `list-profiles`, `delete-profile`, `list-users` |
| `message` | 發送與管理訊息 | `send-text`, `send-markdown`, `send-file`, `send-image-url`, `send-link-card`, `send-app-articles`, `send-app-card`, `send-oacard`, `send-bot-message`, `send-group-message`, `send-account-message`, `send-user-message`, `update-dynamic-card`, `revoke`, `query-groups`, `send-reminder` |
| `group` | 管理群組 | `create`, `info`, `members`, `list`, `check`, `update`, `update-members`, `dismiss` |
| `staff` | 查詢人員資訊 | `basic-info`, `detail`, `ancestors`, `id-mapping`, `org-extra-fields`, `search`, `org-info` |
| `department` | 查詢部門資訊 | `detail`, `children`, `staffs` |
| `calendar` | 行事曆操作 | `primary`, `create-schedule`, `fetch-schedule`, `delete-schedule`, `list-schedules`, `attendees`, `add-attendees`, `delete-attendees`, `update-schedule`, `attendee-meta` |
| `todo` | 待辦任務管理 | `create`, `update`, `update-status`, `delete`, `list`, `fetch-by-id`, `fetch-by-source`, `status-counts`, `executor-status`, `add-executors`, `delete-executors`, `executor-list` |
| `oauth` | OAuth2 使用者認證 | `authorize-url`, `exchange-code`, `refresh-token`, `user-info`, `parse-callback`, `validate-state` |
| `callback` | 回呼事件解析 | `parse-payload`, `decrypt-payload`, `verify-signature`, `event-types` |
| `media` | 媒體檔案操作 | `upload`, `upload-app`, `download`, `download-to-file`, `path` |
| `streaming` | 串流訊息（AI 場景） | `create`, `fetch` |
| `chat` | 會話與訊息記錄 | `list`, `messages` |
| `health` | 連線健康檢查 | `check` |

## 常用範例

### 訊息發送

```bash
# 發送純文字訊息
lansenger message send-text chat123 "Hello World"

# 發送 Markdown 訊息
lansenger message send-markdown chat123 "**粗體** 文字"

# 發送檔案
lansenger message send-file chat123 /path/to/file.pdf

# 發送網路圖片
lansenger message send-image-url chat123 https://example.com/photo.jpg

# 發送連結卡片
lansenger message send-link-card chat123 "公告標題" https://example.com --desc "點擊檢視詳情"

# 發送應用卡片
lansenger message send-app-card chat123 "卡片標題" --content "正文內容" --card-link https://example.com

# 發送多條圖文（appArticles）
lansenger message send-app-articles chat123 '{"title":"文章1","url":"https://a.com"}' '{"title":"文章2","url":"https://b.com"}'

# 發送 OA 審批卡片
lansenger message send-oacard chat123 "審批標題" --head "審批通知" --field '{"key":"申請人","value":"張三"}'

# 群組內發送並 @all
lansenger message send-text group123 "全員通知" --group --mention-all

# 群組內 @指定人
lansenger message send-text group123 "請檢視" --group --mention staff001

# 機械人通道發送訊息
lansenger message send-bot-message text '{"content":"通知內容"}' --chat-id user001 --chat-id user002

# 群組訊息通道發送（user_token 可選，無則顯示為 bot）
lansenger message send-group-message group123 text '{"content":"群組訊息"}'

# 以人類使用者身份發送（需要 user_token）
lansenger message send-group-message group123 text '{"content":"群組訊息"}' --user-token YOUR_USER_TOKEN --sender-id staff001

# 應用帳號通道發送
lansenger message send-account-message text '{"content":"帳號訊息"}' --chat-id user001 --account-id acct001

# 使用者通道發送（需要 user_token）
lansenger message send-user-message user001 text '{"content":"私聊訊息"}' --user-token YOUR_USER_TOKEN

# 撤回訊息
lansenger message revoke msg001 msg002

# 發送提醒
lansenger message send-reminder msg001 --type 1 --type 2 --user staff001 --user staff002

# 查詢群 ID 列表
lansenger message query-groups --page 1 --size 100
```

### 群組管理

```bash
# 建立群組
lansenger group create "專案群" org001 --staff staff001 --staff staff002

# 檢視群組資訊
lansenger group info group123

# 檢視群組成員
lansenger group members group123

# 檢視群組列表（bot 可檢視所在的群組，傳 user_token 可檢視使用者所在的群組）
lansenger group list

# 檢視使用者所在的群組列表（需要 user_token）
lansenger group list --user-token YOUR_USER_TOKEN

# 檢查使用者是否在群組內
lansenger group check group123 --staff-id staff001

# 更新群組資訊
lansenger group update group123 --name "新名稱" --desc "新描述"

# 新增/移除成員
lansenger group update-members group123 --add staff003 --remove staff001
```

### 人員查詢

```bash
# 檢視人員基本資訊
lansenger staff basic-info staff001

# 檢視人員詳細資訊
lansenger staff detail staff001

# 搜尋人員
lansenger staff search 張三

# ID 對映（手機號/電子郵件 → staffId）
lansenger staff id-mapping org001 phone 13800138000

# 檢視組織資訊
lansenger staff org-info org001
```

### 部門查詢

```bash
# 檢視部門詳情
lansenger department detail dept001

# 檢視子部門
lansenger department children dept001

# 檢視部門內人員
lansenger department staffs dept001
```

### 會話與訊息記錄

```bash
# 取得會話列表（需要 user_token）
lansenger chat list --user-token YOUR_USER_TOKEN

# 只看群組聊天
lansenger chat list --type 2 --user-token YOUR_USER_TOKEN

# 搜尋會話（關鍵詞）
lansenger chat list --keyword 張三 --user-token YOUR_USER_TOKEN

# 取得私聊訊息記錄
lansenger chat messages --staff-id staff001 --user-token YOUR_USER_TOKEN

# 取得群組聊天訊息記錄（bot 可直接取得所在群組的訊息）
lansenger chat messages --group-id group123

# 取得群組聊天訊息記錄（以使用者身份，需要 user_token）
lansenger chat messages --group-id group123 --user-token YOUR_USER_TOKEN
```

### 行事曆操作

```bash
# 取得主行事曆
lansenger calendar primary --user-token YOUR_USER_TOKEN

# 建立排程（start/end 為秒級時間戳）
lansenger calendar create-schedule cal001 "週會" 1747539600 1747543200 \
  '[{"staffId":"staff001","attendeeFlag":"yes"}]' \
  --desc "每週例會" --user-token YOUR_USER_TOKEN

# 檢視排程列表
lansenger calendar list-schedules cal001 1747539600 1747603200 --user-token YOUR_TOKEN

# 檢視排程詳情
lansenger calendar fetch-schedule cal001 schedule001 --user-token YOUR_TOKEN

# 刪除排程
lansenger calendar delete-schedule cal001 schedule001 --user-token YOUR_TOKEN
```

### 待辦任務

```bash
# 建立待辦
lansenger todo create "審批檔案" https://app.com/doc https://app.com/doc \
  "staff001,staff002" org001 --desc "請審批" --type 2

# 更新待辦狀態（11=待閱, 12=已閱, 21=待辦, 22=已辦）
lansenger todo update-status task001 22 org001

# 更新執行人狀態
lansenger todo executor-status '[{"executorId":"staff001","status":"22"}]' org001 --task-id task001

# 檢視待辦列表
lansenger todo list org001 --status 21,22

# 刪除待辦
lansenger todo delete task001 org001
```

### OAuth2 使用者認證

```bash
# 產生授權 URL
lansenger oauth authorize-url https://yourapp.com/callback --scope basic_userinfor

# 交換 code 取得 user token
lansenger oauth exchange-code AUTH_CODE --redirect-uri https://yourapp.com/callback

# 刷新 user token
lansenger oauth refresh-token YOUR_REFRESH_TOKEN

# 取得使用者資訊
lansenger oauth user-info YOUR_USER_TOKEN

# 解析 OAuth2 回呼 URL 參數
lansenger oauth parse-callback "code=xxx&state=yyy"

# 驗證回呼 state 參數
lansenger oauth validate-state yyy yyy
```

### 回呼事件

```bash
# 檢視所有回呼事件類型
lansenger callback event-types

# 解析回呼資料
lansenger callback parse-payload ENCRYPTED_DATA --encoding-key YOUR_KEY

# 解密回呼資料
lansenger callback decrypt-payload ENCRYPTED_DATA --encoding-key YOUR_KEY

# 驗證簽章
lansenger callback verify-signature TIMESTAMP NONCE SIGNATURE --encoding-key YOUR_KEY
```

### 媒體檔案

```bash
# 上載檔案
lansenger media upload /path/to/file.pdf --media-type 3

# 上載應用/機械人媒體檔案
lansenger media upload-app /path/to/file.pdf --media-type file

# 下載媒體檔案到本地
lansenger media download-to-file MEDIA_ID --output /path/to/save.pdf
```

### 串流訊息

```bash
# 建立串流訊息（用於 AI agent 漸進式輸出）
lansenger streaming create user123 single stream-session-001

# 取得串流訊息狀態
lansenger streaming fetch MSG_ID
```

## 全域選項

| 選項 | 說明 |
|------|------|
| `--json` / `-j` | 輸出原始 JSON 格式而非表格 |
| `--profile` / `-P` | 指定憑證 profile（預設 `default`） |
| `--as <staff_id>` | 從憑證儲存中自動載入並自動刷新指定 staff_id 的 user token |

```bash
# JSON 格式輸出（便於指令稿處理）
lansenger -j staff basic-info staff001

# 使用指定 profile
lansenger -P my-bot message send-text chat123 "Hello"
```

## 多應用/多機械人設定（Profile）

CLI 支援多 profile，每個 profile 對應一個 appID（一個應用或一個機械人），憑證互相隔離：

```bash
# 設定第一個應用（個人機械人）
lansenger config set app_id xxx1 --profile my-bot
lansenger config set app_secret xxx1 --profile my-bot

# 設定第二個應用（藍信應用）
lansenger config set app_id xxx2 --profile my-app
lansenger config set app_secret xxx2 --profile my-app
lansenger config set encoding_key yyy2 --profile my-app
lansenger config set callback_token zzz2 --profile my-app

# 切換應用執行命令
lansenger -P my-bot message send-text chat123 "Hello"
lansenger -P my-app callback parse-payload DATA

# 檢視所有已設定 profile
lansenger config list-profiles

# 刪除指定 profile（如為當前 active 則自動切換到 default）
lansenger config delete-profile my-bot

# 檢視某個 profile 詳情
lansenger config show --profile my-app
```

## 憑證安全

- 憑證按 profile 隔離儲存在 `~/.lansenger/sdk_state.json`，檔案權限 0600
- `config show` 對所有密鑰類欄位脫敏顯示（`***`），僅 `api_gateway_url` 和 `passport_url` 明文展示
- 支援環境變數 `LANSENGER_APP_ID` / `LANSENGER_APP_SECRET` / `LANSENGER_ENCODING_KEY` / `LANSENGER_CALLBACK_TOKEN`，適合 CI/CD 場景

## 身份與權限

### 身份能力矩陣

藍信平台有三種身份類型，對應不同的 API 存取權限：

| Command Domain | Personal Bot | Org App (Self-built) | Org App + Bot | 說明 |
|--------|:---:|:---:|:---:|------|
| `message send-text/markdown/file/...` (bot DM) | **Y** | N | **Y** | 僅 bot 可傳送 bot 私聊 |
| `message send-text --group` (group chat) | N* | N | **Y** | 個人機械人 API 支援，但暫無加群功能 |
| `message send-group-message` | N* | N | **Y** | 同上 |
| `message send-account-message` (public account) | N | **Y** | **Y** | 需要公眾號能力 |
| `message send-user-message` (user-to-user) | N | **Y** | **Y** | 需要 userToken + OAuth2 |
| `message revoke` | **Y** | **Y** | **Y** | 撤回自己的訊息 |
| `staff *` (contacts read-only) | N | **Y** | **Y** | `search` 額外需要 userToken |
| `department *` | N | **Y** | **Y** | 僅組織級應用 |
| `calendar *` | N | **Y** | **Y** | 有 userToken = 使用者身份；無 = bot 身份 |
| `todo *` | N | **Y** | **Y** | 僅組織級應用 |
| `chat list/messages` | N | **Y** | **Y** | 僅組織級應用 |
| `group *` (group management V2) | N | N | **Y** | 需要 bot 在群組內 |
| `media upload` | **Y** | **Y** | **Y** | 通用上載 |
| `media upload-app` | N | **Y** | **Y** | 僅自建應用（非 ISV） |
| `media download/path` | **Y** | **Y** | **Y** | 通用下載 |
| `oauth *` | N | **Y** | **Y** | 僅組織級應用 |
| `streaming *` | N | **Y** | **Y** | 僅組織級應用 |
| `callback *` (event parsing) | N/A | N/A | N/A | 純資料操作，無身份要求 |

> \* **N\*** = API 能力存在，但加群功能暫未上線。

> **Personal Bot** 只能收發訊息和上載下載檔案，無法存取通訊錄、群組、行事曆或 OAuth2。
>
> **Org App vs Org App + Bot**：使用相同的 appID/appSecret，唯一區別是訊息通道——只有 bot 才能傳送 bot 私聊和群組訊息（因為只有 bot 能加入群組）。所有其他 API（通訊錄、行事曆、待辦、會話、OAuth2、串流訊息）兩者功能完全一致。目前僅自建應用支援 bot 能力。

### 開發者中心權限

除了身份類型，特定 API 呼叫還取決於藍信開發者中心的權限開關。組織可能限制開發者存取，需要管理員協助。

**基礎權限（預設開啟）：**

| 權限 | 說明 |
|------|------|
| 取得使用者基本資訊 | 取得人員基本資訊，用於系統/應用登入 |
| 傳送通知訊息 | 取得組織訊息通道，向人員/群組傳送訊息 |

**進階權限（預設關閉，需手動開啟）：**

| 權限 | 說明 | 影響的命令 |
|------|------|-------------|
| 通訊錄唯讀 | 通訊錄讀取權限 | `staff`、`department` |
| 通訊錄編輯 | 通訊錄編輯權限 | `staff`（建立/更新/刪除） |
| 敏感資訊 - 手機號 | 存取使用者手機號 | `staff`（detail、id-mapping） |
| 敏感資訊 - 電子郵件 | 存取使用者電子郵件 | `staff`（detail、id-mapping） |
| 敏感資訊 - 證件號 | 存取使用者證件號 | `staff` |
| 敏感資訊 - 工號 | 存取使用者工號 | `staff` |
| 唯一屬性對應 staffId | 將手機號/電子郵件/工號對應為 staffId | `staff`（id-mapping） |
| 應用編輯 | 建立和更新應用 | 開發者中心管理 |
| 群組唯讀 | 群組讀取權限 | `group`（查詢資訊/成員） |
| 群組編輯 | 群組編輯權限 | `group`（建立/更新/解散/成員） |
| 行事曆唯讀 | 行事曆與排程讀取權限 | `calendar`（查詢） |
| 行事曆編輯 | 行事曆與排程編輯權限 | `calendar`（建立/更新/刪除） |
| 上載媒體 | 上載媒體檔案權限 | `media`（upload、upload-app） |
| 工作台範本讀取 | 工作台範本讀取權限 | — |
| 工作台範本寫入 | 工作台範本寫入權限 | — |

遇到權限錯誤時，請首先確認身份類型是否支援該操作，然後提示使用者在開發者中心開啟相應的進階權限（如無法存取請聯絡組織管理員）。

## CLI 相容性

本 TS 版 CLI 與 Python 版、Go 版命令語法完全一致：

```bash
# Python CLI
pip install lansenger-cli

# Go CLI
go install github.com/lansenger-pm/lansenger-sdk-go/cmd/lansenger@latest

# TypeScript CLI
npm install -g lansenger-cli

# 三者使用相同的命令語法
lansenger message send-text chat123 "Hello"
```

## 與 SDK 的關係

本 CLI 基於 [lansenger-sdk-ts](https://github.com/lansenger-pm/lansenger-sdk-ts) 的 `LansengerClient` 實作，覆蓋 SDK 全部 API，不修改 SDK 程式碼。

## 授權條款

MIT License
