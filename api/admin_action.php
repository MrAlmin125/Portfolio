<?php
/**
 * POST /api/admin_action.php
 * Body (JSON): { "action": "mark_read" | "reply" | "edit_message" | "delete_message" |
 *                "create_post" | "edit_post" | "delete_post" | "change_password", ...fields }
 *
 * A single authenticated endpoint for everything the admin panel does
 * after login, so there's one place that checks the session.
 */
require __DIR__ . '/session_boot.php';
header('Content-Type: application/json; charset=utf-8');

// Safety net: if anything below throws an uncaught error, or PHP hits a
// fatal error, this guarantees the response body is still valid JSON
// instead of an HTML error page — an HTML body is what makes the admin
// panel's fetch() calls fail with "Unexpected server response."
set_exception_handler(function ($e) {
  if (!headers_sent()) header('Content-Type: application/json; charset=utf-8');
  echo json_encode(['ok' => false, 'error' => 'Unexpected server error.']);
  exit;
});
register_shutdown_function(function () {
  $err = error_get_last();
  if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
    if (!headers_sent()) header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Unexpected server error.']);
  }
});

require __DIR__ . '/db.php';
require __DIR__ . '/mailer.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/ip_block.php';
require __DIR__ . '/helpers.php';

admin_require_login_json();

$cfg = require __DIR__ . '/config.php';
$pdo = db_connect();

// Small helper: format "now" in the site owner's own timezone (PHP's
// default timezone is UTC — see db.php — so this needs an explicit
// conversion rather than a plain date() call).
function now_in_admin_tz(string $format): string {
  global $cfg;
  try {
    $dt = new DateTime('now', new DateTimeZone($cfg['timezone'] ?? 'Asia/Dhaka'));
  } catch (Throwable $e) {
    $dt = new DateTime('now');
  }
  return $dt->format($format);
}

// Validates + cleans the fields shared by create_post and edit_post.
// Returns ['error' => string] on failure, or the cleaned fields on
// success — sanitize_blog_html() (api/helpers.php) has already run on
// ['content'] by the time this returns.
function validate_post_input(array $input): array {
  $title      = trim((string)($input['title'] ?? ''));
  $excerpt    = trim((string)($input['excerpt'] ?? ''));
  $contentRaw = (string)($input['content'] ?? '');
  $cover      = trim((string)($input['cover_image'] ?? ''));
  $status     = ($input['status'] ?? 'draft') === 'published' ? 'published' : 'draft';

  if ($title === '') return ['error' => 'Title is required.'];
  if (mb_strlen($title) > 200) return ['error' => 'Title is too long (200 characters max).'];
  if (mb_strlen($excerpt) > 300) return ['error' => 'Excerpt is too long (300 characters max).'];
  if (mb_strlen($cover) > 500) return ['error' => 'Cover image URL is too long.'];
  if ($cover !== '' && !filter_var($cover, FILTER_VALIDATE_URL) && !str_starts_with($cover, '/')) {
    return ['error' => 'Cover image should be a full URL or a path starting with /.'];
  }

  $content = sanitize_blog_html($contentRaw);
  if (trim(strip_tags($content)) === '' && !preg_match('/<img\b/i', $content)) {
    return ['error' => 'Post content cannot be empty.'];
  }
  if ($excerpt === '') $excerpt = blog_excerpt_from_html($content, 200);

  return [
    'title' => $title, 'excerpt' => $excerpt, 'content' => $content,
    'cover_image' => $cover !== '' ? $cover : null, 'status' => $status,
  ];
}

// Picks a unique slug for a post: slugify($preferred), then append
// -2, -3, ... if that value is already taken by a *different* post.
function unique_post_slug(PDO $pdo, string $preferred, int $excludeId): string {
  $base = slugify($preferred);
  $slug = $base;
  $suffix = 2;
  while (true) {
    $stmt = $pdo->prepare('SELECT id FROM blog_posts WHERE slug = :slug AND id != :id');
    $stmt->execute(['slug' => $slug, 'id' => $excludeId]);
    if (!$stmt->fetch()) return $slug;
    $slug = $base . '-' . $suffix;
    $suffix++;
  }
}

$raw    = file_get_contents('php://input');
$input  = json_decode($raw, true) ?: [];
$action = $input['action'] ?? '';

