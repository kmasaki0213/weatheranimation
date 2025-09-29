# 天気予報と雨粒アニメーションサイト

現在の天気情報を取得し、雨の場合に美しい雨粒アニメーションを表示するWebサイトです。

## 機能

- 📍 現在地の天気情報を自動取得
- 🌡️ 気温、湿度、風速の表示
- 🌧️ 雨天時の雨粒アニメーション
- 📱 レスポンシブデザイン対応
- 🎨 美しいグラデーション背景

## ファイル構成

```
.
├── index.html      # メインのHTMLファイル
├── style.css       # スタイルシートと雨粒アニメーション
├── script.js       # 天気API連携とJavaScript処理
└── README.md       # このファイル
```

## セットアップ方法

### 1. OpenWeatherMap APIキーの取得

1. [OpenWeatherMap](https://openweathermap.org/api) にアクセス
2. 無料アカウントを作成
3. APIキーを取得

### 2. APIキーの設定

`script.js` ファイルの以下の行を編集：

```javascript
const API_KEY = 'ここに取得したAPIキーを入力';
```

### 3. ローカルでの確認

1. すべてのファイルを同じフォルダに配置
2. `index.html` をブラウザで開く
3. 位置情報の許可を求められた場合は「許可」を選択

## GitHub Actions + GitHub Pagesでの安全なデプロイ方法

### 1. GitHubリポジトリの作成

```bash
# 新しいリポジトリを作成
git init
git add .
git commit -m "天気予報サイトの初期コミット"
git branch -M main
git remote add origin https://github.com/[ユーザー名]/[リポジトリ名].git
git push -u origin main
```

### 2. GitHub SecretsでAPIキーを設定

1. GitHubのリポジトリページにアクセス
2. 「Settings」タブをクリック
3. 左メニューから「Secrets and variables」→「Actions」を選択
4. 「New repository secret」をクリック
5. 以下を設定：
   - **Name**: `OPENWEATHER_API_KEY`
   - **Secret**: 取得したOpenWeatherMap APIキー
6. 「Add secret」をクリック

### 3. GitHub Pagesの設定

1. 「Settings」タブ →「Pages」を選択
2. Source で「GitHub Actions」を選択
3. 保存

### 4. 自動デプロイの確認

- mainブランチにpushすると自動的にデプロイが開始
- 「Actions」タブでビルド状況を確認可能
- デプロイ完了後、以下のURLでアクセス：
```
https://[ユーザー名].github.io/[リポジトリ名]/
```

### 5. セキュリティ上の利点

✅ APIキーがソースコードに含まれない
✅ GitHub Secretsで安全に管理
✅ ビルド時のみAPIキーが注入される
✅ 公開されるファイルには実際のAPIキーが含まれる

## 技術仕様

- **HTML5**: セマンティックなマークアップ
- **CSS3**:
  - Flexbox レイアウト
  - CSS アニメーション（雨粒効果）
  - レスポンシブデザイン
  - Backdrop filter（ぼかし効果）
- **JavaScript ES6+**:
  - Fetch API による天気データ取得
  - Geolocation API による位置情報取得
  - DOM操作とイベント処理

## API仕様

使用API: **OpenWeatherMap Current Weather API**

リクエスト例：
```
https://api.openweathermap.org/data/2.5/weather?lat=35.6762&lon=139.6503&appid=[API_KEY]&units=metric&lang=ja
```

## ブラウザ対応

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 注意事項

- OpenWeatherMap の無料プランでは1分間に60回、1ヶ月に100万回までのAPI呼び出しが可能
- 位置情報の取得には必ずHTTPS接続が必要
- APIキーは公開リポジトリでは環境変数として管理することを推奨