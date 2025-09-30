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

// 地図関連の変数
let map;
let currentMarker;

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
        console.log(`🌍 天気データ取得開始:`, { lat: lat, lon: lon });

        // デモ用のデータ（実際にはAPI_KEYが必要）
        if (!API_KEY || API_KEY === '' || API_KEY === '{{OPENWEATHER_API_KEY}}') {
            console.log('📝 デモモード: APIキーが設定されていないため、疑似データを生成');
            // 座標に基づいたデモ用の天気データを返す
            const demoData = generateDemoWeatherByLocation(lat, lon);
            console.log('📦 生成されたデモデータ:', demoData);
            return demoData;
        }

        const apiUrl = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`;
        console.log('🌐 実際のAPI呼び出し URL:', apiUrl.replace(API_KEY, 'xxxxxx')); // APIキーを隠してログ出力

        const response = await fetch(apiUrl);
        console.log('📡 APIレスポンス受信:', response.status, response.statusText);

        if (!response.ok) {
            console.error('❌ API レスポンスエラー:', response.status, response.statusText);

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

        const weatherData = await response.json();
        console.log('✅ API天気データ取得成功:', weatherData);
        return weatherData;
    } catch (error) {
        console.error('❌ 天気データの取得に失敗しました:', error);
        throw error;
    }
}

// 天気情報を表示する関数
function displayWeather(data) {
    console.log('🎨 天気情報をUIに表示:', data);

    locationElement.textContent = data.name;
    weatherDescElement.textContent = data.weather[0].description;
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    humidityElement.textContent = `湿度: ${data.main.humidity}%`;
    windSpeedElement.textContent = `風速: ${data.wind.speed} m/s`;

    console.log('🌈 アニメーション制御開始');
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

// 座標に基づいたデモ天気データを生成する関数
function generateDemoWeatherByLocation(lat, lon) {
    console.log('🎲 座標に基づくデモ天気データ生成開始:', { lat, lon });

    // 座標に基づいて地域名を決定
    const locationName = getLocationName(lat, lon);
    console.log('📍 地域名決定:', locationName);

    // 座標値を使って疑似ランダムな天気を生成
    const latHash = Math.abs(Math.floor(lat * 100)) % 4;
    const lonHash = Math.abs(Math.floor(lon * 100)) % 3;
    const weatherSeed = (latHash + lonHash) % 4;
    console.log('🎯 天気パターン計算:', { latHash, lonHash, weatherSeed });

    const weatherPatterns = [
        {
            main: "Clear",
            description: "快晴",
            temp: 22 + (lat / 10),
            humidity: 45 + (lonHash * 10),
            windSpeed: 2.1 + (latHash * 0.5)
        },
        {
            main: "Clouds",
            description: "曇り",
            temp: 18 + (lon / 20),
            humidity: 70 + (latHash * 5),
            windSpeed: 3.2 + (lonHash * 0.8)
        },
        {
            main: "Rain",
            description: "小雨",
            temp: 15 + (lat / 15),
            humidity: 80 + (lonHash * 3),
            windSpeed: 4.5 + (latHash * 0.6)
        },
        {
            main: "Rain",
            description: "大雨",
            temp: 16 + (lon / 25),
            humidity: 85 + (latHash * 2),
            windSpeed: 6.8 + (lonHash * 1.2)
        }
    ];

    const weather = weatherPatterns[weatherSeed];
    console.log('☁️ 選択された天気パターン:', weather);

    const result = {
        name: locationName,
        weather: [{ main: weather.main, description: weather.description }],
        main: {
            temp: Math.round(weather.temp * 10) / 10,
            humidity: Math.min(95, Math.max(30, Math.round(weather.humidity)))
        },
        wind: { speed: Math.round(weather.windSpeed * 10) / 10 }
    };

    console.log('✨ 最終的なデモ天気データ:', result);
    return result;
}

// 座標から地域名を推定する関数
function getLocationName(lat, lon) {
    // 日本の主要都市の座標範囲で判定
    if (lat >= 35.6 && lat <= 35.8 && lon >= 139.6 && lon <= 139.8) {
        return "東京";
    } else if (lat >= 34.6 && lat <= 34.8 && lon >= 135.4 && lon <= 135.6) {
        return "大阪";
    } else if (lat >= 35.0 && lat <= 35.2 && lon >= 135.7 && lon <= 135.9) {
        return "京都";
    } else if (lat >= 35.4 && lat <= 35.6 && lon >= 139.6 && lon <= 139.8) {
        return "横浜";
    } else if (lat >= 43.0 && lat <= 43.2 && lon >= 141.3 && lon <= 141.5) {
        return "札幌";
    } else if (lat >= 26.1 && lat <= 26.3 && lon >= 127.6 && lon <= 127.8) {
        return "那覇";
    } else if (lat >= 33.5 && lat <= 33.7 && lon >= 130.3 && lon <= 130.5) {
        return "福岡";
    } else if (lat >= 38.2 && lat <= 38.4 && lon >= 140.8 && lon <= 141.0) {
        return "仙台";
    } else if (lat >= 36.3 && lat <= 36.5 && lon >= 136.6 && lon <= 136.8) {
        return "金沢";
    } else if (lat >= 34.3 && lat <= 34.5 && lon >= 132.4 && lon <= 132.6) {
        return "広島";
    } else {
        // 座標から大まかな地域を生成
        const regions = ["北部地域", "南部地域", "東部地域", "西部地域", "中央地域", "沿岸地域", "山間地域"];
        const regionIndex = (Math.abs(Math.floor(lat + lon)) % regions.length);
        return regions[regionIndex];
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

    // サイズ設定（派手版）
    const sizes = {
        small: { width: 120, height: 60 },
        medium: { width: 180, height: 90 },
        large: { width: 240, height: 120 }
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

    // 強度に応じたサイズと位置（控えめ版）
    const sizes = {
        gentle: { width: 10, height: 10 },
        medium: { width: 16, height: 16 },
        strong: { width: 24, height: 24 }
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
        light: { count: 4, interval: 120 },
        medium: { count: 6, interval: 80 },
        heavy: { count: 10, interval: 50 }
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
        light: { count: 2, interval: 4000 },
        medium: { count: 3, interval: 2500 },
        dense: { count: 4, interval: 1500 }
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
        gentle: { count: 2, interval: 1200 },
        medium: { count: 3, interval: 800 },
        strong: { count: 5, interval: 500 }
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

// デモ用サンプルデータ
const demoWeatherData = {
    sunny: {
        name: "デモ（晴れ）",
        weather: [{ main: "Clear", description: "快晴" }],
        main: { temp: 28, humidity: 45 },
        wind: { speed: 2.1 }
    },
    cloudy: {
        name: "デモ（曇り）",
        weather: [{ main: "Clouds", description: "曇り" }],
        main: { temp: 22, humidity: 70 },
        wind: { speed: 4.5 }
    },
    lightRain: {
        name: "デモ（小雨）",
        weather: [{ main: "Rain", description: "小雨" }],
        main: { temp: 18, humidity: 65 },
        wind: { speed: 3.2 }
    },
    heavyRain: {
        name: "デモ（大雨）",
        weather: [{ main: "Rain", description: "大雨" }],
        main: { temp: 16, humidity: 85 },
        wind: { speed: 7.8 }
    }
};

// デモモード用関数
function showDemoWeather(weatherType) {
    const data = demoWeatherData[weatherType];
    if (data) {
        displayWeather(data);
        console.log(`🎭 デモモード: ${data.name} を表示中`);
    }
}

// イベントリスナーの設定
getWeatherButton.addEventListener('click', updateWeather);

// 地図を初期化する関数
function initMap() {
    // 東京を中心とした地図を作成
    map = L.map('map').setView([35.6762, 139.6503], 10);

    // OpenStreetMapのタイルを追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 地図クリックイベントリスナー
    map.on('click', async function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        console.log('🗺️ 地図がクリックされました:', { 緯度: lat, 経度: lng });

        try {
            // 選択した場所の天気情報を取得
            console.log('⏳ 天気データ取得を開始...');
            const weatherData = await getWeatherData(lat, lng);
            console.log('✅ 天気データ取得完了、UIを更新します');
            displayWeather(weatherData);

            // 既存のマーカーを削除
            if (currentMarker) {
                map.removeLayer(currentMarker);
            }

            // 天気に応じたアイコンを決定
            const weather = weatherData.weather[0].main.toLowerCase();
            let icon = '🌤️';
            if (weather.includes('rain')) icon = '🌧️';
            else if (weather.includes('cloud')) icon = '☁️';
            else if (weather.includes('clear')) icon = '☀️';
            else if (weather.includes('snow')) icon = '❄️';

            // 新しいマーカーを追加
            console.log('📍 地図にマーカーを追加:', { icon: icon, location: weatherData.name });
            currentMarker = L.marker([lat, lng]).addTo(map)
                .bindPopup(`
                    <div style="text-align: center;">
                        <strong>${weatherData.name}</strong><br>
                        ${icon} ${weatherData.weather[0].description}<br>
                        🌡️ ${Math.round(weatherData.main.temp)}°C<br>
                        💧 湿度: ${weatherData.main.humidity}%<br>
                        💨 風速: ${weatherData.wind.speed} m/s
                    </div>
                `)
                .openPopup();
            console.log('✅ マーカー追加とポップアップ表示完了');
        } catch (error) {
            console.error('❌ 地図クリック処理でエラーが発生:', error);
        }
    });
}

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    // 地図を初期化
    initMap();

    // 実際の天気情報を取得
    updateWeather();

    // デモボタンのイベントリスナー設定
    const demoButtons = document.querySelectorAll('.demo-btn');
    demoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const weatherType = button.getAttribute('data-weather');
            const weatherMap = {
                'sunny': 'sunny',
                'cloudy': 'cloudy',
                'light-rain': 'lightRain',
                'heavy-rain': 'heavyRain'
            };
            showDemoWeather(weatherMap[weatherType]);
        });
    });
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
if (API_KEY && API_KEY !== '{{OPENWEATHER_API_KEY}}') {
    testAPIKey();
}