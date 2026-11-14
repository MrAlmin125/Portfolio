<?php
/**
 * ua_parser.php
 *
 * Dependency-free User-Agent parser.
 *
 * Detects:
 * - Device type
 * - Device brand
 * - Device model
 * - Browser
 * - Browser version
 * - Operating system
 * - OS version
 * - In-app browsers
 * - Facebook
 * - Messenger
 * - Instagram
 * - TikTok
 * - WhatsApp
 * - Xiaomi Browser
 * - Samsung Internet
 * - Brave
 * - Bots
 *
 * Usage:
 *
 * require_once __DIR__ . '/ua_parser.php';
 *
 * $info = parse_user_agent($_SERVER['HTTP_USER_AGENT'] ?? '');
 */


/**
 * Extract first regex capture.
 */
function ua_match(string $pattern, string $ua): ?string
{
    if (preg_match($pattern, $ua, $m)) {
        return isset($m[1]) ? trim($m[1]) : null;
    }

    return null;
}


/**
 * Detect operating system.
 */
function detect_os(string $ua): array
{
    $os = 'Other';
    $version = null;


    // ----------------------------------------------------------
    // Android
    // ----------------------------------------------------------

    if (preg_match('/Android[\/\s-]*([\d\.]+)/i', $ua, $m)) {

        $os = 'Android';
        $version = $m[1];
    }


    // ----------------------------------------------------------
    // iPhone / iPad / iPod
    // ----------------------------------------------------------

    elseif (
        preg_match(
            '/(?:CPU (?:iPhone )?OS|iPhone OS|CPU OS)\s*([\d_]+)/i',
            $ua,
            $m
        )
    ) {

        $os = 'iOS';
        $version = str_replace('_', '.', $m[1]);
    }

    elseif (preg_match('/iPhone|iPad|iPod/i', $ua)) {

        $os = 'iOS';
    }


    // ----------------------------------------------------------
    // Windows
    // ----------------------------------------------------------

    elseif (preg_match('/Windows NT 10\.0/i', $ua)) {

        $os = 'Windows';
        $version = '10/11';
    }

    elseif (preg_match('/Windows NT 6\.4/i', $ua)) {

        $os = 'Windows';
        $version = '11';
    }

    elseif (preg_match('/Windows NT 6\.3/i', $ua)) {

        $os = 'Windows';
        $version = '8.1';
    }

    elseif (preg_match('/Windows NT 6\.2/i', $ua)) {

        $os = 'Windows';
        $version = '8';
    }

    elseif (preg_match('/Windows NT 6\.1/i', $ua)) {

        $os = 'Windows';
        $version = '7';
    }

    elseif (preg_match('/Windows Phone(?: OS)?\s*([\d\.]+)/i', $ua, $m)) {

        $os = 'Windows Phone';
        $version = $m[1];
    }


    // ----------------------------------------------------------
    // macOS
    // ----------------------------------------------------------

    elseif (preg_match('/Mac OS X[\/\s]*([\d_\.]+)/i', $ua, $m)) {

        $os = 'macOS';
        $version = str_replace('_', '.', $m[1]);
    }

    elseif (preg_match('/Mac OS X/i', $ua)) {

        $os = 'macOS';
    }


    // ----------------------------------------------------------
    // ChromeOS
    // ----------------------------------------------------------

    elseif (preg_match('/CrOS [^ ]+\s+([\d\.]+)/i', $ua, $m)) {

        $os = 'ChromeOS';
        $version = $m[1];
    }


    // ----------------------------------------------------------
    // Linux
    // ----------------------------------------------------------

    elseif (preg_match('/Linux/i', $ua)) {

        $os = 'Linux';
    }


    // ----------------------------------------------------------
    // WebOS
    // ----------------------------------------------------------

    elseif (preg_match('/webOS/i', $ua)) {

        $os = 'webOS';
    }


    // ----------------------------------------------------------
    // BlackBerry
    // ----------------------------------------------------------

    elseif (preg_match('/BlackBerry|BB10/i', $ua)) {

        $os = 'BlackBerry';
    }


    return [
        'os' => $os,
        'os_version' => $version
    ];
}


/**
 * Detect browser / app.
 */
