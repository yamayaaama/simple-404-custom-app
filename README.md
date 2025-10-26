# 404 Redirect App - 開発ログ

## 📌 プロジェクト概要

Shopifyアプリ開発の学習を目的とした、404ページのリダイレクト機能を持つアプリです。

**主な機能**:
- マーチャントが管理画面から404ページのリダイレクト先URLを設定可能
- Theme App Extensionで自動的に404ページに機能を注入
- 将来的にはShopify App Storeでの公開・収益化を目指す

---

## 🎯 開発目的

1. **学習**: Shopifyアプリ開発の全体像を理解する
2. **実践**: 段階的な実装で各コンポーネントの役割を体得
3. **公開**: App Store審査を通過できるレベルのアプリを完成させる

---

## 📅 開発進捗ログ

### 2024年10月16日（Day 1）

#### ✅ 完了した作業

**フェーズ1: データ層の構築**

1. **Prismaスキーマ設計**
   - `RedirectSettings` モデルを追加
   - フィールド構成:
     - `id`: UUID形式の主キー
     - `shop`: ショップドメイン（ユニーク制約）
     - `redirectUrl`: リダイレクト先URL
     - `isEnabled`: 有効/無効フラグ（デフォルト: true）
     - `createdAt`, `updatedAt`: タイムスタンプ

2. **マイグレーション実行**
   ```bash
   npx prisma migrate dev --name add_redirect_settings
   ```
   - マイグレーションファイル作成: `20251016143304_add_redirect_settings`
   - SQLiteデータベースにテーブル作成完了
   - Prisma Client自動生成完了

#### 📝 学んだこと

- Prismaのスキーマ定義方法
- マイグレーションの仕組み
- SQLiteの開発環境での利用方法
- データベースファイルの配置場所（`prisma/dev.sqlite`）
- `.gitignore`での機密情報保護の重要性

---

### 2024年10月17日（Day 2）

#### ✅ 完了した作業

**フェーズ2: バックエンドAPIの実装**

1. **APIルート作成**: `app/routes/api.redirect-setting.tsx`
   - POSTリクエストで設定を保存/更新
   - `prisma.upsert()`で既存データの更新または新規作成
   - レスポンス形式: `{ success: true, settings: {...} }`

**フェーズ3: 管理画面UIの実装**

2. **メイン管理画面の実装**: `app/routes/app._index.tsx`
   - Polaris Web Componentsを使用したUI構築
     - `<s-text-field>`: リダイレクト先URL入力
     - `<s-checkbox>`: 有効/無効の切り替え
     - `<s-button>`: 保存ボタン
   - `useFetcher()`でフォーム送信とローディング状態管理
   - トースト通知で保存成功を表示
   - デバッグ用セクション（保存結果と現在の設定表示）


#### 📝 学んだこと

- Polaris Web Componentsの使用方法とプロパティ名（React標準とは異なる場合がある）
- `useFetcher()`を使ったフォーム送信パターン
- Shopify App BridgeのToast API
- TypeScriptでのイベントハンドラー型安全性の確保
- Prismaの`upsert()`メソッドの活用
- React Routerのloader/action パターン

---

### 2025年10月18日（Day 3）

#### ✅ 完了した作業

**フェーズ4: App Proxyの実装**

1. **App Proxy エンドポイント作成**: `app/routes/api.proxy.settings.tsx`
   - Theme側から設定を取得できるAPIエンドポイント
   - クエリパラメータから`shop`を取得
   - Prismaでデータベースから設定を検索
   - JSON形式でレスポンスを返す
   - エラーハンドリング（shopパラメータ必須、デフォルト値）

2. **HMAC検証ユーティリティ作成**: `app/utils/verifyProxyHmac.ts`
   - Shopify App ProxyのHMAC署名を検証
   - HMAC-SHA256でセキュリティ確保
   - 不正なリクエストを拒否
   - 開発環境ではスキップ（直接テスト可能）

3. **shopify.app.toml にApp Proxy設定追加**
   ```toml
   [app_proxy]
   url = "https://YOUR_APP_URL/api/proxy"
   subpath = "404redirect"
   prefix = "apps"
   ```
   - Theme側から `/apps/404redirect/*` でアクセス可能に
   - Shopifyが自動的にアプリサーバーに転送
   - 署名を自動付与してセキュリティ確保

