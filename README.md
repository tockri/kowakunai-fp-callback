# kowakunai-fp-callback

## セットアップ

1. [bun](https://bun.sh/)をインストール
2. 必要なライブラリをインストール
   ```
   bun i
   ```

## 使い方

1. MySQLを起動 (docker composeを利用)
   ```
   bun db
   ```
2. （初回のみ）必要なテーブルを作成（prismaを利用）
   ```
   bun db-schema
   ```
3. サーバーを起動
   ```
   bun dev
   ```

## MySQLクライアント起動

```
bun mysql
```
