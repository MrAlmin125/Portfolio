<?php
/**
 * Shared admin-session helpers used by admin.php and admin_action.php.
 * Password is checked against the hash in `admin_settings` (id = 1) once
 * it exists; until the admin changes their password for the first time,
 * it falls back to the plain-text value in config.php so the site keeps
 * working with zero extra setup.
 */

function admin_password_matches(PDO $pdo, array $cfg, string $attempt): bool {
  try {
    $stmt = $pdo->prepare('SELECT password_hash FROM admin_settings WHERE id = 1');
    $stmt->execute();
    $row = $stmt->fetch();
    // Guard against an empty/null password_hash (shouldn't normally
    // happen, but password_verify() requires a string and will throw a
    // deprecation warning — and eventually a TypeError — if given null).
    if ($row && !empty($row['password_hash'])) {
      return password_verify($attempt, $row['password_hash']);
    }
  } catch (PDOException $e) {
    // admin_settings table doesn't exist yet (older schema.sql) — fall
    // through to the config.php comparison below instead of crashing.
  }

  return hash_equals((string)$cfg['admin_password'], $attempt);
}

/**
 * Checks a username + password against the admin_users table (the
 * "User Management" tab's accounts) — separate from the single shared
 * PIN checked by admin_password_matches() above. Returns the matched
 * user's row (with password_hash removed) on success, or null if the
 * username doesn't exist, the account is deactivated, the password is
 * wrong, or the admin_users table doesn't exist yet on an older database.
 */
function admin_user_login(PDO $pdo, string $identifier, string $password): ?array {
  if ($identifier === '' || $password === '') return null;

  try {
    // Accepts either the account's username or its email address in the
    // same field — whichever the person typed.
    $stmt = $pdo->prepare(
      'SELECT id, username, email, password_hash, full_name, role, is_active
       FROM admin_users
       WHERE username = :identifier OR email = :identifier
       LIMIT 1'
    );
    $stmt->execute(['identifier' => $identifier]);
    $user = $stmt->fetch();

    if (!$user || empty($user['password_hash'])) return null;
    if (!(int)$user['is_active']) return null;
    if (!password_verify($password, $user['password_hash'])) return null;

    $update = $pdo->prepare('UPDATE admin_users SET last_login = NOW() WHERE id = :id');
    $update->execute(['id' => $user['id']]);

    unset($user['password_hash']);
    return $user;
  } catch (PDOException $e) {
    // admin_users table doesn't exist yet (older schema.sql) — no
    // individual-user login is possible until it's created; the shared
    // PIN login still works independently of this.
    return null;
  }
}

/* ==========================================================
   BRUTE-FORCE PROTECTION (admin.php login form)
   ========================================================== */

const LOGIN_MAX_ATTEMPTS   = 5;   // failed attempts allowed...
const LOGIN_WINDOW_MINUTES = 15;  // ...within this many minutes...
const LOGIN_LOCKOUT_MINUTES = 15; // ...before this cooldown kicks in.

/**
 * Hash of the caller's IP, using the same technique (and salt) as
 * page_views.ip_hash — the raw IP is never written to login_attempts.
 */
function client_ip_hash(): ?string {
  $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
  $ip = trim(explode(',', $ip)[0]);
  return $ip !== '' ? hash('sha256', $ip . 'amin-portfolio-salt') : null;
}

/**
 * Returns the number of seconds the caller's IP must still wait before
 * it can try the admin password again, or null if it isn't locked out
 * (including if the login_attempts table doesn't exist yet — brute-force
 * protection degrades gracefully rather than blocking login entirely on
 * an un-migrated database).
 */
function login_lockout_seconds_remaining(PDO $pdo): ?int {
  $ipHash = client_ip_hash();
  if ($ipHash === null) return null;

  try {
    $stmt = $pdo->prepare('SELECT locked_until FROM login_attempts WHERE ip_hash = :ip');
    $stmt->execute(['ip' => $ipHash]);
    $row = $stmt->fetch();
    if (!$row || !$row['locked_until']) return null;

    $remaining = strtotime($row['locked_until']) - time();
    return $remaining > 0 ? $remaining : null;
  } catch (PDOException $e) {
    return null;
  }
}