4. **動作確認テスト**
   - APIエンドポイントの正常動作を確認
   - エラーハンドリングのテスト
   - HMAC検証後の動作確認
   - App Proxy設定の反映確認

#### 📝 学んだこと

- **App Proxyの概念**
  - Proxyとは「間に入る中継役」
  - ShopifyがThemeとアプリサーバーを中継
  - セキュリティとCORS問題の解決
  - リアルタイムでデータの取得

- **HMAC検証の重要性**
  - Shopifyからのリクエストの正当性を証明
  - HMAC-SHA256による署名検証
  - パラメータをソートして署名を計算

- **URLのパース処理**
  - `new URL(request.url)`で文字列を構造化
  - `searchParams.get()`でクエリパラメータを取得
  - クエリパラメータはリクエスト側が設定

- **開発環境と本番環境の違い**
  - 開発環境では直接アクセス（HMAC検証スキップ）
  - 本番環境ではShopify経由（HMAC検証必須）
  - `process.env.NODE_ENV`で環境判定


---

### 2025年10月18日（Day 3 - 続き）

#### ✅ 完了した作業

**フェーズ5: Theme App Extensionの実装**

1. **Theme App Extensionの雛形作成**
   ```bash
   shopify app generate extension
   # Type: Theme app extension
   # Name: 404-redirect
   ```
   - `extensions/404-redirect/` ディレクトリ作成
   - `shopify.extension.toml` 設定ファイル生成

2. **Liquidテンプレートの実装**: `blocks/404-redirect.liquid`
   ```liquid
   {% comment %}
     404 Redirect Extension
     このブロックは404ページで自動的にリダイレクトを実行します
   {% endcomment %}
   
   <script src="{{ '404-redirect.js' | asset_url }}" defer></script>
   
   {% schema %}
   {
     "name": "404 Redirect",
     "settings": []
   }
   {% endschema %}
   ```

3. **JavaScript実装**: `assets/404-redirect.js`
   - 404ページ判定ロジック（タイトル、URL、コンテンツ）
   - App Proxy経由で設定取得（`/apps/404redirect/settings`）
   - リダイレクト実行（`window.location.href`）
   - エラーハンドリングとログ出力

4. **Theme App Extensionの有効化**
   - 管理画面で404ページにExtensionを追加
   - Theme Customizerで「404 Redirect」セクションを有効化
   - 動作確認テスト完了

5. **最終動作確認**
   - 404ページで自動リダイレクト実行
   - 設定されたURLへのリダイレクト成功

#### 📝 学んだこと

- **Theme App Extensionの仕組み**
  - Shopify CLIでのExtension生成方法
  - LiquidテンプレートとJavaScriptの連携
  - Theme CustomizerでのExtension有効化

- **404ページ判定の実装**
  - 複数の判定条件（タイトル、URL、コンテンツ）
  - 堅牢なエラーハンドリング
  - ユーザビリティを考慮した実装

- **App Proxyとの連携**
  - Theme側からApp Proxyへのアクセス

---

### 2025年10月18日（Day 3 - 最終日）

#### ✅ 完了した作業

**フェーズ6: テスト・改善・公開準備**

1. **エラーハンドリングの強化**
   - 管理画面のリアルタイムバリデーション実装
   - URL形式チェック機能追加
   - 詳細なエラーメッセージ表示
   - 保存ボタンの無効化（無効なURL時）

2. **ユーザビリティの改善**
   - 管理画面に詳細な説明セクション追加
   - 使用例のバナー表示
   - 現在の設定表示の視覚的改善
   - リンク機能（リダイレクト先URLをクリック可能）
   - 状態に応じたバナー表示（成功/警告）

3. **UI/UXの改善**
   - アイコンと色分けによる状態表示
   - ヘルプテキストの追加
   - ローディング状態の改善
   - エラー表示の改善（Banner使用）

4. **最終テスト完了**
   - 全機能の動作確認
   - エラーハンドリングのテスト
   - ユーザビリティのテスト
   - リンク機能のテスト

#### 📝 学んだこと

- **エラーハンドリングの重要性**
  - ユーザーフレンドリーなエラーメッセージ
  - リアルタイムバリデーション
  - 視覚的フィードバックの重要性

- **ユーザビリティの設計**
  - 説明文とヘルプテキストの効果
  - アイコンと色分けによる直感的な表示
  - 状態に応じた動的なUI

