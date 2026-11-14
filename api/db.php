<?php
/**
 * Safety net: a handful of shared hosts (some InfinityFree plans among
 * them) ship PHP without the mbstring extension enabled. Every mb_*
 * function used anywhere in this codebase (contact.php, subscribe.php,
 * track.php, admin.php, admin_action.php) is undefined in that case,
 * which is a fatal "Call to undefined function" error — one that
 * happens to produce exactly the symptom reported: the form "does
 * nothing" and the visitor only ever sees the generic fallback text,
 * because the JSON response never makes it back to the browser intact.
 *
 * These polyfills are only defined if mbstring is missing, so on a
 * normal host (mbstring present) this block does nothing at all. They
 * aren't full multi-byte-correct implementations, but they keep the
 * forms working instead of hard-crashing — degrading gracefully is
 * strictly better than a fatal error on every submission.
 */
if (!function_exists('mb_strlen')) {
  function mb_strlen($s, $enc = null) { return strlen((string)$s); }
}
if (!function_exists('mb_substr')) {
  function mb_substr($s, $start, $len = null, $enc = null) {
    return $len === null ? substr((string)$s, $start) : substr((string)$s, $start, $len);
  }
}
if (!function_exists('mb_strtolower')) {
  function mb_strtolower($s, $enc = null) { return strtolower((string)$s); }
}
if (!function_exists('mb_strtoupper')) {
  function mb_strtoupper($s, $enc = null) { return strtoupper((string)$s); }
}

/**
 * Opens a PDO connection using the credentials in config.php.
 * On failure, sends a JSON error response and stops execution —
 * every endpoint that calls this can assume it gets a working $pdo back.
 */
function db_connect(): PDO {
  $cfg = require __DIR__ . '/config.php';
  $d = $cfg['db'];

  // Everything is stored in UTC — one fixed reference point, regardless
  // of where the server or any single visitor happens to be. Each visit
  // is then displayed in *that visitor's own* timezone (captured
  // client-side and saved per row); everything else (messages,
  // subscribers, "today"/"this week" stat boundaries) is shown in the
  // site owner's configured timezone (see config.php 'timezone'). Doing
  // the conversion at display time — instead of writing localized times
  // to the database — means nothing has to be re-guessed later.
  date_default_timezone_set('UTC');

  try {
    $pdo = new PDO(
      "mysql:host={$d['host']};dbname={$d['name']};charset=utf8mb4",
      $d['user'],
      $d['pass'],
      [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      ]
    );
    // Keep MySQL's own NOW()/CURRENT_TIMESTAMP (used by the messages and
    // subscribers tables' default timestamp, and by the "reply" action)
    // aligned to the same UTC reference point.
    try {
      $pdo->exec("SET time_zone = '+00:00'");
    } catch (Throwable $e) {
      // Some restricted hosts don't allow SET time_zone — safe to skip;
      // PHP-side timestamps (used everywhere it matters) still work.
    }
    return $pdo;
  } catch (PDOException $e) {
    if (!headers_sent()) header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
      'ok'    => false,
      'error' => 'Database connection failed. Check api/config.php credentials.',
    ]);
    exit;
  }
}
