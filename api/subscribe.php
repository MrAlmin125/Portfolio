<?php
/**
 * POST /api/subscribe.php
 * Body (JSON or form-encoded): { "email": "person@example.com" }
 *
 * Saves the email to the `subscribers` table and emails the site owner.
 * Silently returns ok:true for a duplicate email — subscribing twice
 * should feel like success from the visitor's side, not an error.
 */
require __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';
require __DIR__ . '/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  // Kept at HTTP 200 (ok:false in body) — some hosts swap non-2xx bodies
  // for their own generic error page, which breaks response.json().
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

$email = trim($input['email'] ?? '');

// FILTER_VALIDATE_EMAIL doesn't enforce a max length on its own, so an
// unusually long (but technically valid) address could still exceed the
// subscribers.email column (VARCHAR(190)) and fail as a generic DB error.
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 190) {
  echo json_encode(['ok' => false, 'error' => 'Please enter a valid email address.']);
  exit;
}

$pdo = db_connect();

try {
  $stmt = $pdo->prepare('INSERT INTO subscribers (email) VALUES (:email)');
  $stmt->execute(['email' => $email]);
} catch (PDOException $e) {
  // MySQL error 1062 = duplicate entry (unique email already subscribed)
  if ($e->getCode() === '23000') {
    echo json_encode(['ok' => true, 'already' => true]);
    exit;
  }
  echo json_encode(['ok' => false, 'error' => 'Something went wrong. Please try again.']);
  exit;
}

send_owner_notification(
  'New newsletter subscriber',
  ["New subscriber: {$email}", '', 'Sent automatically from the portfolio site.']
);

echo json_encode(['ok' => true]);