- **Polaris Web Componentsの詳細**
  - 正しい属性名の使用（tone, status, helpText等）
  - Banner、TextField、Checkboxの適切な使用方法
  - レスポンシブデザインの考慮

#### 🎉 プロジェクト完了

**全6フェーズが完了し、本格的なShopifyアプリが完成しました！**

---

## 🏗️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React Router v7 |
| UI | Polaris Web Components |
| データベース | Prisma + SQLite（開発）→ PostgreSQL（本番予定） |
| API | Shopify Admin GraphQL API |
| 配信 | Theme App Extension + App Proxy |
| 言語 | TypeScript |

---

## 📂 プロジェクト構造

```
simple-404-custom-app/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx           # メイン管理画面
│   │   ├── app.additional.tsx       # 追加ページ
│   │   ├── app.tsx                  # アプリレイアウト
│   │   ├── api.redirect-setting.tsx # 設定保存API
│   │   ├── api.proxy.settings.tsx   # App Proxyエンドポイント（NEW）
│   │   ├── auth.$.tsx               # OAuth認証
│   │   └── webhooks.*.tsx           # Webhook処理
│   ├── utils/
│   │   └── verifyProxyHmac.ts       # HMAC検証ユーティリティ（NEW）
│   ├── shopify.server.ts            # Shopify設定
│   └── db.server.ts                 # Prisma設定
├── prisma/
│   ├── schema.prisma                # データベーススキーマ
│   ├── dev.sqlite                   # 開発用DB（gitignore済み）
│   └── migrations/                  # マイグレーション履歴
├── extensions/                      # Theme App Extension
│   └── 404-redirect/               # 404リダイレクトExtension（NEW）
│       ├── blocks/
│       │   └── 404-redirect.liquid # Liquidテンプレート
│       ├── assets/
│       │   └── 404-redirect.js     # JavaScript実装
│       └── shopify.extension.toml  # Extension設定
└── shopify.app.toml                 # アプリ設定（App Proxy設定追加済み）
```

---

## 🚀 セットアップ手順

### 前提条件
- Node.js 20以上
- Shopify Partner Account
- Shopify CLI

### インストール

```bash
# Shopify CLI を使用してアプリの雛形を作成
shopify app init

# 開発サーバー起動
npm run dev
とすることで、Shopifyの管理画面にアプリが表示されます。

# データベースのセットアップ
npx prisma generate
npx prisma migrate dev

```

---

## 📋 開発計画（全体）

- [x] **フェーズ1**: データ層の構築（Prisma）
- [x] **フェーズ2**: バックエンドAPI（GET/POST）
- [x] **フェーズ3**: 管理画面UI（設定フォーム）
- [x] **フェーズ4**: App Proxy（設定配信）
- [x] **フェーズ5**: Theme App Extension（実際のリダイレクト機能）
- [x] **フェーズ6**: テスト・改善・公開準備 ✨ 完了！

## 🎉 プロジェクト完了状況

**✅ 全フェーズ完了！本格的なShopifyアプリが完成しました！**

### 完成した機能：
- ✅ **管理画面**: 直感的なUI、リアルタイムバリデーション
- ✅ **データ管理**: Prisma + SQLite、安全なデータベース操作
- ✅ **App Proxy**: HMAC-SHA256セキュリティ、Theme側からの安全なデータ取得
- ✅ **Theme Extension**: 404ページ自動検出、リアルタイムリダイレクト
- ✅ **エラーハンドリング**: ユーザーフレンドリーな表示
- ✅ **セキュリティ**: 業界標準の署名検証

---

## 🔗 参考リソース

- [Shopify App開発ドキュメント](https://shopify.dev/docs/apps)
- [React Router公式ドキュメント](https://reactrouter.com/)
- [Prisma公式ドキュメント](https://www.prisma.io/)
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components)

---

## 📝 メモ

- 開発環境ではSQLiteを使用（本番ではPostgreSQLに移行予定）
- App Store公開時はSupabaseやPlanetScaleなどのクラウドDBを検討
- 機密情報は`.env`で管理（`.gitignore`で保護済み）
- `client_id`は公開しても問題なし（`api_secret`は非公開）

---

## 👨‍💻 開発者

- 学習目的のプロジェクト
- 段階的な実装で理解を深める方針
- 各フェーズで動作確認を実施

---

最終更新: 2025年10月18日（全フェーズ完了！🎉）
