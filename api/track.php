<?php
/**
 * POST /api/track.php
 * Body (JSON): { visitor_id, page, referrer?, lang?, ... plus the extended
 * device/browser/network fields documented in js/track.js }
 *
 * Records one page-view row. Called once per page load from track.js
 * using navigator.sendBeacon (fire-and-forget, doesn't block the page
 * or wait for a response). Failures here should never be visible to
 * a visitor, so this endpoint always responds quickly and quietly.
 */
require __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';
require __DIR__ . '/ua_parser.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['ok' => false]);
  exit;
}

$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) $input = $_POST;

/**
 * Small sanitizer helpers — every value from the client is untrusted, so
 * everything gets a hard length/range clamp before it's anywhere near a
 * query. Out-of-range or malformed values become null rather than causing
 * an insert failure (which would silently drop the whole row — see the
 * catch block below).
 */
function t_str($input, string $key, int $maxLen): ?string {
  $v = trim((string)($input[$key] ?? ''));
  if ($v === '') return null;
  return mb_substr($v, 0, $maxLen);
}

function t_int($input, string $key, int $min, int $max): ?int {
  if (!isset($input[$key]) || $input[$key] === '' || $input[$key] === null) return null;
  if (!is_numeric($input[$key])) return null;
  $v = (int)round((float)$input[$key]);
  if ($v < $min || $v > $max) return null;
  return $v;
}

function t_float($input, string $key, float $min, float $max): ?float {
  if (!isset($input[$key]) || $input[$key] === '' || $input[$key] === null) return null;
  if (!is_numeric($input[$key])) return null;
  $v = (float)$input[$key];
  if ($v < $min || $v > $max) return null;
  return $v;
}

function t_bool($input, string $key): ?int {
  if (!isset($input[$key]) || $input[$key] === '' || $input[$key] === null) return null;
  return $input[$key] ? 1 : 0;
}

$visitorId = t_str($input, 'visitor_id', 64);
$page      = t_str($input, 'page', 255) ?? '/';
$pageUrl   = t_str($input, 'page_url', 500);
$referrer  = t_str($input, 'referrer', 255);
$lang      = t_str($input, 'lang', 10);

// Some browsers (Brave, notably) deliberately send a UA string that says
// "Chrome" for site-compatibility, so track.js feature-detects them
// client-side (e.g. navigator.brave) and tells us the real name here.
$browserOverride = t_str($input, 'browser_override', 60);
// Chromium hides the real device model from the User-Agent header for
// privacy, but track.js can recover it via the User-Agent Client Hints
// API (navigator.userAgentData) and send it here instead.
$modelOverride = t_str($input, 'model_override', 120);

// The visitor's own IANA timezone (e.g. "Asia/Riyadh", "Asia/Dhaka"),
// read client-side via Intl.DateTimeFormat(). Saved per row so the admin
// panel can show each visit at that visitor's own local time.
$visitorTz = t_str($input, 'visitor_tz', 60);
if ($visitorTz !== null) {
  try { new DateTimeZone($visitorTz); } catch (Throwable $e) { $visitorTz = null; } // discard anything not a real IANA zone
}

if ($visitorId === null) {
  echo json_encode(['ok' => false]);
  exit;
}

// ----------------------------------------------------------------------
// Extended device / browser / network fields (see js/track.js buildPayload).
// These match the columns added to page_views in schema.sql. Clamped to
// each column's real type/range so an odd value never breaks the insert.
// ----------------------------------------------------------------------
$platform        = t_str($input, 'platform', 60);
$platformVersion = t_str($input, 'platform_version', 30);
$architecture    = t_str($input, 'architecture', 30);
$bitness         = t_str($input, 'bitness', 10);

$screenWidth      = t_int($input, 'screen_width', 0, 20000);
$screenHeight     = t_int($input, 'screen_height', 0, 20000);
$viewportWidth    = t_int($input, 'viewport_width', 0, 20000);
$viewportHeight   = t_int($input, 'viewport_height', 0, 20000);
$devicePixelRatio = t_float($input, 'device_pixel_ratio', 0, 99.99);

$touch       = t_bool($input, 'touch');
$touchPoints = t_int($input, 'touch_points', 0, 255);

