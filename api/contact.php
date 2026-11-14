<?php
/**
 * POST /api/contact.php
 * Body (JSON or form-encoded): { name, email, phone?, subject?, message }
 *
 * Saves the message to the `messages` table and emails the site owner.
 * The message is stored FIRST — email delivery is a nice-to-have, not
 * something the visitor's submission depends on.
 */
require __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';
require __DIR__ . '/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  // Deliberately kept at HTTP 200 (with ok:false in the body) — some
  // hosts/proxies swap the body of non-2xx responses for their own
  // generic error page, which breaks response.json() on the front end.
  echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
  exit;
}

$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) $input = $_POST;

// Honeypot — real visitors never fill this hidden field, bots often do.
if (!empty($input['website'])) {
  echo json_encode(['ok' => true]);
  exit;
}

$name    = trim($input['name'] ?? '');
$email   = trim($input['email'] ?? '');
$phone   = trim($input['phone'] ?? '');
$subject = trim($input['subject'] ?? '');
$message = trim($input['message'] ?? '');

// Column limits mirror the `messages` table in schema.sql — validating
// against them here means a too-long submission gets a clear per-field
// error instead of either being silently truncated or throwing a generic
// database error with no indication of what went wrong.
$maxLengths = [
  'name'    => 120,
  'email'   => 190,
  'phone'   => 40,
  'subject' => 190,
  'message' => 10000, // messages.message is TEXT (no hard column limit), but this keeps submissions sane
];

$errors = [];
if ($name === '')                                      $errors[] = 'name';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'email';
if ($message === '')                                   $errors[] = 'message';

foreach ($maxLengths as $field => $max) {
  if (mb_strlen($$field) > $max && !in_array($field, $errors, true)) {
    $errors[] = $field;
  }
}

if (!empty($errors)) {
  echo json_encode(['ok' => false, 'error' => 'Please check your name, email, and message — one of them is missing or too long.', 'fields' => $errors]);
  exit;
}

$pdo = db_connect();

try {
  $stmt = $pdo->prepare(
    'INSERT INTO messages (name, email, phone, subject, message) VALUES (:name, :email, :phone, :subject, :message)'
  );
  $stmt->execute([
    'name'    => $name,
    'email'   => $email,
    'phone'   => $phone !== '' ? $phone : null,
    'subject' => $subject !== '' ? $subject : null,
    'message' => $message,
  ]);
} catch (PDOException $e) {
  echo json_encode(['ok' => false, 'error' => 'Something went wrong. Please try again.']);
  exit;
}

// Also add them to the newsletter list if they opted in (checkbox is
// checked by default). Best-effort: a duplicate (already subscribed) or
// any other issue here should never fail the contact form submission.
$wantsSubscribe = !array_key_exists('subscribe', $input) || $input['subscribe'] !== false;
if ($wantsSubscribe) {
  try {
    $stmt = $pdo->prepare('INSERT INTO subscribers (email) VALUES (:email)');
    $stmt->execute(['email' => $email]);
  } catch (PDOException $e) {
    // duplicate email or subscribers table missing — safe to ignore here
  }
}

send_owner_notification(
  $subject !== '' ? "New message: {$subject}" : 'New contact form message',
  [
    "Name: {$name}",
    "Email: {$email}",
    'Phone: ' . ($phone !== '' ? $phone : '—'),
    'Subject: ' . ($subject !== '' ? $subject : '—'),
    '',
    'Message:',
    $message,
    '',
    '— Sent automatically from the portfolio contact form.',
  ]
);

echo json_encode(['ok' => true]);
