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

#### 🔜 次のステップ

**フェーズ2: バックエンドAPIの実装**
- `app/routes/api.redirect-settings.tsx` を作成
- GET: 現在の設定を取得するAPI
- POST: 設定を保存/更新するAPI
- Shopify Admin API認証の実装

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
│   │   ├── auth.$.tsx               # OAuth認証
│   │   └── webhooks.*.tsx           # Webhook処理
│   ├── shopify.server.ts            # Shopify設定
│   └── db.server.ts                 # Prisma設定
├── prisma/
│   ├── schema.prisma                # データベーススキーマ
│   ├── dev.sqlite                   # 開発用DB（gitignore済み）
│   └── migrations/                  # マイグレーション履歴
├── extensions/                      # （今後実装）Theme App Extension
└── shopify.app.toml                 # アプリ設定
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
- [ ] **フェーズ2**: バックエンドAPI（GET/POST）
- [ ] **フェーズ3**: 管理画面UI（設定フォーム）
- [ ] **フェーズ4**: App Proxy（設定配信）
- [ ] **フェーズ5**: Theme App Extension（実際のリダイレクト機能）
- [ ] **フェーズ6**: テスト・改善・公開準備

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

最終更新: 2024年10月16日
