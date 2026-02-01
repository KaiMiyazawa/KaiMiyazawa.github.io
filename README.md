# miyazawakai.com (Hugo) — 運用メモ / Publishing Playbook

このディレクトリ（`99_public`）は Hugo によりビルドされ、GitHub Actions を通じて `gh-pages` ブランチへデプロイされます。
`miyazawakai.com` は GitHub Pages（`gh-pages`）を配信元として参照します。

> **重要**
> この README はソース（`main` ブランチ）側のドキュメントです。**Web サイトには公開されません**。
> 公開されるのは Hugo のビルド成果物（`public/`）のみです。

---

## 1. ディレクトリ構成と役割

* `content/`

  * Hugo が読むコンテンツ（Markdown）
* `content/blog/`

  * テックブログ（トップや一覧の主役）
* `content/pages/`

  * 固定ページ（About / Goals / Resume 等）
  * URL は基本 `/pages/<slug>/`
* `static/`

  * そのまま配信される静的ファイル
  * 例: `static/VocabWhiz/privacy.html` → `/VocabWhiz/privacy.html`
  * 例: `static/images/...` → `/images/...`
* `themes/`

  * Hugo テーマ（submodule）
* `.github/workflows/deploy.yml`

  * GitHub Actions（push → build → deploy）

---

## 2. 公開フロー（WordPress 的な「公開」）

### 2.1 ローカル確認

```bash
hugo server
```

* `http://localhost:1313/` で確認
* draft も含めたい場合：

```bash
hugo server -D
```

### 2.2 公開（push = publish）

```bash
git add .
git commit -m "publish: <title>"
git push
```

* `main` ブランチへの push がトリガー
* GitHub Actions が Hugo をビルド
* `public/` を `gh-pages` ブランチへ配置
* GitHub Pages が配信

---

## 3. 下書き管理（draft）

各 Markdown の frontmatter で制御：

```yaml
draft: true   # 非公開
draft: false  # 公開
```

---

## 4. URL 設計（pages / blog）

### 4.1 固定ページ（pages）

* 置き場: `content/pages/<name>.md`
* URL: `https://miyazawakai.com/pages/<slug>/`

例：

```yaml
---
title: "2026年にやりたいこと100"
slug: "2026-goals"
draft: false
---
```

### 4.2 ブログ（blog）

* 置き場: `content/blog/<name>.md`
* URL: `https://miyazawakai.com/blog/<slug>/`（テーマ・設定に依存）

---

## 5. 画像の運用（推奨）

* 公開記事で使う画像は `static/images/` に配置
* Markdown からは **絶対パス** で参照

```md
![](/images/example.png)
```

---

## 6. Obsidian リンクについて

Obsidian の `[[Wiki Link]]` は Hugo では解釈されないことが多い。
公開記事では Markdown リンクを使用する：

```md
[Goals](/pages/2026-goals/)
```

---

## 7. VocabWhiz Privacy Policy

* 置き場: `static/VocabWhiz/privacy.html`
* 公開 URL: `/VocabWhiz/privacy.html`

URL を変えずに維持するため、**必ず `static/` 配下に置く**。

---

## 8. 重要ファイル

* `static/CNAME`

  * カスタムドメイン（miyazawakai.com）用
* `legacy/index.html`

  * 旧・直置きサイトの退避（復旧用）

---

## 9. トラブルシュート

### 9.1 ページが 404 になる

* `draft: false` か確認
* `content/pages/` 配下なら URL は `/pages/...`
* 実際の URL は以下で確認可能：

```bash
hugo list all
```

### 9.2 静的 HTML（VocabWhiz）が 404 になる

* `static/VocabWhiz/privacy.html` が存在するか確認

---

## 10. 親 Vault（ObsidianVault）側の submodule 更新

`99_public` を更新すると、親 Vault 側では submodule の参照 SHA が変わる。
必要に応じて親 Vault で以下を実行：

```bash
git add 99_public
git commit -m "chore: bump public submodule"
git push
```

