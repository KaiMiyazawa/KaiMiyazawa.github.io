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

  * 個人記録・日記・やりたいことリストなど、時系列で読ませる内容
* `content/pages/`

  * 技術記事・運用メモ・固定ドキュメント
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
draft: true   # サイトに出さない（ただし public リポジトリなので GitHub では読める。非公開ではない）
draft: false  # サイトに公開
```

外に出せない下書きは、ここではなく保管庫本体に置く。

---

## 4. URL 設計（blog / pages）

### 4.1 ブログ（blog）

* 置き場: `content/blog/<name>.md`
* URL: `https://miyazawakai.com/blog/<slug>/`
* 個人記録・日記・やりたいことリストなど、時系列で読ませる内容を置く

例：

```yaml
---
title: "2026年にやりたいこと100"
slug: "2026-goals"
draft: false
---
```

### 4.2 固定ドキュメント（pages）

* 置き場: `content/pages/<name>.md`
* URL: `https://miyazawakai.com/pages/<slug>/`
* 技術記事・運用メモ・育てるドキュメントを置く

---

## 5. 画像の運用（推奨）

記事専用の画像は leaf bundle にまとめる。大学生活の振り返り記事では、次の構成を採用した。

```text
content/blog/<slug>/
  index.md
  images/
    001_shortEnglishName.jpg
```

本文からは `![キャプション](images/001_shortEnglishName.jpg)` と相対参照する。大量の画像は本文順の3桁番号、`_`、短い英語の lowerCamelCase で命名する。欠番を埋めるためだけに改名せず、移動・改名時は本文とファイルの対応、他ノートの参照、重複を照合する。

`assets/ts/gallery.ts` が画像の `alt` から `figcaption` を作るため、同じ説明を画像リンクの `"title"` に重ねない。本文と画像が同じ段落になった場合も、この override が段落を分割してキャプションを付ける。処理はブラウザ上の JavaScript で行われるので、静的 HTML に `figcaption` がないことだけでは表示失敗と判断できない。

**写真はコミット前に位置情報（EXIF の GPS）を消す。** スマホの写真には撮影地の緯度経度が残り、公開サイトからそのまま配信される（2026-11-03 の点検で7件見つかり、GPS の項目だけ消した）。

サイト共用の画像は `static/images/` に置き、絶対パスで参照する。

```md
![](/images/example.png)
```

HEIC は表示用 JPEG に変換し、原本や未使用画像は本文の画像フォルダと分ける。leaf bundle 内の `_originals/` も Hugo が配信するため、名前の先頭に `_` を付けるだけでは退避にならない。`assets/originals/` は現在のビルドでは配信対象にならないが、**public リポジトリにコミットすれば GitHub から読める**。非公開の保管場所とは扱わない。

## 5.1 改行と目次の見た目

以下は Codex 会話 `019e9b24-0716-7d42-b4c7-f16dece0d14d` から回収し、2026-10-08に現行の設定・override と照合した方針。

`config.toml` の `markup.goldmark.renderer.hardWraps = true` により、本文の通常改行を表示にも反映する。リスト後の独立した段落には空行を入れ、最後のリスト項目に吸収されないようにする。

左目次は既存の柔軟なレイアウトとデザインを保ち、控えめな灰色のリンクで表示する。大幅なテーマ CSS の置き換えや固定幅化は採用しない。調整はサイト側の `layouts/single.html`、`layouts/_partials/sidebar/left.html`、`assets/scss/custom.scss` に置き、upstream テーマへの直接変更に依存しない。

目次の `id="TableOfContents"` は既存の scrollspy に接続し、現在地の `active-class` だけ少し濃くする。スクロールバーを隠しても内部スクロールは残し、表示高は `calc(100vh - 180px)` とする。`md` 以上では左目次、スマホ幅では本文内目次を表示する。階層は本文の見出しで作り、大学生活の記事は年度を親、月を子とし、4月〜翌3月を同じ年度にまとめる。

---

## 6. Obsidian リンクについて

Obsidian の `[[Wiki Link]]` は Hugo では解釈されないことが多い。
公開記事では Markdown リンクを使用する：

```md
[Goals](/blog/2026-goals/)
```

**保管庫本体のノートへのリンク（`../` で始まるもの）は、公開サイトでは文字だけになる。**
`layouts/_markup/render-link.html` がテーマのリンク出力を上書きし、`../` 始まりのリンクだけ `<a>` を出さない。
Obsidian のグラフでは繋がり、サイトでは壊れたリンクにならない。

ただし**このリポジトリは public なので、リンク先のパス（ファイル名）自体は GitHub 上で見える。**
`08_people/〇〇.md` のように名前だけで中身が想像できるノートへは張らない
（基準は保管庫本体の `AGENTS.md`「編集時の注意」）。

---

## 7. 静的なプライバシーポリシー

| 対象 | 置き場 | 公開 URL |
| --- | --- | --- |
| VocabWhiz | `static/VocabWhiz/privacy.html` | `/VocabWhiz/privacy.html` |
| gmail-unifier | `static/gmail-unifier/privacy.html` | `/gmail-unifier/privacy.html`（Google OAuth の同意画面に登録済み） |

URL を変えずに維持するため、**必ず `static/` 配下に置く**。

---

## 8. 重要ファイル

* `static/CNAME`

  * カスタムドメイン（miyazawakai.com）用
* `archetypes/`・`resources/`

  * Hugo の既定フォルダ（新規記事のひな形 `default.md` と、Hugo が生成する画像などのキャッシュ `_gen/`）。手で編集しない

---

## 9. トラブルシュート

### 9.1 ページが 404 になる

* `draft: false` か確認
* `content/blog/` 配下なら URL は `/blog/...`
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