$hardwareConcurrency = t_int($input, 'hardware_concurrency', 0, 255);
$deviceMemory        = t_float($input, 'device_memory', 0, 999.9);

$connectionType = t_str($input, 'connection_type', 20);
$downlink       = t_float($input, 'downlink', 0, 9999.99);
$rtt            = t_int($input, 'rtt', 0, 65535);

// The User-Agent string itself always comes from the request header
// (authoritative, matches what parse_user_agent() below actually parsed)
// rather than the client-reported copy, so the stored value can't be
// spoofed independently of the parsed device/browser/OS fields.
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$userAgent = $ua !== '' ? mb_substr($ua, 0, 512) : null;

$parsed = parse_user_agent($ua);
if ($browserOverride !== null) $parsed['browser'] = $browserOverride;
if ($modelOverride !== null) $parsed['device_model'] = $modelOverride;

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$ip = trim(explode(',', $ip)[0]);
$ipHash = $ip !== '' ? hash('sha256', $ip . 'amin-portfolio-salt') : null;

try {
  $pdo = db_connect();
  $stmt = $pdo->prepare(
    'INSERT INTO page_views (
        visitor_id, page, page_url, referrer,
        device_type, brand, device_model,
        browser, browser_version, in_app_browser, is_bot,
        os, os_version,
        lang,
        platform, platform_version, architecture, bitness,
        screen_width, screen_height, viewport_width, viewport_height, device_pixel_ratio,
        touch, touch_points,
        hardware_concurrency, device_memory,
        connection_type, downlink, rtt,
        user_agent,
        ip_address, ip_hash, visitor_tz, created_at
     ) VALUES (
        :visitor_id, :page, :page_url, :referrer,
        :device_type, :brand, :device_model,
        :browser, :browser_version, :in_app_browser, :is_bot,
        :os, :os_version,
        :lang,
        :platform, :platform_version, :architecture, :bitness,
        :screen_width, :screen_height, :viewport_width, :viewport_height, :device_pixel_ratio,
        :touch, :touch_points,
        :hardware_concurrency, :device_memory,
        :connection_type, :downlink, :rtt,
        :user_agent,
        :ip_address, :ip_hash, :visitor_tz, :created_at
     )'
  );
  $stmt->execute([
    'visitor_id'   => $visitorId,
    'page'         => $page,
    'page_url'     => $pageUrl,
    'referrer'     => $referrer,

    'device_type'  => $parsed['device_type'],
    'brand'        => $parsed['brand'],
    'device_model' => $parsed['device_model'],

    'browser'         => $parsed['browser'],
    'browser_version' => $parsed['browser_version'],
    'in_app_browser'  => $parsed['in_app_browser'] ? 1 : 0,
    'is_bot'          => $parsed['is_bot'] ? 1 : 0,

    'os'         => $parsed['os'],
    'os_version' => $parsed['os_version'],

    'lang' => $lang,

    'platform'         => $platform,
    'platform_version' => $platformVersion,
    'architecture'     => $architecture,
    'bitness'          => $bitness,

    'screen_width'       => $screenWidth,
    'screen_height'      => $screenHeight,
    'viewport_width'     => $viewportWidth,
    'viewport_height'    => $viewportHeight,
    'device_pixel_ratio' => $devicePixelRatio,

    'touch'        => $touch,
    'touch_points' => $touchPoints,

    'hardware_concurrency' => $hardwareConcurrency,
    'device_memory'        => $deviceMemory,

    'connection_type' => $connectionType,
    'downlink'         => $downlink,
    'rtt'              => $rtt,

    'user_agent' => $userAgent,

    'ip_address' => $ip !== '' ? $ip : null,
    'ip_hash'    => $ipHash,
    'visitor_tz' => $visitorTz,
    // Always stored in UTC (db.php sets PHP's timezone to UTC) — the
    // admin panel converts to each visitor's own timezone when showing it.
    'created_at' => date('Y-m-d H:i:s'),
  ]);
} catch (Throwable $e) {
  // Analytics must never break the site — swallow any error (including
  // an older database that hasn't run the latest schema.sql yet) and
  // respond ok.
}

echo json_encode(['ok' => true]);
