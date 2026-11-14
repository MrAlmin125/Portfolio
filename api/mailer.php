<?php
/**
 * Sends a plain-text notification email to the site owner using PHP's
 * built-in mail(). This works out of the box on most shared hosts.
 *
 * NOTE FOR INFINITYFREE (or any host where mail() is unreliable/blocked):
 * Every submission is saved to the database FIRST, in subscribe.php and
 * contact.php — so nothing is ever lost even if this function silently
 * fails to deliver. You can always read everything at /api/admin.php.
 *
 * If you'd rather have real email delivery than rely on mail(), swap this
 * function's body for an SMTP call (e.g. PHPMailer + a Gmail app password,
 * or an API-based service like Brevo/SendGrid). Nothing else in the
 * codebase needs to change — every caller just calls send_owner_notification().
 */
/**
 * Strips CR/LF from a value that's going into a mail() argument. mail()'s
 * subject (and, on some MTAs, other arguments) becomes part of a raw
 * header block internally — a subject containing "\r\n" can be used to
 * inject extra headers (e.g. Bcc:) into the outgoing message. Every value
 * that ends up here can originate from visitor input (the contact form's
 * subject line), so this must run before it ever reaches mail().
 */
function strip_header_injection(string $value): string {
  return trim(str_replace(["\r", "\n"], '', $value));
}

function send_owner_notification(string $subject, array $bodyLines): void {
  $cfg = require __DIR__ . '/config.php';
  $to  = $cfg['owner_email'];

  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  $from = 'no-reply@' . $host;

  $subject = strip_header_injection($subject);
  $body = implode("\n", $bodyLines);

  $headers  = "From: {$cfg['site_name']} <{$from}>\r\n";
  $headers .= "Reply-To: {$from}\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

  // @ suppresses warnings if mail() is disabled by the host — the request
  // still succeeds for the visitor and the data is already safely in the DB.
  @mail($to, $subject, $body, $headers);
}

/**
 * Sends a reply from the site owner to a visitor's email address.
 * The "From" address stays on your own domain (so receiving mail servers
 * don't flag it as spoofing your Gmail address) — the "Reply-To" is set
 * to your real inbox, so hitting "reply" in the visitor's email client
 * goes straight to you.
 */
function send_reply_email(string $toEmail, string $subject, string $body): bool {
  $cfg  = require __DIR__ . '/config.php';
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  $from = 'no-reply@' . $host;

  // $toEmail is already validated by filter_var(FILTER_VALIDATE_EMAIL)
  // wherever it originates, which rejects CR/LF on its own — but $subject
  // is partly built from the visitor's own (unsanitized) contact-form
  // subject line, so it needs the same CRLF stripping as the function above.
  $subject = strip_header_injection($subject);

  $headers  = "From: {$cfg['site_name']} <{$from}>\r\n";
  $headers .= "Reply-To: {$cfg['owner_email']}\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

  return @mail($toEmail, $subject, $body, $headers);
}
