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
const cloudsContainer = document.getElementById('clouds-container');
const sunshineContainer = document.getElementById('sunshine-container');

// 天気エフェクト関連
let rainInterval;
let cloudInterval;
let sunshineInterval;
let isRaining = false;
let isCloudy = false;
let isSunny = false;

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

    // 天気に応じたアニメーション制御
    controlWeatherAnimations(data);
}

// 天気に応じたアニメーション制御
function controlWeatherAnimations(data) {
    const weatherMain = data.weather[0].main.toLowerCase();
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const temperature = data.main.temp;

    // 全てのアニメーションを停止
    stopAllAnimations();

    if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
        // 雨: 湿度と風速に応じて強度を調整
        const intensity = getRainIntensity(humidity, windSpeed);
        startRainAnimation(intensity);
    } else if (weatherMain.includes('cloud')) {
        // 曇り: 湿度に応じて雲の密度を調整
        const cloudDensity = getCloudDensity(humidity);
        const cloudSpeed = getCloudSpeed(windSpeed);
        startCloudAnimation(cloudDensity, cloudSpeed);
    } else if (weatherMain.includes('clear') || weatherMain.includes('sun')) {
        // 晴れ: 気温に応じて太陽光の強度を調整
        const sunIntensity = getSunIntensity(temperature);
        startSunshineAnimation(sunIntensity);
    }
}

// 雨の強度を計算
function getRainIntensity(humidity, windSpeed) {
    if (humidity > 80 && windSpeed > 5) return 'heavy';
    if (humidity > 60 || windSpeed > 3) return 'medium';
    return 'light';
}

// 雲の密度を計算
function getCloudDensity(humidity) {
    if (humidity > 75) return 'dense';
    if (humidity > 50) return 'medium';
    return 'light';
}

// 雲の移動速度を計算
function getCloudSpeed(windSpeed) {
    if (windSpeed > 8) return 'fast';
    if (windSpeed > 4) return 'medium';
    return 'slow';
}

