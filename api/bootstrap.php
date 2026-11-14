<?php
/**
 * api/bootstrap.php
 *
 * Included FIRST by every public JSON endpoint (contact.php, subscribe.php,
 * track.php). Two problems this solves, both of which show up as "the
 * backend sometimes shows raw HTML/code instead of working, refresh fixes
 * it" on shared/free hosting:
 *
 * 1. Some hosts run with display_errors=On. A stray PHP notice/warning
 *    (or a fatal error) gets printed as raw text/HTML *before* our
 *    json_encode() output, so the browser receives something like
 *    "<br />Warning: ... {"ok":true}" — which is not valid JSON and
 *    fails response.json() on the front end.
 *      Fix: turn error DISPLAY off (errors are still logged), and never
 *      let anything but our own json_encode() reach the response body.
 *
 * 2. If PHP hits a fatal error anyway (e.g. a host resource limit), PHP's
 *    own default fatal-error output is HTML, not JSON.
 *      Fix: a shutdown handler that catches a fatal error and — if we
 *      haven't already sent a response — emits a clean JSON error
 *      instead of PHP's default HTML.
 */

// Never show errors to the visitor — only log them server-side.
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Buffer output so a stray warning/notice can't leak ahead of our JSON;
// if something unexpected got printed, discard it and send clean JSON.
ob_start();

register_shutdown_function(function () {
  $error = error_get_last();
  $isFatal = $error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true);

  if ($isFatal) {
    // Discard anything already buffered (partial HTML error output, etc.)
    if (ob_get_level() > 0) ob_end_clean();
    if (!headers_sent()) header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
      'ok'    => false,
      'error' => 'Something went wrong on our end. Please try again in a moment.',
    ]);
    return;
  }

  // Normal case: flush the buffered (valid) response as-is.
  if (ob_get_level() > 0) ob_end_flush();
});
