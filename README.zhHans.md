[English](README.md) | [简体中文](README.zhHans.md) | [繁体中文](README.zhHant.md) | [繁体中文香港](README.zhHantHK.md) | [Français](README.fr.md)

# Lansenger CLI (TypeScript)

蓝信（Lansenger）命令行工具 — 在终端直接调用蓝信开放平台 API，发送消息、管理群组、查询人员/部门、操作日程与待办等。

命令语法与 Python/Go 版完全一致，安装任一版本即可使用。

## 安装

```bash
npm install -g lansenger-cli
```

或从源码安装：

```bash
git clone https://github.com/lansenger-pm/lansenger-cli-ts.git
cd lansenger-cli-ts
npm install
npm run build
npm link
```

需要 Node.js ≥ 18.0.0。

## 快速开始

### 1. 配置凭证

通过 `config set` 命令保存凭证（按 profile 隔离存储在 `~/.lansenger/sdk_state.json`，密钥脱敏显示，文件权限 0600）：

```bash
lansenger config set app_id YOUR_APP_ID
lansenger config set app_secret YOUR_APP_SECRET
lansenger config set api_gateway_url https://apigw.lx.qianxin.com/open/apigw   # 私有部署需修改
```

**OAuth2 用户认证（需要获取 userToken 时填写）**：

```bash
lansenger config set passport_url https://passport.lx.qianxin.com
lansenger config set redirect_uri http://localhost:8765   # OAuth2 回调地址（默认值）
```

**回调接收（需要解析/验签回调 Webhook 时填写）**：

```bash
lansenger config set encoding_key YOUR_ENCODING_KEY
lansenger config set callback_token YOUR_CALLBACK_TOKEN
```

也可以通过环境变量配置（适合 CI/CD 或临时使用）：

```bash
export LANSENGER_APP_ID=YOUR_APP_ID
export LANSENGER_APP_SECRET=YOUR_APP_SECRET
export LANSENGER_ENCODING_KEY=YOUR_ENCODING_KEY
export LANSENGER_CALLBACK_TOKEN=YOUR_CALLBACK_TOKEN
```

### 2. 查看配置

```bash
lansenger config show
```

### 3. 健康检查

验证凭证是否正确、能否成功获取 app token：

```bash
lansenger health check
```

## 命令总览

| 命令组 | 说明 | 子命令 |
|--------|------|--------|
| `config` | 管理凭证配置 | `set`, `show`, `clear`, `list-profiles`, `delete-profile`, `list-users` |
| `message` | 发送与管理消息 | `send-text`, `send-markdown`, `send-file`, `send-image-url`, `send-link-card`, `send-app-articles`, `send-app-card`, `send-oacard`, `send-bot-message`, `send-group-message`, `send-account-message`, `send-user-message`, `update-dynamic-card`, `revoke`, `query-groups`, `send-reminder` |
| `group` | 管理群组 | `create`, `info`, `members`, `list`, `check`, `update`, `update-members`, `dismiss` |
| `staff` | 查询人员信息 | `basic-info`, `detail`, `ancestors`, `id-mapping`, `org-extra-fields`, `search`, `org-info` |
| `department` | 查询部门信息 | `detail`, `children`, `staffs` |
| `calendar` | 日程操作 | `primary`, `create-schedule`, `fetch-schedule`, `delete-schedule`, `list-schedules`, `attendees`, `add-attendees`, `delete-attendees`, `update-schedule`, `attendee-meta` |
| `todo` | 待办任务管理 | `create`, `update`, `update-status`, `delete`, `list`, `fetch-by-id`, `fetch-by-source`, `status-counts`, `executor-status`, `add-executors`, `delete-executors`, `executor-list` |
| `oauth` | OAuth2 用户认证 | `authorize-url`, `exchange-code`, `refresh-token`, `user-info`, `parse-callback`, `validate-state` |
| `callback` | 回调事件解析 | `parse-payload`, `decrypt-payload`, `verify-signature`, `event-types` |
| `media` | 媒体文件操作 | `upload`, `upload-app`, `download`, `download-to-file`, `path` |
| `streaming` | 流式消息（AI 场景） | `create`, `fetch` |
| `chat` | 会话与消息记录 | `list`, `messages` |
| `health` | 连接健康检查 | `check` |

## 常用示例

### 发送消息