/**
 * Records one failed login attempt for the caller's IP. Once the count
 * reaches LOGIN_MAX_ATTEMPTS within LOGIN_WINDOW_MINUTES, locks that IP
 * out for LOGIN_LOCKOUT_MINUTES.
 */
function login_register_failure(PDO $pdo): void {
  $ipHash = client_ip_hash();
  if ($ipHash === null) return;

  try {
    $stmt = $pdo->prepare('SELECT attempt_count, first_attempt_at FROM login_attempts WHERE ip_hash = :ip');
    $stmt->execute(['ip' => $ipHash]);
    $row = $stmt->fetch();

    $windowExpired = $row && (time() - strtotime($row['first_attempt_at'])) > (LOGIN_WINDOW_MINUTES * 60);

    if (!$row || $windowExpired) {
      // First attempt, or the previous window has expired — start fresh.
      $stmt = $pdo->prepare(
        'INSERT INTO login_attempts (ip_hash, attempt_count, first_attempt_at, last_attempt_at, locked_until)
         VALUES (:ip, 1, NOW(), NOW(), NULL)
         ON DUPLICATE KEY UPDATE attempt_count = 1, first_attempt_at = NOW(), last_attempt_at = NOW(), locked_until = NULL'
      );
      $stmt->execute(['ip' => $ipHash]);
      return;
    }

    $newCount = (int)$row['attempt_count'] + 1;
    $lockedUntil = $newCount >= LOGIN_MAX_ATTEMPTS
      ? date('Y-m-d H:i:s', time() + LOGIN_LOCKOUT_MINUTES * 60)
      : null;

    $stmt = $pdo->prepare(
      'UPDATE login_attempts
       SET attempt_count = :count, last_attempt_at = NOW(), locked_until = :locked
       WHERE ip_hash = :ip'
    );
    $stmt->execute(['count' => $newCount, 'locked' => $lockedUntil, 'ip' => $ipHash]);
  } catch (PDOException $e) {
    // Table missing on an older database — brute-force protection is
    // best-effort, never block a legitimate login attempt over this.
  }
}

/**
 * Clears any recorded failed attempts for the caller's IP after a
 * successful login.
 */
function login_register_success(PDO $pdo): void {
  $ipHash = client_ip_hash();
  if ($ipHash === null) return;

  try {
    $stmt = $pdo->prepare('DELETE FROM login_attempts WHERE ip_hash = :ip');
    $stmt->execute(['ip' => $ipHash]);
  } catch (PDOException $e) {
    // Table missing on an older database — safe to ignore.
  }
}

function admin_set_password(PDO $pdo, string $newPassword): void {
  $hash = password_hash($newPassword, PASSWORD_DEFAULT);
  $stmt = $pdo->prepare(
    'INSERT INTO admin_settings (id, password_hash) VALUES (1, :hash1)
     ON DUPLICATE KEY UPDATE password_hash = :hash2'
  );
  $stmt->execute(['hash1' => $hash, 'hash2' => $hash]);
}

function admin_require_login_json(): void {
  if (empty($_SESSION['admin_ok'])) {
    // Deliberately kept at HTTP 200 (with ok:false in the body) — some
    // hosts/proxies swap the body of non-2xx responses for their own
    // generic error page, which breaks response.json() on the front end
    // and shows as "Unexpected server response." even though the real
    // reason was just an expired session.
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Your session has expired. Please log in again.', 'login_expired' => true]);
    exit;
  }
}

/**
 * Friendly message for the common "table/column doesn't exist" error —
 * this fires when someone is running an older database schema than the
 * current codebase expects (e.g. the reply/change-password features
 * were added after their database was first set up).
 */
function schema_hint_message(): string {
  return 'This feature needs a database update. Please re-run the latest api/schema.sql in phpMyAdmin (it is safe to run again), then try again.';
}
