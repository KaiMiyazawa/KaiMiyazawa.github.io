---
title: Hugo × Obsidian × GitHub Pages で作る、\n「書くだけで公開できる」個人知識基盤
date: 2026-02-02
draft: false
tags: []
---

## はじめに

日記・メモ・技術ノートは Obsidian で書く。
でも「公開」は面倒で続かない──。

そんな状態を抜け出すために、**Obsidian → Hugo → GitHub Pages** という流れで、

> **ローカルでは私的な知識基盤、必要なものだけを“そのまま”公開できる**

仕組みをゼロから構築した。(もちろんChatGPTが！)

この記事は、その**設計思想・ディレクトリ構成・ハマりどころ**まで含めた記録です。

---

## ゴール設定

今回のゴールは明確でした。

* Obsidian で普段どおり Markdown を書く
* 公開したいものだけを明示的に切り出す
* GitHub に push するだけで自動で公開される
* ローカル知識（非公開）は絶対に漏れない
* 将来構成を拡張しても壊れない

WordPress のような CMS は使わない。
**「書く体験」を壊さないこと**を最優先にしました。

---

## 全体構成（最終形）

```text
Obsidian/
├── 01_diary        # 完全非公開の日記
├── 02_note         # 非公開ノート
├── 03_hobby
├── 04_misc
├── 79_template     # Obsidian用テンプレ集
├── 89_profile      # GitHub Profile（submodule）
├── 99_public       # 公開サイト（submodule/Hugo）
└── ...
```

ポイントは **99_public だけが「公開境界」** であること。

---

## なぜ Obsidian Vault をそのまま公開しないのか

Obsidian の Publish 機能も検討したが、以下の理由で採用しなかった。

* 月額課金が必要
* 公開粒度の制御が弱い
* 将来の移行コストが高い
* GitHubをどうにかすれば自分でも無料で実現できそうだった

そこで、

> **Vault 全体はローカル管理、公開物だけを submodule で分離**

という設計を取った。

---

## 99_public を submodule にする

`99_public` は、

* GitHub Pages 用リポジトリ
* Hugo プロジェクト

を兼ねている。

```text
99_public/
├── content
│   ├── blog
│   └── pages
├── layouts
├── static
├── themes
└── config.toml
```

親の Obsidian Vault から見ると、

> **99_public は「外に出る箱」**

として明確に分離されている。

---

## blog / pages の役割分離

### blog/

* 日記の延長
* 技術記事
* 時系列で流れて良いもの

### pages/

* About
* 目標
* プロジェクト概要
* URL を固定したいもの

迷ったらこの基準で判断する。

> **1年後も同じ URL で見せたいか？**

---

## Hugo テーマ：Stack を選んだ理由

* ダークモードが最初から美しい
* 情報密度が高い
* 技術ブログと相性が良い

ただし **Stack は構造前提がかなり厳しい**。

`article-page` / `main-article` / `article-content` を崩すと、

> ダークモードで文字が黒くなる

という罠にハマった。

---

## トップページが一番の難所だった

`content/_index.md` を書いただけでは、

* 余白が変
* ダークモードが壊れる

という状態になった。

最終的にたどり着いたのは、

> **トップページも single.html と同じ partial で描画する**

という解決策。

```html
{{ partial "article/article.html" . }}
```

Stack の設計思想に逆らわないように、何とかお膳立てしたらどうにかなりました。

---

## build成果物は Git 管理しない

```gitignore
public/
resources/_gen/
.hugo_build.lock
```

* `public/` は毎回生成
* GitHub Actions が deploy

という責務分離にしたことで、

> ローカルと本番がズレない

状態を維持できている。

---

## この構成の良いところ

* 書く場所は 1 つ（Obsidian）
* 公開境界が明確
* 破壊的変更が起きにくい
* 将来 LLM や検索と相性が良い

正直、

> **個人ブログとしては完成形にかなり近い**

と感じている。

---

## おわりに

この構成を作って一番良かったのは、

> 「公開するかどうか」を**書く時点で悩まなくなった**

ことです。

まず書く。必要になったら public に移す。

この距離感が、個人のアウトプットを長く続ける良いポイントになるんでわ？と思ってる。