// 太陽光の強度を計算
function getSunIntensity(temperature) {
    if (temperature > 25) return 'strong';
    if (temperature > 15) return 'medium';
    return 'gentle';
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
function createRaindrop(intensity = 'medium') {
    const raindrop = document.createElement('div');
    raindrop.className = `raindrop ${intensity}`;

    // ランダムな位置に配置
    raindrop.style.left = Math.random() * 100 + '%';

    // 強度に応じた動作時間
    const baseDuration = intensity === 'heavy' ? 0.6 : intensity === 'medium' ? 0.8 : 1.0;
    const duration = baseDuration + Math.random() * 0.4;

    raindrop.style.animationDuration = duration + 's';

    rainContainer.appendChild(raindrop);

    // アニメーション終了後に要素を削除
    setTimeout(() => {
        if (raindrop.parentNode) {
            raindrop.parentNode.removeChild(raindrop);
        }
    }, duration * 1000);
}

// 雲を作成する関数
function createCloud(size = 'medium', speed = 'medium') {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';

    // サイズ設定
    const sizes = {
        small: { width: 60, height: 30 },
        medium: { width: 100, height: 50 },
        large: { width: 140, height: 70 }
    };

    const cloudSize = sizes[size] || sizes.medium;
    cloud.style.width = cloudSize.width + 'px';
    cloud.style.height = cloudSize.height + 'px';

    // ランダムな高さに配置
    cloud.style.top = Math.random() * 30 + '%';

    // 速度設定
    const speeds = {
        slow: '25s',
        medium: '15s',
        fast: '8s'
    };

    cloud.style.animationDuration = speeds[speed] || speeds.medium;

    cloudsContainer.appendChild(cloud);

    // アニメーション終了後に要素を削除
    const duration = parseInt(speeds[speed]) * 1000;
    setTimeout(() => {
        if (cloud.parentNode) {
            cloud.parentNode.removeChild(cloud);
        }
    }, duration);
}

// 太陽光を作成する関数
function createSunray(intensity = 'medium') {
    const sunray = document.createElement('div');
    sunray.className = 'sunray';

    // 強度に応じたサイズと位置
    const sizes = {
        gentle: { width: 8, height: 8 },
        medium: { width: 12, height: 12 },
        strong: { width: 18, height: 18 }
    };

    const raySize = sizes[intensity] || sizes.medium;
    sunray.style.width = raySize.width + 'px';
    sunray.style.height = raySize.height + 'px';

    // ランダムな位置に配置
    sunray.style.left = Math.random() * 100 + '%';
    sunray.style.top = Math.random() * 100 + '%';

    // 強度に応じたアニメーション速度
    const durations = {
        gentle: '4s',
        medium: '3s',
        strong: '2s'
    };

    sunray.style.animationDuration = durations[intensity] || durations.medium;

    sunshineContainer.appendChild(sunray);

    // アニメーション終了後に要素を削除
    const duration = parseInt(durations[intensity]) * 1000;
    setTimeout(() => {
        if (sunray.parentNode) {
            sunray.parentNode.removeChild(sunray);
        }
    }, duration);
}

// 全てのアニメーションを停止
function stopAllAnimations() {
    stopRainAnimation();
    stopCloudAnimation();
    stopSunshineAnimation();
}

// 雨粒アニメーションを開始
function startRainAnimation(intensity = 'medium') {
    if (isRaining) return;

    isRaining = true;
    const frequencies = {
        light: { count: 2, interval: 200 },
        medium: { count: 3, interval: 150 },
        heavy: { count: 5, interval: 100 }
    };

    const config = frequencies[intensity] || frequencies.medium;

    rainInterval = setInterval(() => {
        for (let i = 0; i < config.count; i++) {
            setTimeout(() => createRaindrop(intensity), i * 30);
        }
    }, config.interval);
}

// 雲アニメーションを開始
function startCloudAnimation(density = 'medium', speed = 'medium') {
    if (isCloudy) return;

    isCloudy = true;
    const densities = {
        light: { count: 1, interval: 8000 },
        medium: { count: 1, interval: 5000 },
        dense: { count: 2, interval: 3000 }
    };

    const config = densities[density] || densities.medium;

    cloudInterval = setInterval(() => {
        for (let i = 0; i < config.count; i++) {
            setTimeout(() => {
                const size = Math.random() > 0.5 ? 'medium' : 'large';
                createCloud(size, speed);
            }, i * 1000);
        }
    }, config.interval);
}

// 太陽光アニメーションを開始
function startSunshineAnimation(intensity = 'medium') {
    if (isSunny) return;

    isSunny = true;
    const intensities = {
        gentle: { count: 2, interval: 1500 },
        medium: { count: 3, interval: 1000 },
        strong: { count: 5, interval: 600 }
    };

    const config = intensities[intensity] || intensities.medium;

    sunshineInterval = setInterval(() => {
        for (let i = 0; i < config.count; i++) {
            setTimeout(() => createSunray(intensity), i * 200);
        }
    }, config.interval);
}

// 雨粒アニメーションを停止
function stopRainAnimation() {
    if (!isRaining) return;

    isRaining = false;
    if (rainInterval) {
        clearInterval(rainInterval);
        rainInterval = null;
    }

    setTimeout(() => {
        rainContainer.innerHTML = '';
    }, 2000);
}

// 雲アニメーションを停止
function stopCloudAnimation() {
    if (!isCloudy) return;

    isCloudy = false;
    if (cloudInterval) {
        clearInterval(cloudInterval);
        cloudInterval = null;
    }

    setTimeout(() => {
        cloudsContainer.innerHTML = '';
    }, 5000);
}

// 太陽光アニメーションを停止
function stopSunshineAnimation() {
    if (!isSunny) return;

    isSunny = false;
    if (sunshineInterval) {
        clearInterval(sunshineInterval);
        sunshineInterval = null;
    }

    setTimeout(() => {
        sunshineContainer.innerHTML = '';
    }, 3000);
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