```bash
# 发送文本消息
lansenger message send-text chat123 "Hello World"

# 发送 Markdown 消息
lansenger message send-markdown chat123 "**Bold** text"

# 发送文件
lansenger message send-file chat123 /path/to/file.pdf

# 发送带图片 URL 的消息
lansenger message send-image-url chat123 https://example.com/photo.jpg

# 发送链接卡片
lansenger message send-link-card chat123 "公告标题" https://example.com --desc "点击查看详情"

# 发送应用卡片
lansenger message send-app-card chat123 "卡片标题" --content "正文内容" --card-link https://example.com

# 发送多条图文（appArticles）
lansenger message send-app-articles chat123 '{"title":"文章1","url":"https://a.com"}' '{"title":"文章2","url":"https://b.com"}'

# 发送 OA 审批卡片
lansenger message send-oacard chat123 "审批标题" --head "审批通知" --field '{"key":"申请人","value":"张三"}' --link https://app.com/approve

# 群内发送并 @all
lansenger message send-text group123 "全员通知" --group --mention-all

# 群内 @指定人
lansenger message send-text group123 "请查看" --group --mention staff001 --mention staff002

# @提及群中的特定机器人
lansenger message send-text group123 "Bot check" --group --mention-bot bot001 --mention-bot bot002

# 回复消息（消息引用）
lansenger message send-text group123 "Got it" --group --ref-msg-id 524288-xxx

# 机器人通道发送消息
lansenger message send-bot-message text '{"content":"通知内容"}' --chat-id user001 --chat-id user002

# 机器人通道回复（消息引用）
lansenger message send-bot-message text '{"content":"Reply"}' --chat-id user001 --ref-msg-id 524288-xxx

# 群消息通道发送（user_token 可选，无则显示为 bot）
lansenger message send-group-message group123 text '{"content":"群消息"}'

# 以人类用户身份发送（需要 user_token）
lansenger message send-group-message group123 text '{"content":"群消息"}' --user-token YOUR_USER_TOKEN --sender-id staff001

# 应用账号通道发送
lansenger message send-account-message text '{"content":"账号消息"}' --chat-id user001 --account-id acct001

# 用户通道发送（需要 user_token）
lansenger message send-user-message user001 text '{"content":"私聊消息"}' --user-token YOUR_USER_TOKEN

# 撤回消息
lansenger message revoke msg001 msg002

# 发送提醒
lansenger message send-reminder msg001 --type 1 --type 2 --user staff001 --user staff002

# 查询群 ID 列表
lansenger message query-groups --page 0 --size 100
```

### 群组管理

```bash
# 创建群组
lansenger group create "项目群" org001 --staff staff001 --staff staff002

# 查看群信息
lansenger group info group123

# 查看群成员
lansenger group members group123

# 查看群列表（bot 可查看所在的群，传 user_token 可查看用户所在的群）
lansenger group list

# 查看用户所在的群列表（需要 user_token）
lansenger group list --user-token YOUR_USER_TOKEN

# 检查用户是否在群内
lansenger group check group123 --staff-id staff001

# 更新群信息
lansenger group update group123 --name "新名称" --desc "新描述"

# 添加/移除成员
lansenger group update-members group123 --add staff003 --remove staff001
```

### 人员查询

```bash
# 查看人员基本信息
lansenger staff basic-info staff001

# 查看人员详细信息
lansenger staff detail staff001

# 搜索人员
lansenger staff search 张三

# 手机号/邮箱映射 staff ID
lansenger staff id-mapping org001 phone 13800138000

# 查看组织信息
lansenger staff org-info org001
```

### 部门查询

```bash
# 查看部门详情
lansenger department detail dept001

# 查看子部门
lansenger department children dept001

# 查看部门内人员
lansenger department staffs dept001
```

### 会话与消息记录

```bash
# 获取会话列表（需要 user_token）
lansenger chat list --user-token YOUR_USER_TOKEN

# 只看群聊
lansenger chat list --type 2 --user-token YOUR_USER_TOKEN

# 搜索会话（关键词）
lansenger chat list --keyword 张三 --user-token YOUR_USER_TOKEN

# 获取私聊消息记录
lansenger chat messages --staff-id staff001 --user-token YOUR_USER_TOKEN

# 获取群聊消息记录（bot 可直接获取所在群的消息）
lansenger chat messages --group-id group123

# 获取群聊消息记录（以用户身份，需要 user_token）
lansenger chat messages --group-id group123 --user-token YOUR_USER_TOKEN
```

### 日程操作

```bash
# 获取主日历
lansenger calendar primary --user-token YOUR_USER_TOKEN

# 创建日程（start/end 为秒级时间戳）
lansenger calendar create-schedule cal001 "周会" 1747539600 1747543200 \
  '[{"staffId":"staff001","attendeeFlag":"yes"}]' \
  --desc "每周例会" --user-token YOUR_USER_TOKEN

# 查看日程列表（start/end 为秒级时间戳）
lansenger calendar list-schedules cal001 1747539600 1747603200 --user-token YOUR_TOKEN

# 查看日程详情
lansenger calendar fetch-schedule cal001 schedule001 --user-token YOUR_TOKEN

# 删除日程
lansenger calendar delete-schedule cal001 schedule001 --user-token YOUR_TOKEN
```

