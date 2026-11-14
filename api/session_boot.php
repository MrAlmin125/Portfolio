<?php
/**
 * Starts the PHP session with hardened cookie flags — used instead of a
 * bare session_start() everywhere the admin panel touches sessions, so
 * every entry point gets the same baseline protection:
 *
 *  - HttpOnly: JavaScript can't read the session cookie (limits what an
 *    XSS bug, if one ever existed, could steal).
 *  - SameSite=Lax: the cookie isn't sent on cross-site requests, which
 *    blocks the common form of CSRF against the admin login/actions.
 *  - Secure (once served over HTTPS): the cookie is never sent in
 *    plaintext over an unencrypted connection. Detected automatically —
 *    stays off on plain HTTP so local/dev use isn't broken, turns on by
 *    itself once the site is loaded over https://.
 */
if (session_status() === PHP_SESSION_NONE) {
  $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

  session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
  ]);
  session_start();
}