function detect_browser(string $ua): array
{
    $browser = 'Other';
    $version = null;

    $inApp = false;
    $app = null;


    // ==========================================================
    // META
    // ==========================================================

    /*
     * Facebook UAs often contain Chrome.
     * Therefore these MUST be checked before Chrome.
     */

    if (
        preg_match(
            '/FBAN|FBAV|FBIOS|FB_IAB|FB4A|FBMD/i',
            $ua
        )
    ) {

        $browser = 'Facebook';
        $inApp = true;
        $app = 'Facebook';


        // FBAV/xxx
        if (preg_match('/FBAV\/([\d\.]+)/i', $ua, $m)) {
            $version = $m[1];
        }
    }


    // ==========================================================
    // MESSENGER
    // ==========================================================

    elseif (preg_match('/Messenger/i', $ua)) {

        $browser = 'Messenger';
        $inApp = true;
        $app = 'Messenger';


        if (preg_match('/Messenger[\/\s]*([\d\.]+)/i', $ua, $m)) {
            $version = $m[1];
        }
    }


    // ==========================================================
    // INSTAGRAM
    // ==========================================================

    elseif (preg_match('/Instagram/i', $ua)) {

        $browser = 'Instagram';
        $inApp = true;
        $app = 'Instagram';


        if (preg_match('/Instagram[\s\/]*([\d\.]+)/i', $ua, $m)) {
            $version = $m[1];
        }
    }


    // ==========================================================
    // TIKTOK
    // ==========================================================

    elseif (preg_match('/TikTok|musical_ly/i', $ua)) {

        $browser = 'TikTok';
        $inApp = true;
        $app = 'TikTok';
    }


    // ==========================================================
    // WHATSAPP
    // ==========================================================

    elseif (preg_match('/WhatsApp/i', $ua)) {

        $browser = 'WhatsApp';
        $inApp = true;
        $app = 'WhatsApp';


        if (preg_match('/WhatsApp\/([\d\.]+)/i', $ua, $m)) {
            $version = $m[1];
        }
    }


    // ==========================================================
    // LINE
    // ==========================================================

    elseif (preg_match('/Line\//i', $ua)) {

        $browser = 'LINE';
        $inApp = true;
        $app = 'LINE';
    }


    // ==========================================================
    // Snapchat
    // ==========================================================

    elseif (preg_match('/Snapchat/i', $ua)) {

        $browser = 'Snapchat';
        $inApp = true;
        $app = 'Snapchat';
    }


    // ==========================================================
    // Xiaomi Browser
    // ==========================================================

    elseif (
        preg_match(
            '/MiuiBrowser|MiBrowser|XiaoMi\/MiuiBrowser/i',
            $ua
        )
    ) {

        $browser = 'Xiaomi Browser';

        if (
            preg_match(
                '/(?:MiuiBrowser|MiBrowser)\/([\d\.]+)/i',
                $ua,
                $m
            )
        ) {
            $version = $m[1];
        }
    }


    // ==========================================================
    // Samsung Internet
    // ==========================================================

    elseif (
        preg_match(
            '/SamsungBrowser\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Samsung Internet';
        $version = $m[1];
    }


    // ==========================================================
    // Brave
    // ==========================================================

    /*
     * Brave normally uses a Chrome-compatible UA.
     * Exact Brave detection is better handled by track.js.
     *
     * Server-side fallback:
     */

    elseif (preg_match('/Brave/i', $ua)) {

        $browser = 'Brave';
    }


    // ==========================================================
    // Edge
    // ==========================================================

    elseif (
        preg_match(
            '/EdgA?\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Edge';
        $version = $m[1];
    }


    // ==========================================================
    // Edge Legacy
    // ==========================================================

    elseif (
        preg_match(
            '/Edge\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Edge Legacy';
        $version = $m[1];
    }


    // ==========================================================
    // Opera
    // ==========================================================

    elseif (
        preg_match(
            '/OPR\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Opera';
        $version = $m[1];
    }


    // Opera Mini
    elseif (
        preg_match(
            '/Opera Mini\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Opera Mini';
        $version = $m[1];
    }


    // Opera Mobile
    elseif (
        preg_match(
            '/Opera Mobi(?:le)?\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Opera Mobile';
        $version = $m[1];
    }


    // ==========================================================
    // Chrome iOS
    // ==========================================================

    elseif (
        preg_match(
            '/CriOS\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Chrome (iOS)';
        $version = $m[1];
    }


    // ==========================================================
    // Firefox iOS
    // ==========================================================

    elseif (
        preg_match(
            '/FxiOS\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Firefox (iOS)';
        $version = $m[1];
    }


    // ==========================================================
    // Firefox
    // ==========================================================

    elseif (
        preg_match(
            '/Firefox\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Firefox';
        $version = $m[1];
    }


    // Firefox Focus
    elseif (
        preg_match(
            '/Focus\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Firefox Focus';
        $version = $m[1];
    }


    // ==========================================================
    // Chromium
    // ==========================================================

    elseif (
        preg_match(
            '/Chromium\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Chromium';
        $version = $m[1];
    }


    // ==========================================================
    // Chrome
    // ==========================================================

    elseif (
        preg_match(
            '/Chrome\/([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Chrome';
        $version = $m[1];
    }


    // ==========================================================
    // Safari
    // ==========================================================

    elseif (
        preg_match(
            '/Version\/([\d\.]+).*Safari/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Safari';
        $version = $m[1];
    }


    // ==========================================================
    // Internet Explorer
    // ==========================================================

    elseif (
        preg_match(
            '/MSIE\s+([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Internet Explorer';
        $version = $m[1];
    }

    elseif (
        preg_match(
            '/Trident\/.*rv:([\d\.]+)/i',
            $ua,
            $m
        )
    ) {

        $browser = 'Internet Explorer';
        $version = $m[1];
    }


    return [
        'browser' => $browser,
        'browser_version' => $version,
        'in_app_browser' => $inApp,
        'in_app_app' => $app
    ];
}


/**
 * Detect device type.
 */
function detect_device_type(
    string $ua,
    string $os
): string
{
    // iPad
    if (preg_match('/iPad/i', $ua)) {
        return 'Tablet';
    }


    // Android tablet
    if (
        $os === 'Android' &&
        !preg_match('/Mobile/i', $ua)
    ) {
        return 'Tablet';
    }


    // Mobile
    if (
        preg_match(
            '/Mobi|Android.*Mobile|iPhone|iPod|Windows Phone/i',
            $ua
        )
    ) {
        return 'Mobile';
    }


    return 'Desktop';
}


/**
 * Detect Android model.
 */
function detect_android_model(string $ua): array
{
    $model = null;
    $brand = null;


    /*
     * Example:
     *
     * Android 14; SM-S928B Build/UP1A...
     *
     * Android 13; Pixel 7 Build/...
     */


    if (
        preg_match(
            '/Android\s[\d\.]+;\s*(?:[a-z]{2}-[a-z]{2};\s*)?([^;)]+?)(?:\s+Build\/[^)]*)?\)/i',
            $ua,
            $m
        )
    ) {

        $candidate =
            trim($m[1]);


        // Remove common UA tokens
        $candidate =
            preg_replace(
                '/;\s*(wv|Mobile|Tablet).*$/i',
                '',
                $candidate
            );


        $candidate =
            trim($candidate);


        // Chrome reduced UA
        if (
            $candidate === '' ||
            strtolower($candidate) === 'k' ||
            strtolower($candidate) === 'unknown'
        ) {

            return [
                'brand' => null,
                'model' => null
            ];
        }


        $model = $candidate;
    }


    if ($model) {

        $upper =
            strtoupper($model);


        // Samsung
        if (
            preg_match(
                '/^(SM-|GT-|SCH-|SGH-|SAMSUNG)/i',
                $model
            )
        ) {

            $brand = 'Samsung';
        }


        // Google Pixel
        elseif (
            preg_match(
                '/^(Pixel|Nexus)/i',
                $model
            )
        ) {

            $brand = 'Google';
        }


        // Xiaomi
        elseif (
            preg_match(
                '/^(Redmi|POCO|MI |MIX|XIAOMI)/i',
                $model
            )
        ) {

            $brand = 'Xiaomi';
        }


        // OnePlus
        elseif (
            preg_match(
                '/^(ONEPLUS|IN\d|LE\d|NE\d)/i',
                $model
            )
        ) {

            $brand = 'OnePlus';
        }


        // OPPO
        elseif (
            preg_match(
                '/^(CPH|PCH|PEM)/i',
                $model
            )
        ) {

            $brand = 'OPPO';
        }


        // Realme
        elseif (
            preg_match(
                '/^(RMX)/i',
                $model
            )
        ) {

            $brand = 'Realme';
        }


        // Huawei
        elseif (
            preg_match(
                '/^(HUAWEI|VOG-|ANA-|ELE-)/i',
                $model
            )
        ) {

            $brand = 'Huawei';
        }


        // Motorola
        elseif (
            preg_match(
                '/^(moto|MOT-|XT\d)/i',
                $model
            )
        ) {

            $brand = 'Motorola';
        }


        // Vivo
        elseif (
            preg_match(
                '/^(VIVO|V\d{3,})/i',
                $model
            )
        ) {

            $brand = 'Vivo';
        }


        // Sony
        elseif (
            preg_match(
                '/^(XPERIA|SO-)/i',
                $model
            )
        ) {

            $brand = 'Sony';
        }


        // ASUS
        elseif (
            preg_match(
                '/^(ASUS|ROG)/i',
                $model
            )
        ) {

            $brand = 'ASUS';
        }


        // Nokia
        elseif (
            preg_match(
                '/^(NOKIA|TA-)/i',
                $model
            )
        ) {

            $brand = 'Nokia';
        }
    }


    return [
        'brand' => $brand,
        'model' => $model
    ];
}


/**
 * Detect Apple devices.
 */
function detect_apple_device(string $ua): array
{
    if (preg_match('/iPad/i', $ua)) {

        return [
            'brand' => 'Apple',
            'model' => 'iPad'
        ];
    }


    if (preg_match('/iPhone/i', $ua)) {

        return [
            'brand' => 'Apple',
            'model' => 'iPhone'
        ];
    }


    if (preg_match('/iPod/i', $ua)) {

        return [
            'brand' => 'Apple',
            'model' => 'iPod'
        ];
    }


    if (preg_match('/Macintosh|Mac OS X/i', $ua)) {

        return [
            'brand' => 'Apple',
            'model' => 'Mac'
        ];
    }


    return [
        'brand' => null,
        'model' => null
    ];
}


/**
 * Detect bots/crawlers.
 */
function detect_bot(string $ua): bool
{
    $patterns = [

        'bot',
        'crawler',
        'spider',
        'slurp',
        'bingpreview',

        'facebookexternalhit',
        'facebot',

        'twitterbot',
        'linkedinbot',

        'googlebot',
        'adsbot',
        'mediapartners-google',

        'telegrambot',

        'semrush',
        'ahrefs',
        'mj12bot',

        'petalbot',
        'bytespider',
        'dotbot',

        'yandex',
        'baiduspider'

    ];


    foreach ($patterns as $pattern) {

        if (
            stripos(
                $ua,
                $pattern
            ) !== false
        ) {

            return true;
        }
    }


    return false;
}


/**
 * Main parser.
 */
function parse_user_agent(string $ua): array
{
    $ua = trim($ua);


    if ($ua === '') {

        $ua = 'Unknown';
    }


    // ----------------------------------------------------------
    // OS
    // ----------------------------------------------------------

    $osInfo =
        detect_os($ua);


    $os =
        $osInfo['os'];

    $osVersion =
        $osInfo['os_version'];


    // ----------------------------------------------------------
    // Device type
    // ----------------------------------------------------------

    $deviceType =
        detect_device_type(
            $ua,
            $os
        );


    // ----------------------------------------------------------
    // Browser
    // ----------------------------------------------------------

    $browserInfo =
        detect_browser($ua);


    // ----------------------------------------------------------
    // Device
    // ----------------------------------------------------------

    $brand = null;
    $model = null;


    if ($os === 'Android') {

        $android =
            detect_android_model($ua);

        $brand =
            $android['brand'];

        $model =
            $android['model'];
    }

    elseif ($os === 'iOS' || $os === 'macOS') {

        $apple =
            detect_apple_device($ua);

        $brand =
            $apple['brand'];

        $model =
            $apple['model'];
    }


    // Windows PC
    if (
        $model === null &&
        $os === 'Windows'
    ) {

        $model = 'PC';
    }


    // Linux PC
    if (
        $model === null &&
        $os === 'Linux'
    ) {

        $model = 'PC';
    }


    // ChromeOS
    if (
        $model === null &&
        $os === 'ChromeOS'
    ) {

        $model = 'Chromebook';
    }


    // ----------------------------------------------------------
    // Bot
    // ----------------------------------------------------------

    $isBot =
        detect_bot($ua);


    // ----------------------------------------------------------
    // Result
    // ----------------------------------------------------------

    return [

        'device_type' =>
            $deviceType,

        'brand' =>
            $brand,

        'device_model' =>
            $model,

        'browser' =>
            $browserInfo['browser'],

        'browser_version' =>
            $browserInfo['browser_version'],

        'os' =>
            $os,

        'os_version' =>
            $osVersion,

        'in_app_browser' =>
            $browserInfo['in_app_browser'],

        'in_app_app' =>
            $browserInfo['in_app_app'],

        'is_bot' =>
            $isBot,

        'user_agent' =>
            $ua
    ];
}