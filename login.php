<?php
/**
 * /login.php
 *
 * Standalone sign-in page for the admin dashboard (admin.php). Split out
 * from admin.php so the login screen and the dashboard are two separate
 * files rather than one file doing both jobs.
 *
 * Accepts either:
 *  - The single shared password (config.php / admin_settings) — leave
 *    the username/email field blank, or
 *  - A username or email + password for an individual account created
 *    in the dashboard's Users tab (admin_users).
 */

require __DIR__ . '/api/session_boot.php';
require __DIR__ . '/api/db.php';
require __DIR__ . '/api/auth.php';
require __DIR__ . '/api/helpers.php';

$cfg = require __DIR__ . '/api/config.php';

// Already signed in — nothing to do here.
if (!empty($_SESSION['admin_ok'])) {
    header('Location: admin.php');
    exit;
}

$error = '';

if (isset($_POST['password'])) {
    $pdo = db_connect();

    $lockoutSeconds = login_lockout_seconds_remaining($pdo);
    $identifierAttempt = trim((string)($_POST['username'] ?? ''));

    if ($lockoutSeconds !== null) {

        $minutes = (int)ceil($lockoutSeconds / 60);
        $error = "Too many incorrect attempts. Try again in {$minutes} minute" . ($minutes === 1 ? '' : 's') . '.';

    } elseif (
        // A username or email was entered — check it against accounts
        // created in the Users tab (admin_users) rather than the single
        // shared PIN.
        $identifierAttempt !== ''
        && ($matchedUser = admin_user_login($pdo, $identifierAttempt, (string)$_POST['password']))
    ) {
        $_SESSION['admin_ok']       = true;
        $_SESSION['admin_user_id']  = (int)$matchedUser['id'];
        $_SESSION['admin_username'] = $matchedUser['username'];
        $_SESSION['admin_role']     = $matchedUser['role'];
        login_register_success($pdo);

        // Prevent session fixation.
        session_regenerate_id(true);

        header('Location: admin.php');
        exit;

    } elseif (
        // Nothing entered in that field — this is the original single
        // shared PIN (config.php / admin_settings), unchanged from before.
        $identifierAttempt === ''
        && admin_password_matches($pdo, $cfg, (string)$_POST['password'])
    ) {
        $_SESSION['admin_ok'] = true;
        unset($_SESSION['admin_user_id'], $_SESSION['admin_username'], $_SESSION['admin_role']);
        login_register_success($pdo);

        // Prevent session fixation.
        session_regenerate_id(true);

        header('Location: admin.php');
        exit;

    } else {
        login_register_failure($pdo);
        $error = $identifierAttempt !== '' ? 'Incorrect username/email or password.' : 'Incorrect password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1"
>

<title>Sign in — Admin</title>

<meta
    name="robots"
    content="noindex, nofollow"
>

<link
    rel="icon"
    href="../assets/images/Amin___Black.png"
>

<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
>

<link
    rel="stylesheet"
    href="css/admin.css?v=<?= @filemtime(__DIR__ . '/css/admin.css') ?>">
</head>

<body>


<!-- ========================================================
     LOGIN
     ======================================================== -->

<div class="login-screen">

    <button
        class="icon-btn theme-toggle"
        id="theme-toggle"
        aria-label="Toggle light and dark mode"
        title="Toggle theme"
        style="position:fixed;top:20px;right:20px;"
    >

        <svg
            class="moon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
        >
            <path d="M21 12.4A9 9 0 1 1 11.6 3a7 7 0 0 0 9.4 9.4Z"/>
        </svg>

        <svg
            class="sun"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
        >
            <circle cx="12" cy="12" r="4.5"/>
            <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>
        </svg>

    </button>


    <div class="login-card">

        <div class="avatar-ring">

            <div class="brand-mark">

                <img
                    src="../assets/images/profile.jpg"
                    alt="Mr. Amin"
                >

            </div>

        </div>


        <h1>Admin sign in</h1>

        <div class="sub">
            Enter your password to view the inbox — or, if you have your
            own account (Users tab), your username or email and password.
        </div>


        <form method="post">

            <div class="pw-field" style="margin-bottom:12px;">

                <input
                    type="text"
                    id="login-username"
                    name="username"
                    placeholder="Username or email (leave blank to use the shared password)"
                    autocomplete="username"
                >

            </div>

            <div class="pw-field">

                <input
                    type="password"
                    id="login-password"
                    name="password"
                    placeholder="Password"
                    autofocus
                    autocomplete="current-password"
                >

                <button
                    type="button"
                    class="pw-toggle"
                    data-target="login-password"
                    aria-label="Show password"
                >

                    <svg
                        class="eye"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>

                    <svg
                        class="eye-off"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path d="M2 12s3.5-7 10-7c1.8 0 3.4.5 4.7 1.2M22 12s-3.5 7-10 7c-1.8 0-3.4-.5-4.7-1.2M4 4l16 16"/>
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
                    </svg>

                </button>

            </div>


            <button
                type="submit"
                class="btn btn-primary"
            >
                Unlock inbox
            </button>

        </form>


        <?php if ($error): ?>

            <div class="form-error">
                <?= h($error) ?>
            </div>

        <?php endif; ?>

    </div>

</div>


<!-- Login page JS (theme toggle + password eye toggle only —
     not the dashboard's admin.js) -->
<script src="js/login.js"></script>

<!-- Track visits/attempts to the login page itself -->
<script src="js/track.js"></script>

</body>
</html>
