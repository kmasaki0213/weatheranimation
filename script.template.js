// OpenWeatherMap API設定（ビルド時に注入）
const API_KEY = '{{OPENWEATHER_API_KEY}}'; // GitHub Actionsで置換される
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM要素の取得
const locationElement = document.getElementById('location');
const weatherDescElement = document.getElementById('weather-description');
const temperatureElement = document.getElementById('temperature');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const getWeatherButton = document.getElementById('get-weather');
const rainContainer = document.getElementById('rain-container');

// 雨粒アニメーション関連
let rainInterval;
let isRaining = false;

// 天気データを取得する関数
async function getWeatherData(lat, lon) {
    try {
        // デモ用のデータ（実際にはAPI_KEYが必要）
        if (API_KEY === 'デモ用のAPIキー' || API_KEY === '' || API_KEY === '{{OPENWEATHER_API_KEY}}') {
            // デモ用の天気データを返す
            return {
                name: "東京",
                weather: [{ main: "Rain", description: "小雨" }],
                main: { temp: 18.5, humidity: 75 },
                wind: { speed: 3.2 }
            };
        }

        const apiUrl = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`;
        console.log('API リクエスト URL:', apiUrl.replace(API_KEY, 'xxxxxx')); // APIキーを隠してログ出力

        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.error('API レスポンス:', response.status, response.statusText);

            if (response.status === 401) {
                throw new Error('APIキーが無効または未認証です。APIキーの有効化をお待ちください（最大2時間）');
            } else if (response.status === 403) {
                throw new Error('APIキーのアクセス権限がありません');
            } else if (response.status === 429) {
                throw new Error('API呼び出し制限に達しました。しばらく待ってから再試行してください');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        return await response.json();
    } catch (error) {
        console.error('天気データの取得に失敗しました:', error);
        throw error;
    }
}

// 天気情報を表示する関数
function displayWeather(data) {
    locationElement.textContent = data.name;
    weatherDescElement.textContent = data.weather[0].description;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    humidityElement.textContent = `湿度: ${data.main.humidity}%`;
    windSpeedElement.textContent = `風速: ${data.wind.speed} m/s`;

    // 雨の場合、雨粒アニメーションを開始
    const weatherMain = data.weather[0].main.toLowerCase();
    if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
        startRainAnimation();
    } else {
        stopRainAnimation();
    }
}

// 位置情報を取得する関数
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('位置情報サービスがサポートされていません'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                console.error('位置情報の取得に失敗しました:', error);
                // デフォルトで東京の座標を使用
                resolve({ lat: 35.6762, lon: 139.6503 });
            }
        );
    });
}

// 雨粒を作成する関数
function createRaindrop() {
    const raindrop = document.createElement('div');
    raindrop.className = 'raindrop';

    // ランダムな位置に配置
    raindrop.style.left = Math.random() * 100 + '%';

    // ランダムな高さと動作時間
    const height = Math.random() * 20 + 15;
    const duration = Math.random() * 0.5 + 0.8;

    raindrop.style.height = height + 'px';
    raindrop.style.animationDuration = duration + 's';

    rainContainer.appendChild(raindrop);

    // アニメーション終了後に要素を削除
    setTimeout(() => {
        if (raindrop.parentNode) {
            raindrop.parentNode.removeChild(raindrop);
        }
    }, duration * 1000);
}

// 雨粒アニメーションを開始
function startRainAnimation() {
    if (isRaining) return;

    isRaining = true;
    rainInterval = setInterval(() => {
        // 複数の雨粒を同時に作成
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createRaindrop(), i * 50);
        }
    }, 150);
}

// 雨粒アニメーションを停止
function stopRainAnimation() {
    if (!isRaining) return;

    isRaining = false;
    if (rainInterval) {
        clearInterval(rainInterval);
        rainInterval = null;
    }

    // 既存の雨粒を徐々に削除
    setTimeout(() => {
        rainContainer.innerHTML = '';
    }, 2000);
}

// 天気情報を更新する関数
async function updateWeather() {
    try {
        locationElement.textContent = '位置情報を取得中...';
        weatherDescElement.textContent = '天気情報を読み込み中...';

        const location = await getCurrentLocation();
        const weatherData = await getWeatherData(location.lat, location.lon);
        displayWeather(weatherData);

    } catch (error) {
        console.error('天気情報の更新に失敗しました:', error);
        locationElement.textContent = 'エラーが発生しました';
        weatherDescElement.textContent = error.message || '天気情報を取得できませんでした';

        // エラー時もデモ用の雨アニメーションを表示
        startRainAnimation();
    }
}

// イベントリスナーの設定
getWeatherButton.addEventListener('click', updateWeather);

// ページ読み込み時に天気情報を取得
document.addEventListener('DOMContentLoaded', () => {
    updateWeather();
});

// APIキーのテスト関数
async function testAPIKey() {
    try {
        // 東京の座標でテスト
        const testUrl = `${API_BASE_URL}?lat=35.6762&lon=139.6503&appid=${API_KEY}`;
        console.log('APIキーテスト中...', testUrl.replace(API_KEY, 'xxxxxx'));

        const response = await fetch(testUrl);

        if (response.ok) {
            console.log('✅ APIキーは有効です！');
            return true;
        } else {
            console.log('❌ APIキーエラー:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.log('❌ APIテストエラー:', error);
        return false;
    }
}

// API使用に関する注意事項を表示
console.log(`
=== 天気予報サイト ===
APIキー: ${API_KEY ? (API_KEY === '{{OPENWEATHER_API_KEY}}' ? 'テンプレート' : 'セット済み') : '未設定'}
デプロイ方法: GitHub Actions
`);

// APIキーの有効性をテスト
if (API_KEY && API_KEY !== 'デモ用のAPIキー' && API_KEY !== '{{OPENWEATHER_API_KEY}}') {
    testAPIKey();
}