### 待办任务

```bash
# 创建待办
lansenger todo create "审批文档" https://app.com/doc https://app.com/doc \
  "staff001,staff002" org001 --desc "请审批" --type 2

# 更新待办状态（11=待阅, 12=已阅, 21=待办, 22=已办）
lansenger todo update-status task001 22 org001

# 更新执行人状态
lansenger todo executor-status '[{"executorId":"staff001","status":"22"}]' org001 --task-id task001

# 查看待办列表
lansenger todo list org001 --status 21,22

# 删除待办
lansenger todo delete task001 org001
```

### OAuth2 用户认证

```bash
# 生成授权 URL
lansenger oauth authorize-url https://yourapp.com/callback --scope basic_userinfor

# 交换 code 获取 user token
lansenger oauth exchange-code AUTH_CODE --redirect-uri https://yourapp.com/callback

# 刷新 user token
lansenger oauth refresh-token YOUR_REFRESH_TOKEN

# 获取用户信息
lansenger oauth user-info YOUR_USER_TOKEN

# 解析 OAuth2 回调 URL 参数
lansenger oauth parse-callback "code=xxx&state=yyy"

# 验证回调 state 参数
lansenger oauth validate-state yyy yyy
```

### 回调事件

```bash
# 查看所有回调事件类型
lansenger callback event-types

# 解析回调数据
lansenger callback parse-payload ENCRYPTED_DATA --encoding-key YOUR_KEY

# 解密回调数据（仅解密不解析）
lansenger callback decrypt-payload ENCRYPTED_DATA --encoding-key YOUR_KEY

# 验证签名
lansenger callback verify-signature TIMESTAMP NONCE SIGNATURE --encoding-key YOUR_KEY
```

### 媒体文件

```bash
# 上传文件
lansenger media upload /path/to/file.pdf --media-type 3

# 上传应用/机器人媒体文件
lansenger media upload-app /path/to/file.pdf --media-type file

# 下载媒体文件到本地
lansenger media download-to-file MEDIA_ID --output /path/to/save.pdf
```

### 流式消息

```bash
# 创建流式消息（用于 AI agent 渐进式输出）
lansenger streaming create user123 single stream-session-001

# 获取流式消息状态
lansenger streaming fetch MSG_ID
```

## 全局选项

| 选项 | 说明 |
|------|------|
| `--json` / `-j` | 输出原始 JSON 格式而非表格 |
| `--profile` / `-P` | 指定凭证 profile（默认 `default`） |
| `--as <staff_id>` | 从凭证存储中自动加载并自动刷新指定 staff_id 的 user token |

```bash
# JSON 格式输出（便于脚本处理）
lansenger -j staff basic-info staff001

# 使用指定 profile
lansenger -P my-bot message send-text chat123 "Hello"
```

## 多应用/多机器人配置（Profile）

CLI 支持多 profile，每个 profile 对应一个 appID（一个应用或一个机器人），凭证互相隔离：

```bash
# 配置第一个应用（个人机器人）
lansenger config set app_id xxx1 --profile my-bot
lansenger config set app_secret xxx1 --profile my-bot

# 配置第二个应用（蓝信应用）
lansenger config set app_id xxx2 --profile my-app
lansenger config set app_secret xxx2 --profile my-app
lansenger config set encoding_key yyy2 --profile my-app
lansenger config set callback_token zzz2 --profile my-app

# 切换应用执行命令
lansenger -P my-bot message send-text chat123 "Hello"
lansenger -P my-app callback parse-payload DATA

# 查看所有已配置 profile
lansenger config list-profiles

# 删除指定 profile（如为当前 active 则自动切换到 default）
lansenger config delete-profile my-bot

# 查看某个 profile 详情
lansenger config show --profile my-app
```

## 凭证安全

- 凭证按 profile 隔离存储在 `~/.lansenger/sdk_state.json`，文件权限 0600
- `config show` 对所有密钥类字段脱敏显示（`***`），仅 `api_gateway_url` 和 `passport_url` 明文展示
- 支持环境变量 `LANSENGER_APP_ID` / `LANSENGER_APP_SECRET` / `LANSENGER_ENCODING_KEY` / `LANSENGER_CALLBACK_TOKEN`，适合 CI/CD 场景

## 身份与权限

### 身份能力矩阵

蓝信平台有三种身份类型，对应不同的 API 访问权限：