switch ($action) {

  case 'add_subscriber': {
    $email = trim($input['email'] ?? '');

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
      echo json_encode(['ok' => false, 'error' => 'Please enter a valid email address.']);
      exit;
    }

    try {
      $stmt = $pdo->prepare('INSERT INTO subscribers (email) VALUES (:email)');
      $stmt->execute(['email' => $email]);
      $newId = (int)$pdo->lastInsertId();
    } catch (PDOException $e) {
      if ($e->getCode() === '23000') {
        echo json_encode(['ok' => true, 'already' => true, 'email' => $email]);
        exit;
      }
      echo json_encode(['ok' => false, 'error' => 'Something went wrong. Please try again.']);
      exit;
    }

    echo json_encode(['ok' => true, 'email' => $email, 'created_at' => now_in_admin_tz('d M Y'), 'id' => $newId]);
    break;
  }

  case 'mark_read': {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'error' => 'Missing message id.']); exit; }

    $stmt = $pdo->prepare('UPDATE messages SET is_read = 1 WHERE id = :id');
    $stmt->execute(['id' => $id]);
    echo json_encode(['ok' => true]);
    break;
  }

  case 'reply': {
    $id    = (int)($input['id'] ?? 0);
    $reply = trim($input['reply'] ?? '');

    if ($id <= 0 || $reply === '') {
      echo json_encode(['ok' => false, 'error' => 'Write a reply before sending.']);
      exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM messages WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $msg = $stmt->fetch();

    if (!$msg) {
      echo json_encode(['ok' => false, 'error' => 'Message not found.']);
      exit;
    }

    $subject = 'Re: ' . ($msg['subject'] ?: 'your message to ' . $cfg['site_name']);
    $body = $reply . "\n\n"
          . "----- Your original message -----\n"
          . $msg['message'];

    $sent = send_reply_email($msg['email'], $subject, $body);

    try {
      $stmt = $pdo->prepare(
        'UPDATE messages SET reply_text = :reply, is_replied = 1, replied_at = NOW(), is_read = 1 WHERE id = :id'
      );
      $stmt->execute(['reply' => $reply, 'id' => $id]);
    } catch (PDOException $e) {
      echo json_encode(['ok' => false, 'error' => schema_hint_message()]);
      exit;
    }

    echo json_encode(['ok' => true, 'mailed' => $sent, 'replied_at' => now_in_admin_tz('Y-m-d h:i A')]);
    break;
  }

  case 'edit_message': {
    $id      = (int)($input['id'] ?? 0);
    $name    = trim((string)($input['name'] ?? ''));
    $email   = trim((string)($input['email'] ?? ''));
    $phone   = trim((string)($input['phone'] ?? ''));
    $subject = trim((string)($input['subject'] ?? ''));
    $message = trim((string)($input['message'] ?? ''));

    if ($id <= 0) {
      echo json_encode(['ok' => false, 'error' => 'Missing message id.']);
      exit;
    }

    // Same field limits as the public contact form (api/contact.php) —
    // an admin edit shouldn't be able to exceed what the messages table
    // (see schema.sql) actually allows.
    $maxLengths = ['name' => 120, 'email' => 190, 'phone' => 40, 'subject' => 190, 'message' => 10000];

    $errors = [];
    if ($name === '') $errors[] = 'name';
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
    if ($message === '') $errors[] = 'message';
    foreach ($maxLengths as $field => $max) {
      if (mb_strlen($$field) > $max && !in_array($field, $errors, true)) $errors[] = $field;
    }

    if (!empty($errors)) {
      echo json_encode(['ok' => false, 'error' => 'Please check the name, email, and message — one of them is missing or too long.', 'fields' => $errors]);
      exit;
    }

    $stmt = $pdo->prepare(
      'UPDATE messages SET name = :name, email = :email, phone = :phone, subject = :subject, message = :message WHERE id = :id'
    );
    $stmt->execute([
      'name'    => $name,
      'email'   => $email,
      'phone'   => $phone !== '' ? $phone : null,
      'subject' => $subject !== '' ? $subject : null,
      'message' => $message,
      'id'      => $id,
    ]);

    echo json_encode([
      'ok' => true,
      'name' => $name, 'email' => $email, 'phone' => $phone, 'subject' => $subject, 'message' => $message,
    ]);
    break;
  }

  case 'delete_message': {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'error' => 'Missing message id.']); exit; }

    $stmt = $pdo->prepare('SELECT is_read FROM messages WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch();

    $stmt = $pdo->prepare('DELETE FROM messages WHERE id = :id');
    $stmt->execute(['id' => $id]);

    echo json_encode(['ok' => true, 'was_unread' => $row ? !$row['is_read'] : false]);
    break;
  }

  case 'create_post': {
    $fields = validate_post_input($input);
    if (isset($fields['error'])) { echo json_encode(['ok' => false, 'error' => $fields['error']]); exit; }

    $slug = unique_post_slug($pdo, (string)($input['slug'] ?? $fields['title']), 0);
    // Stored in UTC, like created_at (DB default) and everything else in
    // this app — see the note in db.php. now_in_admin_tz() is only for
    // values sent straight back to the browser for immediate display.
    $publishedAt = $fields['status'] === 'published' ? gmdate('Y-m-d H:i:s') : null;

    try {
      $stmt = $pdo->prepare(
        'INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, status, published_at)
         VALUES (:title, :slug, :excerpt, :content, :cover_image, :status, :published_at)'
      );
      $stmt->execute([
        'title' => $fields['title'], 'slug' => $slug, 'excerpt' => $fields['excerpt'],
        'content' => $fields['content'], 'cover_image' => $fields['cover_image'],
        'status' => $fields['status'], 'published_at' => $publishedAt,
      ]);
    } catch (PDOException $e) {
      echo json_encode(['ok' => false, 'error' => schema_hint_message()]);
      exit;
    }

    echo json_encode([
      'ok' => true, 'id' => (int)$pdo->lastInsertId(), 'slug' => $slug,
      'title' => $fields['title'], 'excerpt' => $fields['excerpt'], 'content' => $fields['content'],
      'cover_image' => $fields['cover_image'], 'status' => $fields['status'],
      'created_at' => now_in_admin_tz('d M Y'),
    ]);
    break;
  }

  case 'edit_post': {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'error' => 'Missing post id.']); exit; }

    $fields = validate_post_input($input);
    if (isset($fields['error'])) { echo json_encode(['ok' => false, 'error' => $fields['error']]); exit; }

    $stmt = $pdo->prepare('SELECT status, published_at FROM blog_posts WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) { echo json_encode(['ok' => false, 'error' => 'Post not found.']); exit; }

    $slug = unique_post_slug($pdo, (string)($input['slug'] ?? $fields['title']), $id);
    $publishedAt = $existing['published_at'];
    // Same UTC-storage rule as create_post above.
    if ($fields['status'] === 'published' && !$publishedAt) $publishedAt = gmdate('Y-m-d H:i:s');
    if ($fields['status'] === 'draft') $publishedAt = null; // unpublishing clears it; republishing later re-stamps it

    try {
      $stmt = $pdo->prepare(
        'UPDATE blog_posts SET title = :title, slug = :slug, excerpt = :excerpt, content = :content,
         cover_image = :cover_image, status = :status, published_at = :published_at WHERE id = :id'
      );
      $stmt->execute([
        'title' => $fields['title'], 'slug' => $slug, 'excerpt' => $fields['excerpt'],
        'content' => $fields['content'], 'cover_image' => $fields['cover_image'],
        'status' => $fields['status'], 'published_at' => $publishedAt, 'id' => $id,
      ]);
    } catch (PDOException $e) {
      echo json_encode(['ok' => false, 'error' => schema_hint_message()]);
      exit;
    }

    echo json_encode([
      'ok' => true, 'slug' => $slug, 'title' => $fields['title'], 'excerpt' => $fields['excerpt'],
      'content' => $fields['content'], 'cover_image' => $fields['cover_image'], 'status' => $fields['status'],
    ]);
    break;
  }

  case 'delete_post': {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'error' => 'Missing post id.']); exit; }
    $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = :id');
    $stmt->execute(['id' => $id]);
    echo json_encode(['ok' => true]);
    break;
  }

  case 'change_password': {
    $current = (string)($input['current_password'] ?? '');
    $new     = (string)($input['new_password'] ?? '');
    $confirm = (string)($input['confirm_password'] ?? '');

    if (!admin_password_matches($pdo, $cfg, $current)) {
      echo json_encode(['ok' => false, 'error' => 'Your current password is incorrect.']);
      exit;
    }
    if (strlen($new) < 8) {
      echo json_encode(['ok' => false, 'error' => 'New password must be at least 8 characters.']);
      exit;
    }
    if ($new !== $confirm) {
      echo json_encode(['ok' => false, 'error' => 'New password and confirmation do not match.']);
      exit;
    }

    try {
      admin_set_password($pdo, $new);
    } catch (PDOException $e) {
      echo json_encode(['ok' => false, 'error' => schema_hint_message()]);
      exit;
    }
    echo json_encode(['ok' => true]);
    break;
  }

  case 'online_count': {
    $stmt = $pdo->query("SELECT COUNT(DISTINCT visitor_id) FROM page_views WHERE created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 MINUTE)");
    echo json_encode(['ok' => true, 'online_now' => (int)$stmt->fetchColumn()]);
    break;
  }

  case 'delete_visit': {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'error' => 'Missing record id.']); exit; }
    $stmt = $pdo->prepare('DELETE FROM page_views WHERE id = :id');
    $stmt->execute(['id' => $id]);
    echo json_encode(['ok' => true]);
    break;
  }

  case 'delete_all_visits': {
    $pdo->exec('DELETE FROM page_views');
    echo json_encode(['ok' => true]);
    break;
  }

  case 'edit_subscriber': {
    $id    = (int)($input['id'] ?? 0);
    $email = trim($input['email'] ?? '');

    if ($id <= 0) { echo json_encode(['ok' => false, 'error' => 'Missing subscriber id.']); exit; }
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
      echo json_encode(['ok' => false, 'error' => 'Please enter a valid email address.']);
      exit;
    }

    try {
      $stmt = $pdo->prepare('UPDATE subscribers SET email = :email WHERE id = :id');
      $stmt->execute(['email' => $email, 'id' => $id]);
    } catch (PDOException $e) {
      if ($e->getCode() === '23000') {
        echo json_encode(['ok' => false, 'error' => 'That email is already on the list.']);
        exit;
      }
      echo json_encode(['ok' => false, 'error' => 'Something went wrong. Please try again.']);
      exit;
    }

    echo json_encode(['ok' => true, 'email' => $email]);
    break;
  }

  case 'delete_subscriber': {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'error' => 'Missing subscriber id.']); exit; }
    $stmt = $pdo->prepare('DELETE FROM subscribers WHERE id = :id');
    $stmt->execute(['id' => $id]);
    echo json_encode(['ok' => true]);
    break;
  }

  case 'block_ip': {
    $ip = trim((string)($input['ip'] ?? ''));
    $reason = trim((string)($input['reason'] ?? ''));

    if ($ip === '' || !filter_var($ip, FILTER_VALIDATE_IP)) {
      echo json_encode(['ok' => false, 'error' => 'That doesn\'t look like a valid IP address.']);
      exit;
    }
    if (mb_strlen($reason) > 190) {
      echo json_encode(['ok' => false, 'error' => 'Reason is too long (190 characters max).']);
      exit;
    }

    try {
      $htaccessWritable = ip_block_add($pdo, $ip, $reason);
    } catch (PDOException $e) {
      echo json_encode(['ok' => false, 'error' => schema_hint_message()]);
      exit;
    }

    $rule = ip_block_rule_text(array_column(ip_block_list($pdo), 'ip_address'));

    echo json_encode([
      'ok' => true,
      'htaccess_writable' => $htaccessWritable,
      'rule_text' => $rule,
    ]);
    break;
  }

  case 'unblock_ip': {
    $ip = trim((string)($input['ip'] ?? ''));
    if ($ip === '') { echo json_encode(['ok' => false, 'error' => 'Missing IP address.']); exit; }

    try {
      $htaccessWritable = ip_block_remove($pdo, $ip);
    } catch (PDOException $e) {
      echo json_encode(['ok' => false, 'error' => schema_hint_message()]);
      exit;
    }

    echo json_encode(['ok' => true, 'htaccess_writable' => $htaccessWritable]);
    break;
  }

  case 'set_visitor_note': {
    $visitorId = trim((string)($input['visitor_id'] ?? ''));
    $note      = trim((string)($input['note'] ?? ''));

    if ($visitorId === '') {
      echo json_encode(['ok' => false, 'error' => 'Missing visitor id.']);
      exit;
    }
    if (mb_strlen($note) > 190) {
      echo json_encode(['ok' => false, 'error' => 'Note is too long (190 characters max).']);
      exit;
    }

    try {
      if ($note === '') {
        // Blank note = remove the label entirely rather than storing an
        // empty row.
        $stmt = $pdo->prepare('DELETE FROM visitor_notes WHERE visitor_id = :visitor_id');
        $stmt->execute(['visitor_id' => $visitorId]);
      } else {
        $stmt = $pdo->prepare(
          'INSERT INTO visitor_notes (visitor_id, note)
           VALUES (:visitor_id, :note)
           ON DUPLICATE KEY UPDATE note = VALUES(note), updated_at = NOW()'
        );
        $stmt->execute(['visitor_id' => $visitorId, 'note' => $note]);
      }
    } catch (PDOException $e) {
      echo json_encode(['ok' => false, 'error' => schema_hint_message()]);
      exit;
    }

    echo json_encode(['ok' => true, 'note' => $note]);
    break;
  }

  default:
    echo json_encode(['ok' => false, 'error' => 'Unknown action.']);
}