| Command Domain | Personal Bot | Org App (Self-built) | Org App + Bot | 说明 |
|--------|:---:|:---:|:---:|------|
| `message send-text/markdown/file/...` (bot DM) | **Y** | N | **Y** | 仅 bot 可发送 bot 私聊 |
| `message send-text --group` (group chat) | **Y** | N | **Y** | 个人机器人现已支持群聊 |
| `message send-group-message` | **Y** | N | **Y** | 同上 |
| `message send-account-message` (public account) | N | **Y** | **Y** | 需要公众号能力 |
| `message send-user-message` (user-to-user) | N | **Y** | **Y** | 需要 userToken + OAuth2 |
| `message revoke` | **Y** | **Y** | **Y** | 撤回自己的消息 |
| `staff *` (contacts read-only) | N | **Y** | **Y** | `search` 额外需要 userToken |
| `department *` | N | **Y** | **Y** | 仅组织级应用 |
| `calendar *` | N | **Y** | **Y** | 有 userToken = 用户身份；无 = bot 身份 |
| `todo *` | N | **Y** | **Y** | 仅组织级应用 |
| `chat list/messages` | N | **Y** | **Y** | 仅组织级应用 |
| `group *` (group management V2) | N | N | **Y** | 需要 bot 在群内 |
| `media upload` | **Y** | **Y** | **Y** | 通用上传 |
| `media upload-app` | **Y** | **Y** | **Y** | 仅自建应用（非 ISV） |
| `media download/path` | **Y** | **Y** | **Y** | 通用下载 |
| `oauth *` | N | **Y** | **Y** | 仅组织级应用 |
| `streaming *` | N | **Y** | **Y** | 仅组织级应用 |
| `callback *` (event parsing) | N/A | N/A | N/A | 纯数据操作，无身份要求 |


> **Personal Bot** 只能收发消息和上传下载文件，无法访问通讯录、日历或 OAuth2。
>
> **Org App vs Org App + Bot**：使用相同的 appID/appSecret，唯一区别是消息通道——只有 bot 才能发送 bot 私聊和群消息（因为只有 bot 能加入群组）。所有其他 API（通讯录、日历、待办、会话、OAuth2、流式消息）两者功能完全一致。目前仅自建应用支持 bot 能力。

### 开发者中心权限

除了身份类型，特定 API 调用还取决于蓝信开发者中心的权限开关。组织可能限制开发者访问，需要管理员协助。

**基础权限（默认开启）：**

| 权限 | 说明 |
|------|------|
| 获取用户基本信息 | 获取人员基本信息，用于系统/应用登录 |
| 发送通知消息 | 获取组织消息通道，向人员/群组发送消息 |

**高级权限（默认关闭，需手动开启）：**

| 权限 | 说明 | 影响的命令 |
|------|------|-------------|
| 通讯录只读 | 通讯录读取权限 | `staff`、`department` |
| 通讯录编辑 | 通讯录编辑权限 | `staff`（创建/更新/删除） |
| 敏感信息 - 手机号 | 访问用户手机号 | `staff`（detail、id-mapping） |
| 敏感信息 - 邮箱 | 访问用户邮箱 | `staff`（detail、id-mapping） |
| 敏感信息 - 证件号 | 访问用户证件号 | `staff` |
| 敏感信息 - 工号 | 访问用户工号 | `staff` |
| 唯一属性映射staffId | 将手机号/邮箱/工号映射为 staffId | `staff`（id-mapping） |
| 应用编辑 | 创建和更新应用 | 开发者中心管理 |
| 群组只读 | 群组读取权限 | `group`（查询信息/成员） |
| 群组编辑 | 群组编辑权限 | `group`（创建/更新/解散/成员） |
| 日历只读 | 日历与日程读取权限 | `calendar`（查询） |
| 日历编辑 | 日历与日程编辑权限 | `calendar`（创建/更新/删除） |
| 上传媒体 | 上传媒体文件权限 | `media`（upload、upload-app） |
| 工作台模板读取 | 工作台模板读取权限 | — |
| 工作台模板写入 | 工作台模板写入权限 | — |

遇到权限错误时，请首先确认身份类型是否支持该操作，然后提示用户在开发者中心开启相应的高级权限（如无法访问请联系组织管理员）。

## CLI 兼容性

本 TS 版 CLI 与 Python 版、Go 版命令语法完全一致：

```bash
# Python CLI
pip install lansenger-cli

# Go CLI
go install github.com/lansenger-pm/lansenger-sdk-go/cmd/lansenger@latest

# TypeScript CLI
npm install -g lansenger-cli

# 三者使用相同的命令语法
lansenger message send-text chat123 "Hello"
```

## 与 SDK 的关系

本 CLI 基于 [lansenger-sdk-ts](https://github.com/lansenger-pm/lansenger-sdk-ts) 的 `LansengerClient` 实现，覆盖 SDK 全部 API，不修改 SDK 代码。

## 许可证

MIT License
