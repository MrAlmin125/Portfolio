<?php
/**
 * /admin.php
 *
 * Password-protected admin dashboard.
 *
 * Shows:
 *  - Messages
 *  - Subscribers
 *  - Analytics
 *  - Recent visits
 *  - ALL page_views database fields
 *  - User Management
 *
 * No database schema changes required.
 */

require __DIR__ . '/api/session_boot.php';

require __DIR__ . '/api/db.php';
require __DIR__ . '/api/auth.php';
require __DIR__ . '/api/ip_block.php';

$cfg = require __DIR__ . '/api/config.php';

$error = '';

/* ==========================================================
   AUTH
   ========================================================== */

if (isset($_POST['logout'])) {
    session_destroy();
    header('Location: login.php');
    exit;
}

$loggedIn = !empty($_SESSION['admin_ok']);

if (!$loggedIn) {
    header('Location: login.php');
    exit;
}


/* ==========================================================
   DEFAULT DATA
   ========================================================== */

$messages = [];
$subscribers = [];
$unreadCount = 0;
$blogPosts = [];
$blogAvailable = true;

$schemaUpToDate = true;
$userManagementAvailable = true;
$visitorNotesAvailable = true;
$ipBlockingAvailable = true;
$blockedIps = [];

$analyticsAvailable = true;

$analytics = [
    'total_views'     => 0,
    'unique_visitors' => 0,
    'today'           => 0,
    'week'            => 0,
    'online_now'      => 0,

    'devices'  => [],
    'browsers' => [],
    'models'   => [],
    'recent'   => [],
    'os'       => [],

    'filter_devices'  => [],
    'filter_os'       => [],
    'filter_browsers' => [],
];

$filter = [
    'date_from' => trim((string)($_GET['date_from'] ?? '')),
    'date_to'   => trim((string)($_GET['date_to'] ?? '')),
    'device'    => trim((string)($_GET['device'] ?? '')),
    'os'        => trim((string)($_GET['os'] ?? '')),
    'browser'   => trim((string)($_GET['browser'] ?? '')),
    'model'     => trim((string)($_GET['model'] ?? '')),
    'page'      => trim((string)($_GET['page_q'] ?? '')),
];

$hasFilter = false;

foreach ($filter as $v) {
    if ($v !== '') {
        $hasFilter = true;
        break;
    }
}


/* ==========================================================
   HELPERS
   ========================================================== */

require __DIR__ . '/api/helpers.php';


/**
 * Convert boolean DB value into readable text.
 */
function yes_no($value)
{
    return ((int)$value === 1) ? 'Yes' : 'No';
}


/**
 * Display empty values nicely.
 */
function display_value($value)
{
    if ($value === null) {
        return '—';
    }

    if ($value === '') {
        return '—';
    }

    return (string)$value;
}


/**
 * Device model label.
 */
function device_model_label($raw)
{
    $raw = trim((string)($raw ?? ''));

    if ($raw === '') {
        return '—';
    }

    if (strtolower($raw) === 'k') {
        return 'Hidden (Android privacy)';
    }

    return $raw;
}


/**
 * Format UTC database date.
 */
function fmt_date(
    $raw,
    $format = 'd M, h:i A',
    $timezone = null
) {
    global $cfg;

    $raw = (string)($raw ?? '');

    if (
        $raw === '' ||
        $raw === '0000-00-00 00:00:00'
    ) {
        return '—';
    }

    try {
        $dt = new DateTime(
            $raw,
            new DateTimeZone('UTC')
        );
    } catch (Throwable $e) {
        return '—';
    }

    $tzName =
        $timezone
        ?: ($cfg['timezone'] ?? 'Asia/Dhaka');

    try {

        $dt->setTimezone(
            new DateTimeZone($tzName)
        );

    } catch (Throwable $e) {

        try {

            $dt->setTimezone(
                new DateTimeZone(
                    $cfg['timezone'] ?? 'Asia/Dhaka'
                )
            );

        } catch (Throwable $e2) {
        }
    }

    return $dt->format($format);
}


/**
 * Short timezone city.
 */
function tz_short_label($tz)
{
    $tz = trim((string)($tz ?? ''));

    if ($tz === '') {
        return '';
    }

    $parts = explode('/', $tz);

    $city = str_replace(
        '_',
        ' ',
        end($parts)
    );

    return $city;
}


/**
 * Initials.
 */
function initials($name)
{
    $parts = preg_split(
        '/\s+/',
        trim((string)$name)
    );

    $out = '';

    foreach (
        array_slice($parts, 0, 2)
        as $p
    ) {
        if ($p !== '') {
            $out .= mb_strtoupper(
                mb_substr($p, 0, 1)
            );
        }
    }

    return $out !== '' ? $out : '?';
}


/**
 * Avatar class.
 */
function avatar_class($seed)
{
    return 'avatar-c' .
        (crc32((string)$seed) % 5);
}


/**
 * Visitor detail label.
 */
function visitor_label($key)
{
    $labels = [

        'id'                   => 'ID',
        'visitor_id'           => 'Visitor ID',
        'page'                 => 'Page',
        'page_url'             => 'Page URL',
        'referrer'             => 'Referrer',

        'device_type'          => 'Device Type',
        'brand'                => 'Brand',
        'device_model'         => 'Device Model',

        'browser'              => 'Browser',
        'browser_version'      => 'Browser Version',

        'in_app_browser'       => 'In-App Browser',
        'is_bot'               => 'Bot',

        'os'                   => 'Operating System',
        'os_version'           => 'OS Version',

        'lang'                 => 'Language',

        'ip_hash'              => 'IP Hash',
        'ip_address'           => 'IP Address',

        'visitor_tz'           => 'Visitor Timezone',

        'platform'             => 'Platform',
        'platform_version'     => 'Platform Version',

        'screen_width'         => 'Screen Width',
        'screen_height'        => 'Screen Height',

        'viewport_width'       => 'Viewport Width',
        'viewport_height'      => 'Viewport Height',

        'device_pixel_ratio'   => 'Device Pixel Ratio',

        'touch'                => 'Touch',
        'touch_points'         => 'Touch Points',

        'architecture'         => 'Architecture',
        'bitness'              => 'Bitness',

        'hardware_concurrency' => 'CPU Cores',
        'device_memory'        => 'Device Memory',

        'connection_type'      => 'Connection Type',
        'downlink'             => 'Downlink',
        'rtt'                  => 'RTT',

        'user_agent'           => 'User-Agent',

        'created_at'           => 'Created At',
    ];

    return $labels[$key] ?? ucwords(
        str_replace('_', ' ', $key)
    );
}


/**
 * Format individual visitor detail value.
 */
function visitor_detail_value($key, $value)
{
    if (
        $value === null ||
        $value === ''
    ) {
        return '—';
    }

    switch ($key) {

        case 'in_app_browser':
        case 'is_bot':
        case 'touch':

            return ((int)$value === 1)
                ? 'Yes'
                : 'No';

        case 'device_model':

            return device_model_label($value);

        case 'created_at':

            return fmt_date(
                $value,
                'd M Y, h:i:s A'
            );

        case 'screen_width':
        case 'screen_height':
        case 'viewport_width':
        case 'viewport_height':

            return h($value) . ' px';

        case 'device_memory':

            return h($value) . ' GB';

        case 'downlink':

            return h($value) . ' Mbps';

        case 'rtt':

            return h($value) . ' ms';

        case 'page_url':
        case 'referrer':

            return h($value);

        case 'user_agent':

            return h($value);

        default:

            return h($value);
    }
}


/* ==========================================================
   LOAD ADMIN DATA
   ========================================================== */

if ($loggedIn) {

    $pdo = db_connect();

    /* ------------------------------------------------------
       Messages
       ------------------------------------------------------ */

    $messages = $pdo
        ->query(
            'SELECT * FROM messages
             ORDER BY created_at DESC
             LIMIT 200'
        )
        ->fetchAll();

    /* ------------------------------------------------------
       Subscribers
       ------------------------------------------------------ */

    $subscribers = $pdo
        ->query(
            'SELECT * FROM subscribers
             ORDER BY created_at DESC
             LIMIT 500'
        )
        ->fetchAll();

    /* ------------------------------------------------------
       Blog posts (table added by blog_migration.sql — the
       try/catch below detects an unmigrated database and sets
       $blogAvailable = false instead of crashing this whole page)
       ------------------------------------------------------ */

    try {
        $blogPosts = $pdo
            ->query(
                'SELECT * FROM blog_posts
                 ORDER BY created_at DESC
                 LIMIT 300'
            )
            ->fetchAll();
    } catch (PDOException $e) {
        $blogPosts = [];
    }

    foreach ($messages as $m) {

        if (!$m['is_read']) {
            $unreadCount++;
        }
    }


    /* ------------------------------------------------------
       Schema compatibility
       ------------------------------------------------------ */

    try {

        $pdo->query(
            'SELECT is_replied, reply_text, replied_at
             FROM messages
             LIMIT 1'
        );

        $pdo->query(
            'SELECT password_hash
             FROM admin_settings
             LIMIT 1'
        );

    } catch (PDOException $e) {

        $schemaUpToDate = false;
    }

    // The "Users" tab needs its own table (admin_users), added in a
    // later schema.sql than the rest of the admin panel — check it
    // separately so a missing table shows a clear banner instead of
    // every action in that tab just silently failing.
    try {

        $pdo->query(
            'SELECT id
             FROM admin_users
             LIMIT 1'
        );

    } catch (PDOException $e) {

        $userManagementAvailable = false;
    }

    // Same for the "Blocked IPs" tab's blocked_ips table.
    try {

        $pdo->query(
            'SELECT ip_address
             FROM blocked_ips
             LIMIT 1'
        );

    } catch (PDOException $e) {

        $ipBlockingAvailable = false;
    }
    // The visitor "Note" feature needs its own table (visitor_notes),
    // added in a later schema.sql than the rest of the admin panel —
    // check it separately so a missing table just quietly disables the
    // note column instead of breaking the whole analytics query.
    try {

        $pdo->query(
            'SELECT visitor_id
             FROM visitor_notes
             LIMIT 1'
        );

    } catch (PDOException $e) {

        $visitorNotesAvailable = false;
    }


    // Same for the "Blog" tab's blog_posts table (added by
    // blog_migration.sql) — a friendly banner instead of a crash if
    // the migration hasn't been run yet.
    try {

        $pdo->query(
            'SELECT id
             FROM blog_posts
             LIMIT 1'
        );

    } catch (PDOException $e) {

        $blogAvailable = false;
    }


    /* ======================================================
       ANALYTICS
       ====================================================== */

    try {

        $adminTz = new DateTimeZone(
            $cfg['timezone'] ?? 'Asia/Dhaka'
        );

        $utcTz = new DateTimeZone('UTC');


        /* --------------------------------------------------
           Today
           -------------------------------------------------- */

        $todayStartUtc =
            (new DateTime(
                'today',
                $adminTz
            ))
            ->setTimezone($utcTz)
            ->format('Y-m-d H:i:s');


        /* --------------------------------------------------
           Totals
           -------------------------------------------------- */

        $analytics['total_views'] =
            (int)$pdo
            ->query(
                'SELECT COUNT(*)
                 FROM page_views'
            )
            ->fetchColumn();


        $analytics['unique_visitors'] =
            (int)$pdo
            ->query(
                'SELECT COUNT(DISTINCT visitor_id)
                 FROM page_views'
            )
            ->fetchColumn();


        /* --------------------------------------------------
           Today
           -------------------------------------------------- */

        $todayStmt =
            $pdo->prepare(
                'SELECT COUNT(*)
                 FROM page_views
                 WHERE created_at >= :start'
            );

        $todayStmt->execute([
            'start' => $todayStartUtc
        ]);

        $analytics['today'] =
            (int)$todayStmt->fetchColumn();


        /* --------------------------------------------------
           Last 7 days
           -------------------------------------------------- */

        $analytics['week'] =
            (int)$pdo
            ->query(
                "SELECT COUNT(*)
                 FROM page_views
                 WHERE created_at >=
                 DATE_SUB(
                    UTC_TIMESTAMP(),
                    INTERVAL 7 DAY
                 )"
            )
            ->fetchColumn();


        /* --------------------------------------------------
           Online now
           -------------------------------------------------- */

        $analytics['online_now'] =
            (int)$pdo
            ->query(
                "SELECT COUNT(DISTINCT visitor_id)
                 FROM page_views
                 WHERE created_at >=
                 DATE_SUB(
                    UTC_TIMESTAMP(),
                    INTERVAL 5 MINUTE
                 )"
            )
            ->fetchColumn();


        /* --------------------------------------------------
           Devices
           -------------------------------------------------- */

        $analytics['devices'] =
            $pdo
            ->query(
                'SELECT
                    device_type AS label,
                    COUNT(*) AS c
                 FROM page_views
                 GROUP BY device_type
                 ORDER BY c DESC'
            )
            ->fetchAll();


        /* --------------------------------------------------
           Browsers
           -------------------------------------------------- */

        $analytics['browsers'] =
            $pdo
            ->query(
                'SELECT
                    browser AS label,
                    COUNT(*) AS c
                 FROM page_views
                 GROUP BY browser
                 ORDER BY c DESC
                 LIMIT 6'
            )
            ->fetchAll();


        /* --------------------------------------------------
           OS
           -------------------------------------------------- */

        $analytics['os'] =
            $pdo
            ->query(
                'SELECT
                    os AS label,
                    COUNT(*) AS c
                 FROM page_views
                 GROUP BY os
                 ORDER BY c DESC
                 LIMIT 6'
            )
            ->fetchAll();


        /* --------------------------------------------------
           Models
           -------------------------------------------------- */

        $analytics['models'] =
            $pdo
            ->query(
                "SELECT
                    device_model AS label,
                    COUNT(*) AS c
                 FROM page_views
                 WHERE device_model IS NOT NULL
                   AND device_model <> ''
                 GROUP BY device_model
                 ORDER BY c DESC
                 LIMIT 6"
            )
            ->fetchAll();


        /* ==================================================
           FILTERS
           ================================================== */

        $where = [];
        $params = [];


        /* Date from */

        if ($filter['date_from'] !== '') {

            try {

                $params[':date_from'] =
                    (new DateTime(
                        $filter['date_from']
                        . ' 00:00:00',
                        $adminTz
                    ))
                    ->setTimezone($utcTz)
                    ->format('Y-m-d H:i:s');

                $where[] =
                    'pv.created_at >= :date_from';

            } catch (Throwable $e) {
            }
        }


        /* Date to */

        if ($filter['date_to'] !== '') {

            try {

                $params[':date_to'] =
                    (new DateTime(
                        $filter['date_to']
                        . ' 23:59:59',
                        $adminTz
                    ))
                    ->setTimezone($utcTz)
                    ->format('Y-m-d H:i:s');

                $where[] =
                    'pv.created_at <= :date_to';

            } catch (Throwable $e) {
            }
        }


        /* Device */

        if ($filter['device'] !== '') {

            $where[] =
                'pv.device_type = :device';

            $params[':device'] =
                $filter['device'];
        }


        /* OS */

        if ($filter['os'] !== '') {

            $where[] =
                'pv.os = :os';

            $params[':os'] =
                $filter['os'];
        }


        /* Browser */

        if ($filter['browser'] !== '') {

            $where[] =
                'pv.browser = :browser';

            $params[':browser'] =
                $filter['browser'];
        }


        /* Model */

        if ($filter['model'] !== '') {

            $where[] =
                'pv.device_model LIKE :model';

            $params[':model'] =
                '%' . $filter['model'] . '%';
        }


        /* Page */

        if ($filter['page'] !== '') {

            $where[] =
                'pv.page LIKE :page';

            $params[':page'] =
                '%' . $filter['page'] . '%';
        }


        $whereSql =
            $where
            ? 'WHERE ' . implode(
                ' AND ',
                $where
            )
            : '';


        /* ==================================================
           RECENT VISITS

           IMPORTANT:
           pv.* gets ALL database columns.
           ================================================== */

        $limit =
            $hasFilter
            ? 300
            : 60;


        $noteSelect = $visitorNotesAvailable ? 'vn.note AS visitor_note' : 'NULL AS visitor_note';
        $noteJoin   = $visitorNotesAvailable ? 'LEFT JOIN visitor_notes vn ON vn.visitor_id = pv.visitor_id' : '';

        $ipBlockJoinRecent = $ipBlockingAvailable ? 'LEFT JOIN blocked_ips bi ON bi.ip_address = pv.ip_address' : '';
        $ipBlockSelectRecent = $ipBlockingAvailable ? '(bi.ip_address IS NOT NULL) AS is_blocked' : '0 AS is_blocked';

        $recentStmt =
            $pdo->prepare(
                "SELECT
                    pv.*,
                    vt.total_visits,
                    $noteSelect,
                    $ipBlockSelectRecent

                 FROM page_views pv

                 JOIN (
                    SELECT
                        visitor_id,
                        COUNT(*) AS total_visits
                    FROM page_views
                    GROUP BY visitor_id
                 ) vt

                 ON vt.visitor_id =
                    pv.visitor_id

                 $noteJoin

                 $ipBlockJoinRecent

                 $whereSql

                 ORDER BY
                    pv.created_at DESC

                 LIMIT $limit"
            );


        $recentStmt->execute($params);


        $analytics['recent'] =
            $recentStmt->fetchAll();


        /* --------------------------------------------------
           Recent unique visitor IPs (for the "Blocked IPs" tab —
           lets the admin pick a recent visitor to block without
           having to already know their IP address).
           -------------------------------------------------- */

        $ipBlockJoin = $ipBlockingAvailable
            ? 'LEFT JOIN blocked_ips bi ON bi.ip_address = latest.ip_address'
            : '';
        $ipBlockSelect = $ipBlockingAvailable
            ? '(bi.ip_address IS NOT NULL) AS is_blocked'
            : '0 AS is_blocked';

        $analytics['recent_ips'] =
            $pdo
            ->query(
                "SELECT
                    latest.ip_address,
                    latest.visitor_id,
                    latest.device_type,
                    latest.browser,
                    latest.os,
                    latest.last_seen,
                    latest.visit_count,
                    $ipBlockSelect

                 FROM (
                    SELECT
                        pv.ip_address,
                        pv.visitor_id,
                        pv.device_type,
                        pv.browser,
                        pv.os,
                        MAX(pv.created_at) AS last_seen,
                        COUNT(*) AS visit_count
                    FROM page_views pv
                    WHERE pv.ip_address IS NOT NULL AND pv.ip_address <> ''
                    GROUP BY pv.ip_address, pv.visitor_id, pv.device_type, pv.browser, pv.os
                 ) latest

                 $ipBlockJoin

                 ORDER BY latest.last_seen DESC
                 LIMIT 30"
            )
            ->fetchAll();


        /* --------------------------------------------------
           Filter values
           -------------------------------------------------- */

        $analytics['filter_devices'] =
            $pdo
            ->query(
                'SELECT DISTINCT device_type
                 FROM page_views
                 WHERE device_type IS NOT NULL
                   AND device_type <> ""
                 ORDER BY device_type'
            )
            ->fetchAll(PDO::FETCH_COLUMN);


        $analytics['filter_os'] =
            $pdo
            ->query(
                'SELECT DISTINCT os
                 FROM page_views
                 WHERE os IS NOT NULL
                   AND os <> ""
                 ORDER BY os'
            )
            ->fetchAll(PDO::FETCH_COLUMN);


        $analytics['filter_browsers'] =
            $pdo
            ->query(
                'SELECT DISTINCT browser
                 FROM page_views
                 WHERE browser IS NOT NULL
                   AND browser <> ""
                 ORDER BY browser'
            )
            ->fetchAll(PDO::FETCH_COLUMN);

    } catch (PDOException $e) {

        $analyticsAvailable = false;
    }

    $blockedIps = [];
    if ($ipBlockingAvailable) {
        try {
            $blockedIps = ip_block_list($pdo);
        } catch (PDOException $e) {
            $ipBlockingAvailable = false;
        }
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

<title>
Inbox — Admin
</title>

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
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
>

<!-- Quill.js (rich text editor for the Blog tab) -->
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css"
>

<link
    rel="stylesheet"
    href="css/admin.css?v=<?= @filemtime(__DIR__ . '/css/admin.css') ?>">
</head>

<body>



<!-- ========================================================
     TOP BAR
     ======================================================== -->

<div class="topbar">

    <div class="topbar-inner">

        <div class="who">

            <div class="avatar-ring">

                <div class="avatar">

                    <img
                        src="../assets/images/profile.jpg"
                        alt="Mr. Amin"
                    >

                </div>

            </div>

            <div>

                <div class="name">
    <?= h($cfg['admin_name'] ?? 'Mr. Amin') ?>
            </div>

               <div class="role">
    <?php if (!empty($_SESSION['admin_username'])): ?>
        <?= h('@' . $_SESSION['admin_username']) ?><?= !empty($_SESSION['admin_role']) ? h(' · ' . ucfirst($_SESSION['admin_role'])) : '' ?>
    <?php else: ?>
        <?= h($cfg['admin_role'] ?? 'Admin Inbox') ?>
    <?php endif; ?>
          </div>

            </div>

        </div>


        <div class="topbar-actions">

            <button
                class="icon-btn theme-toggle"
                id="theme-toggle"
                aria-label="Toggle light and dark mode"
                title="Toggle theme"
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


            <button
                class="icon-btn"
                id="open-password-modal"
                aria-label="Change password"
                title="Change password"
            >

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                >
                    <rect x="5" y="11" width="14" height="9" rx="2"/>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>

            </button>


            <form method="post">

                <button
                    class="icon-btn"
                    name="logout"
                    value="1"
                    aria-label="Log out"
                    title="Log out"
                >

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/>
                        <path d="M10 17l5-5-5-5M15 12H3"/>
                    </svg>

                </button>

            </form>

        </div>

    </div>


    <?php if (!$schemaUpToDate): ?>

        <div class="schema-banner">

            Reply &amp; change-password need a database update —
            re-run <code>api/schema.sql</code> in phpMyAdmin.

        </div>

    <?php endif; ?>

</div>


<div class="wrap">


<!-- ========================================================
     TOP STATS
     ======================================================== -->

<div class="stat-row">

    <div class="stat-card">

        <div class="num">
            <?= count($messages) ?>
        </div>

        <div class="label">
            MESSAGES
        </div>

    </div>


    <div class="stat-card">

        <div class="num accent">
            <?= $unreadCount ?>
        </div>

        <div class="label">
            UNREAD
        </div>

    </div>


    <div class="stat-card">

        <div class="num">
            <?= count($subscribers) ?>
        </div>

        <div class="label">
            SUBSCRIBERS
        </div>

    </div>

</div>


<?php

$openTab =
    in_array(($_GET['tab'] ?? ''), ['messages', 'blog'], true)
        ? $_GET['tab']
        : 'analytics';

?>


<!-- ========================================================
     TABS
     ======================================================== -->

<div class="tabs">

    <button
        class="tab-btn <?= $openTab === 'messages' ? 'active' : '' ?>"
        data-tab="messages"
    >
        Messages
        <span class="count">
            (<?= count($messages) ?>)
        </span>
    </button>


    <button
        class="tab-btn"
        data-tab="subscribers"
    >
        Subscribers
        <span class="count">
            (<?= count($subscribers) ?>)
        </span>
    </button>


    <button
        class="tab-btn <?= $openTab === 'analytics' ? 'active' : '' ?>"
        data-tab="analytics"
    >
        Analytics
    </button>

    <!-- Users Tab -->
    <button
        class="tab-btn"
        data-tab="users"
    >
        Users
        <span class="count" id="user-count">
            (0)
        </span>
    </button>

    <!-- Blocked IPs Tab -->
    <button
        class="tab-btn"
        data-tab="blocked"
    >
        Blocked IPs
        <span class="count">
            (<?= count($blockedIps) ?>)
        </span>
    </button>

    <!-- Blog Tab -->
    <button
        class="tab-btn <?= $openTab === 'blog' ? 'active' : '' ?>"
        data-tab="blog"
    >
        Blog
        <span class="count">
            (<?= count($blogPosts) ?>)
        </span>
    </button>

</div>


<!-- ========================================================
     MESSAGES
     ======================================================== -->

<div
    id="tab-messages"
    class="tab-panel <?= $openTab === 'messages' ? 'active' : '' ?>"
>

<?php if (empty($messages)): ?>

    <div class="empty">

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
        >
            <rect
                x="3.5"
                y="5"
                width="17"
                height="14"
                rx="2"
            />
            <path d="M4 6.5l8 6 8-6"/>
        </svg>

        <p>No messages yet.</p>

    </div>

<?php else: ?>

    <div class="list-toolbar">

        <div class="search-wrap">

            <i class="fa-solid fa-magnifying-glass"></i>

            <input
                type="text"
                id="msg-search"
                placeholder="Search by name, email, subject, or message..."
            >

        </div>


        <div
            class="filter-pills"
            id="msg-filter-pills"
        >

            <button
                class="mini-pill active"
                data-filter="all"
            >
                All
            </button>

            <button
                class="mini-pill"
                data-filter="unread"
            >
                Unread
            </button>

            <button
                class="mini-pill"
                data-filter="replied"
            >
                Replied
            </button>

        </div>

    </div>


    <div
        class="no-results"
        id="msg-no-results"
    >
        No messages match your search.
    </div>


<?php foreach ($messages as $m):

    $isReplied =
        !empty($m['is_replied'] ?? null);

    $searchText =
        mb_strtolower(
            $m['name']
            . ' '
            . $m['email']
            . ' '
            . ($m['subject'] ?? '')
            . ' '
            . $m['message']
        );

?>

<div
    class="msg-card
        <?= $m['is_read'] ? '' : 'unread' ?>
        <?= $isReplied ? 'is-replied' : '' ?>"
    data-msg-id="<?= (int)$m['id'] ?>"
    data-search-text="<?= h($searchText) ?>"
>

    <div class="msg-head">

        <div
            class="msg-avatar <?= avatar_class($m['email']) ?>"
        >
            <?= h(initials($m['name'])) ?>
        </div>


        <div class="msg-meta">

            <div class="msg-name-row">

                <span class="msg-name">
                    <?= h($m['name']) ?>
                </span>


                <?php if (!$m['is_read']): ?>

                    <span class="badge badge-new">
                        NEW
                    </span>

                <?php endif; ?>


                <?php if ($isReplied): ?>

                    <span class="badge badge-replied">
                        REPLIED
                    </span>

                <?php endif; ?>

            </div>


            <div class="msg-sub">

                <span class="msg-sub-email"><?= h($m['email']) ?></span>

                <?= $m['phone']
                    ? ' · <span class="msg-sub-phone">' . h($m['phone']) . '</span>'
                    : ''
                ?>

            </div>

        </div>


        <div class="msg-date">

            <?= h(
                fmt_date(
                    $m['created_at']
                )
            ) ?>

        </div>

    </div>


    <?php if ($m['subject']): ?>

        <div class="msg-subject">
            <?= h($m['subject']) ?>
        </div>

    <?php endif; ?>


    <div class="msg-body">

        <?= h($m['message']) ?>

    </div>


    <?php if (
        $isReplied &&
        !empty($m['replied_at'] ?? null)
    ): ?>

        <div class="replied-block">

            <div class="label">

                YOUR REPLY ·
                <?= h(
                    fmt_date(
                        $m['replied_at']
                    )
                ) ?>

            </div>

            <div class="txt">

                <?= h(
                    $m['reply_text'] ?? ''
                ) ?>

            </div>

        </div>

    <?php endif; ?>


    <div class="msg-actions">

        <button
            class="btn btn-ghost btn-reply-toggle"
        >

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M9 17l-5-5 5-5M4 12h11a5 5 0 0 1 5 5v1"/>
            </svg>

            <?= $isReplied
                ? 'Reply again'
                : 'Reply'
            ?>

        </button>


        <a
            class="btn btn-ghost msg-open-email"
            href="mailto:<?= h($m['email']) ?>?subject=<?= h(
                rawurlencode(
                    'Re: ' .
                    ($m['subject']
                        ?: 'your message')
                )
            ) ?>"
        >

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <rect
                    x="3.5"
                    y="5"
                    width="17"
                    height="14"
                    rx="2"
                />
                <path d="M4 6.5l8 6 8-6"/>
            </svg>

            Open in email app

        </a>


        <?php if (!$m['is_read']): ?>

            <button
                class="btn btn-ghost btn-mark-read"
            >
                Mark as read
            </button>

        <?php endif; ?>


        <button
            class="btn btn-ghost btn-edit-toggle"
        >

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>

            Edit

        </button>


        <button
            class="btn btn-ghost btn-delete-message"
        >

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M3 6h18"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
            </svg>

            Delete

        </button>

    </div>


    <div class="edit-box">

        <div class="edit-grid">

            <div class="field">
                <label>Name</label>
                <input type="text" class="edit-name" value="<?= h($m['name']) ?>" maxlength="120">
            </div>

            <div class="field">
                <label>Email</label>
                <input type="email" class="edit-email" value="<?= h($m['email']) ?>" maxlength="190">
            </div>

            <div class="field">
                <label>Phone</label>
                <input type="text" class="edit-phone" value="<?= h($m['phone'] ?? '') ?>" maxlength="40">
            </div>

            <div class="field">
                <label>Subject</label>
                <input type="text" class="edit-subject" value="<?= h($m['subject'] ?? '') ?>" maxlength="190">
            </div>

        </div>

        <div class="field field-message">
            <label>Message</label>
            <textarea class="edit-message" maxlength="10000"><?= h($m['message']) ?></textarea>
        </div>

        <div class="row">

            <button
                class="btn btn-primary btn-save-edit"
            >
                Save changes
            </button>

            <button
                class="btn btn-ghost btn-cancel-edit"
            >
                Cancel
            </button>

        </div>

        <div class="edit-note">

            <svg
                class="ok-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
            >
                <path d="M20 6 9 17l-5-5"/>
            </svg>

            <span class="edit-note-text"></span>

        </div>

    </div>


    <div class="reply-box">

        <textarea
            placeholder="Type your reply — this will be emailed to <?= h($m['email']) ?>..."
        ></textarea>


        <div class="row">

            <button
                class="btn btn-primary btn-send-reply"
            >
                Send reply
            </button>

            <button
                class="btn btn-ghost btn-cancel-reply"
            >
                Cancel
            </button>

        </div>


        <div class="reply-note">

            <svg
                class="ok-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
            >
                <path d="M20 6 9 17l-5-5"/>
            </svg>

            <span class="reply-note-text"></span>

        </div>

    </div>

</div>

<?php endforeach; ?>

<?php endif; ?>

</div>


<!-- ========================================================
     SUBSCRIBERS
     ======================================================== -->

<div
    id="tab-subscribers"
    class="tab-panel"
>

<div class="add-sub-card">

<form
    id="add-subscriber-form"
    class="add-sub-form"
>

    <div class="input-icon-wrap">

        <input
            type="email"
            id="add-sub-email"
            placeholder="Add a subscriber by email..."
            required
        >

        <i class="fa-solid fa-envelope"></i>

    </div>


    <button
        type="submit"
        class="btn btn-primary"
        id="add-sub-btn"
    >
        Add
    </button>

</form>


<div
    class="add-sub-note"
    id="add-sub-note"
>

    <svg
        class="add-sub-note-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
    >
        <path d="M20 6 9 17l-5-5"/>
    </svg>

    <span id="add-sub-note-text"></span>

</div>

</div>


<div
    class="list-toolbar"
    id="sub-search-toolbar"
    <?= empty($subscribers)
        ? 'style="display:none"'
        : ''
    ?>
>

    <div class="search-wrap">

        <i class="fa-solid fa-magnifying-glass"></i>

        <input
            type="text"
            id="sub-search"
            placeholder="Search subscribers by email..."
        >

    </div>


    <button
        class="btn btn-ghost"
        id="copy-emails"
    >
        Copy all emails
    </button>

</div>


<div
    class="no-results"
    id="sub-no-results"
>
    No subscribers match your search.
</div>


<?php if (empty($subscribers)): ?>

<div
    class="empty"
    id="subscribers-empty"
>

    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
    >
        <path d="M20 21a8 8 0 1 0-16 0"/>
        <circle cx="12" cy="8" r="4.5"/>
    </svg>

    <p>No subscribers yet.</p>

</div>

<?php endif; ?>


<div
    class="sub-list"
    id="sub-list"
>

<?php foreach ($subscribers as $s): ?>

<div
    class="sub-row"
    data-id="<?= (int)$s['id'] ?>"
    data-email="<?= h(
        mb_strtolower(
            $s['email']
        )
    ) ?>"
>

    <a
        class="sub-left"
        href="mailto:<?= h($s['email']) ?>"
        title="Email this subscriber"
    >

        <div
            class="sub-avatar <?= avatar_class($s['email']) ?>"
        >
            <?= h(
                mb_strtoupper(
                    mb_substr(
                        $s['email'],
                        0,
                        1
                    )
                )
            ) ?>
        </div>

        <span class="sub-email-text">
            <?= h($s['email']) ?>
        </span>

    </a>


    <div class="sub-right">

        <span class="date">

            <?= h(
                fmt_date(
                    $s['created_at'],
                    'd M Y'
                )
            ) ?>

        </span>


        <div class="sub-actions">

            <button
                type="button"
                class="icon-btn-sm sub-edit-btn"
                title="Edit email"
                aria-label="Edit email"
            >

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>

            </button>


            <button
                type="button"
                class="icon-btn-sm sub-delete-btn"
                title="Delete subscriber"
                aria-label="Delete subscriber"
            >

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path d="M3 6h18"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                </svg>

            </button>

        </div>

    </div>

</div>

<?php endforeach; ?>

</div>

</div>


<!-- ========================================================
     ANALYTICS
     ======================================================== -->

<div
    id="tab-analytics"
    class="tab-panel <?= $openTab === 'analytics' ? 'active' : '' ?>"
>

<?php if (!$analyticsAvailable): ?>

<div class="empty">

    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
    >
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>
    </svg>

    <p>
        Analytics needs a database update.
        <br>
        Re-run <code>api/schema.sql</code>
        in phpMyAdmin, then refresh.
    </p>

</div>


<?php elseif (
    $analytics['total_views'] === 0
): ?>

<div class="empty">

    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
    >
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>
    </svg>

    <p>
        No visits recorded yet.
    </p>

</div>


<?php else:

$pct = function($count) use ($analytics) {

    return $analytics['total_views'] > 0
        ? round(
            ($count /
            $analytics['total_views'])
            * 100
        )
        : 0;
};

?>


<!-- ========================================================
     ANALYTICS STATS
     ======================================================== -->

<div class="stat-row">

    <div class="stat-card">

        <div class="num">
            <?= $analytics['total_views'] ?>
        </div>

        <div class="label">
            TOTAL VIEWS
        </div>

    </div>


    <div class="stat-card">

        <div class="num accent">
            <?= $analytics['unique_visitors'] ?>
        </div>

        <div class="label">
            UNIQUE VISITORS
        </div>

    </div>


    <div class="stat-card">

        <div class="num">
            <?= $analytics['today'] ?>
        </div>

        <div class="label">
            TODAY
        </div>

    </div>

</div>


<div
    class="stat-row"
    style="grid-template-columns:1fr 1fr;"
>

    <div class="stat-card">

        <div class="num">
            <?= $analytics['week'] ?>
        </div>

        <div class="label">
            LAST 7 DAYS
        </div>

    </div>


    <div class="stat-card stat-card-online">

        <div
            class="num"
            id="online-now-num"
        >

            <span class="online-dot"></span>

            <?= $analytics['online_now'] ?>

        </div>

        <div class="label">
            ONLINE NOW
        </div>

    </div>

</div>


<!-- ========================================================
     BAR GRAPHS
     ======================================================== -->

<div class="bar-grid">


<div class="bar-list">

<h4>Device type</h4>

<?php foreach ($analytics['devices'] as $d): ?>

<div class="bar-row">

    <div class="bar-row-top">

        <span>
            <?= h(
                $d['label']
                ?: 'Unknown'
            ) ?>
        </span>

        <span class="pct">

            <?= (int)$d['c'] ?>

            ·

            <?= $pct($d['c']) ?>%

        </span>

    </div>


    <div class="bar-track">

        <div
            class="bar-fill"
            style="width:<?= $pct($d['c']) ?>%"
        ></div>

    </div>

</div>

<?php endforeach; ?>

</div>


<div class="bar-list">

<h4>Browser</h4>

<?php foreach ($analytics['browsers'] as $b): ?>

<div class="bar-row">

    <div class="bar-row-top">

        <span>
            <?= h(
                $b['label']
                ?: 'Unknown'
            ) ?>
        </span>

        <span class="pct">

            <?= (int)$b['c'] ?>

            ·

            <?= $pct($b['c']) ?>%

        </span>

    </div>


    <div class="bar-track">

        <div
            class="bar-fill"
            style="width:<?= $pct($b['c']) ?>%"
        ></div>

    </div>

</div>

<?php endforeach; ?>

</div>


<div class="bar-list">

<h4>Operating system</h4>

<?php foreach ($analytics['os'] as $o): ?>

<div class="bar-row">

    <div class="bar-row-top">

        <span>
            <?= h(
                $o['label']
                ?: 'Unknown'
            ) ?>
        </span>

        <span class="pct">

            <?= (int)$o['c'] ?>

            ·

            <?= $pct($o['c']) ?>%

        </span>

    </div>


    <div class="bar-track">

        <div
            class="bar-fill"
            style="width:<?= $pct($o['c']) ?>%"
        ></div>

    </div>

</div>

<?php endforeach; ?>

</div>


<?php if (!empty($analytics['models'])): ?>

<div class="bar-list">

<h4>Mobile device model</h4>

<?php foreach ($analytics['models'] as $mo): ?>

<div class="bar-row">

    <div class="bar-row-top">

        <span>
            <?= h(
                device_model_label(
                    $mo['label']
                )
            ) ?>
        </span>

        <span class="pct">

            <?= (int)$mo['c'] ?>

            ·

            <?= $pct($mo['c']) ?>%

        </span>

    </div>


    <div class="bar-track">

        <div
            class="bar-fill"
            style="width:<?= $pct($mo['c']) ?>%"
        ></div>

    </div>

</div>

<?php endforeach; ?>

</div>

<?php endif; ?>


</div>


<!-- ========================================================
     RECENT VISITS
     ======================================================== -->

<div class="visit-table-card">

<div class="visit-table-head">

    <h4>
        Recent visits
    </h4>


    <div class="visit-table-head-right">

        <span
            class="visit-table-count"
            id="visit-table-count"
        >
            <?= count($analytics['recent']) ?>
            shown
        </span>


        <?php if (!empty($analytics['recent'])): ?>

            <button
                type="button"
                class="btn btn-ghost btn-sm"
                id="clear-all-visits-btn"
            >
                Clear all
            </button>

        <?php endif; ?>

    </div>

</div>


<!-- ========================================================
     FILTER
     ======================================================== -->

<form
    method="get"
    class="visit-filter-form"
    id="visit-filter-form"
>

<input
    type="hidden"
    name="tab"
    value="analytics"
>


<div class="visit-filter-row">


<div class="vf-field">

<label for="vf-date-from">
From
</label>

<input
    type="date"
    id="vf-date-from"
    name="date_from"
    value="<?= h(
        $filter['date_from']
    ) ?>"
>

</div>


<div class="vf-field">

<label for="vf-date-to">
To
</label>

<input
    type="date"
    id="vf-date-to"
    name="date_to"
    value="<?= h(
        $filter['date_to']
    ) ?>"
>

</div>


<div class="vf-field">

<label for="vf-device">
Device
</label>

<select
    id="vf-device"
    name="device"
>

<option value="">
All
</option>

<?php foreach (
    $analytics['filter_devices']
    as $d
): ?>

<option
    value="<?= h($d) ?>"
    <?= $filter['device'] === $d
        ? 'selected'
        : ''
    ?>
>
<?= h($d) ?>
</option>

<?php endforeach; ?>

</select>

</div>


<div class="vf-field">

<label for="vf-os">
OS
</label>

<select
    id="vf-os"
    name="os"
>

<option value="">
All
</option>

<?php foreach (
    $analytics['filter_os']
    as $o
): ?>

<option
    value="<?= h($o) ?>"
    <?= $filter['os'] === $o
        ? 'selected'
        : ''
    ?>
>
<?= h($o) ?>
</option>

<?php endforeach; ?>

</select>

</div>


<div class="vf-field">

<label for="vf-browser">
Browser
</label>

<select
    id="vf-browser"
    name="browser"
>

<option value="">
All
</option>

<?php foreach (
    $analytics['filter_browsers']
    as $b
): ?>

<option
    value="<?= h($b) ?>"
    <?= $filter['browser'] === $b
        ? 'selected'
        : ''
    ?>
>
<?= h($b) ?>
</option>

<?php endforeach; ?>

</select>

</div>


<div class="vf-field">

<label for="vf-model">
Model
</label>

<input
    type="text"
    id="vf-model"
    name="model"
    placeholder="e.g. SM-S928B"
    value="<?= h(
        $filter['model']
    ) ?>"
>

</div>


<div class="vf-field">

<label for="vf-page">
Page
</label>

<input
    type="text"
    id="vf-page"
    name="page_q"
    placeholder="/ or #contact"
    value="<?= h(
        $filter['page']
    ) ?>"
>

</div>


<div class="vf-actions">

<button
    type="submit"
    class="btn btn-primary btn-sm"
>
Filter
</button>


<?php if ($hasFilter): ?>

<a
    href="admin.php?tab=analytics"
    class="btn btn-ghost btn-sm"
>
Clear
</a>

<?php endif; ?>

</div>


</div>

</form>


<!-- ========================================================
     VISIT TABLE
     ======================================================== -->

<div class="visit-table-scroll">

<table class="visit-table">

<thead>

<tr>

    <th>Time</th>

    <th>Page</th>

    <th>Device</th>

    <th>Brand</th>

    <th>Model</th>

    <th>Browser</th>

    <th>OS</th>

    <th>Visit #</th>

    <th>Note</th>

    <th>Details</th>

</tr>

</thead>


<tbody>


<?php if (
    empty(
        $analytics['recent']
    )
): ?>

<tr>

<td
    colspan="10"
    class="visit-empty"
>
No visits match this filter.
</td>

</tr>

<?php endif; ?>


<?php foreach (
    $analytics['recent']
    as $v
): ?>

<tr
    data-visit-id="<?= (int)$v['id'] ?>"
>


<td class="mono nowrap">

<?= h(
    fmt_date(
        $v['created_at'],
        'd M, h:i A',
        $v['visitor_tz'] ?? null
    )
) ?>


<?php if (
    !empty(
        $v['visitor_tz']
    )
): ?>

<div class="visit-tz">

<?= h(
    tz_short_label(
        $v['visitor_tz']
    )
) ?>

</div>

<?php endif; ?>

</td>


<td class="mono truncate">

<?= h(
    $v['page']
) ?>

</td>


<td>

<span
    class="visit-badge device-<?= h(
        $v['device_type']
        ?: 'Unknown'
    ) ?>"
>

<?= h(
    $v['device_type']
    ?: 'Unknown'
) ?>

</span>

</td>


<td>

<?= h(
    display_value(
        $v['brand']
    )
) ?>

</td>


<td class="mono">

<?= h(
    device_model_label(
        $v['device_model']
    )
) ?>

</td>


<td>

<?= h(
    $v['browser']
    ?: 'Unknown'
) ?>

<?php if (
    !empty(
        $v['browser_version']
    )
): ?>

<div
    style="font-size:11px;opacity:.6;"
>

<?= h(
    $v['browser_version']
) ?>

</div>

<?php endif; ?>

</td>


<td>

<?= h(
    $v['os']
    ?: 'Unknown'
) ?>

<?php if (
    !empty(
        $v['os_version']
    )
): ?>

<div
    style="font-size:11px;opacity:.6;"
>

<?= h(
    $v['os_version']
) ?>

</div>

<?php endif; ?>

</td>


<td class="mono center">

<?= (int)(
    $v['total_visits']
    ?? 1
) ?>

</td>


<td class="visitor-note-cell">

<button
    type="button"
    class="btn btn-ghost btn-sm visitor-note-btn"
    data-visitor-id="<?= h($v['visitor_id']) ?>"
    title="<?= !empty($v['visitor_note']) ? 'Edit note' : 'Add a note for this visitor' ?>"
>

<?php if (!empty($v['visitor_note'])): ?>

<span class="visitor-note-text"><?= h($v['visitor_note']) ?></span>

<?php else: ?>

<i class="fa-solid fa-pen"></i> Note

<?php endif; ?>

</button>

</td>


<td class="center">

<div class="visit-row-actions">

<button
    type="button"
    class="btn btn-ghost btn-sm visit-details-btn"
    data-visit-id="<?= (int)$v['id'] ?>"
>
    <i class="fa-solid fa-circle-info"></i>
    Details
</button>

<?php if (!empty($v['ip_address'])): ?>

    <?php if (!empty($v['is_blocked'])): ?>

        <button
            type="button"
            class="btn btn-ghost btn-sm ip-unblock-btn"
            data-ip="<?= h($v['ip_address']) ?>"
            title="Unblock this IP"
        >
            Unblock
        </button>

    <?php else: ?>

        <button
            type="button"
            class="btn btn-danger btn-sm ip-block-btn"
            data-ip="<?= h($v['ip_address']) ?>"
            title="Block this IP"
        >
            Block
        </button>

    <?php endif; ?>

<?php endif; ?>

<button
    type="button"
    class="btn btn-danger btn-sm visit-delete-btn"
    data-visit-id="<?= (int)$v['id'] ?>"
    title="Delete this visit record"
>
    <i class="fa-solid fa-trash"></i>
</button>

</div>

</td>


</tr>

<?php endforeach; ?>


</tbody>

</table>

</div>

</div>

<?php endif; ?>

</div>


<!-- ========================================================
     USERS
     ======================================================== -->

<div
    id="tab-users"
    class="tab-panel"
>

    <?php if (!$userManagementAvailable): ?>

        <div class="schema-banner">

            User Management needs a database update —
            re-run <code>api/schema.sql</code> in phpMyAdmin to create
            the <code>admin_users</code> table, then reload this page.

        </div>

    <?php endif; ?>

    <div class="list-toolbar">

        <div class="search-wrap">

            <i class="fa-solid fa-magnifying-glass"></i>

            <input
                type="text"
                id="user-search"
                placeholder="Search users..."
            >

        </div>


        <button
            class="btn btn-primary"
            id="add-user-btn"
        >
            <i class="fa-solid fa-plus"></i>
            Add User
        </button>

    </div>


    <div class="visit-table-card">

        <div class="visit-table-scroll">

            <table class="visit-table" id="users-table">

                <thead>

                    <tr>

                        <th>User</th>

                        <th>Email</th>

                        <th>Role</th>

                        <th>Status</th>

                        <th>Last Login</th>

                        <th>Created</th>

                        <th>Actions</th>

                    </tr>

                </thead>


                <tbody id="users-tbody">

                    <tr>

                        <td colspan="7" class="visit-empty">
                            Loading users...
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    </div>

</div>


<!-- ========================================================
     BLOCKED IPS
     ======================================================== -->

<div
    id="tab-blocked"
    class="tab-panel"
>

    <?php if (!$ipBlockingAvailable): ?>

        <div class="schema-banner">

            IP Blocking needs a database update —
            re-run <code>api/schema.sql</code> in phpMyAdmin to create
            the <code>blocked_ips</code> table, then reload this page.

        </div>

    <?php endif; ?>

    <div class="ip-block-note">

        Blocking an IP redirects it to a simple "Access Restricted" page
        (<code>blocked.html</code>) instead of letting it open any page
        on your live site — not just this admin panel. This works by
        writing a rule into your site's <code>.htaccess</code> file
        automatically, so it applies at the web server level.

    </div>

    <div class="ip-block-columns">

        <div class="ip-block-column">

            <h3 class="ip-block-column-title">Recent visitors</h3>

            <div class="visit-table-card">

                <div class="visit-table-scroll">

                    <table class="visit-table" id="recent-ips-table">

                        <thead>
                            <tr>
                                <th>IP address</th>
                                <th>Device</th>
                                <th>Last seen</th>
                                <th>Visits</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            <?php if (empty($analytics['recent_ips'] ?? [])): ?>

                                <tr>
                                    <td colspan="5" class="visit-empty">
                                        No visits recorded yet.
                                    </td>
                                </tr>

                            <?php else: ?>

                                <?php foreach ($analytics['recent_ips'] as $rip): ?>

                                    <tr data-ip="<?= h($rip['ip_address']) ?>">

                                        <td class="mono"><?= h($rip['ip_address']) ?></td>

                                        <td>
                                            <?= h(trim(($rip['browser'] ?? '') . ' · ' . ($rip['os'] ?? ''), ' ·')) ?: '—' ?>
                                        </td>

                                        <td><?= h(fmt_date($rip['last_seen'])) ?></td>

                                        <td class="mono center"><?= (int)$rip['visit_count'] ?></td>

                                        <td class="center">
                                            <?php if (!empty($rip['is_blocked'])): ?>

                                                <button
                                                    type="button"
                                                    class="btn btn-ghost btn-sm ip-unblock-btn"
                                                    data-ip="<?= h($rip['ip_address']) ?>"
                                                >
                                                    Unblock
                                                </button>

                                            <?php else: ?>

                                                <button
                                                    type="button"
                                                    class="btn btn-danger btn-sm ip-block-btn"
                                                    data-ip="<?= h($rip['ip_address']) ?>"
                                                >
                                                    Block
                                                </button>

                                            <?php endif; ?>
                                        </td>

                                    </tr>

                                <?php endforeach; ?>

                            <?php endif; ?>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>


        <div class="ip-block-column">

            <h3 class="ip-block-column-title">Currently blocked</h3>

            <div class="visit-table-card">

                <div class="visit-table-scroll">

                    <table class="visit-table" id="blocked-ips-table">

                        <thead>
                            <tr>
                                <th>IP address</th>
                                <th>Reason</th>
                                <th>Blocked</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            <?php if (empty($blockedIps)): ?>

                                <tr>
                                    <td colspan="4" class="visit-empty">
                                        No IPs are currently blocked.
                                    </td>
                                </tr>

                            <?php else: ?>

                                <?php foreach ($blockedIps as $b): ?>

                                    <tr data-ip="<?= h($b['ip_address']) ?>">

                                        <td class="mono"><?= h($b['ip_address']) ?></td>

                                        <td><?= h($b['reason'] ?: '—') ?></td>

                                        <td><?= h(fmt_date($b['blocked_at'])) ?></td>

                                        <td class="center">
                                            <button
                                                type="button"
                                                class="btn btn-ghost btn-sm ip-unblock-btn"
                                                data-ip="<?= h($b['ip_address']) ?>"
                                            >
                                                Unblock
                                            </button>
                                        </td>

                                    </tr>

                                <?php endforeach; ?>

                            <?php endif; ?>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    </div>

</div>

</div>
<!-- ========================================================
     BLOG
     ======================================================== -->

<div
    id="tab-blog"
    class="tab-panel <?= $openTab === 'blog' ? 'active' : '' ?>"
>

    <?php if (!$blogAvailable): ?>

        <div class="schema-banner">

            The Blog feature needs a database update —
            run <code>blog_migration.sql</code> in phpMyAdmin to create
            the <code>blog_posts</code> table, then reload this page.

        </div>

    <?php endif; ?>

    <div class="blog-toolbar">

        <button
            type="button"
            class="btn btn-primary"
            id="new-post-btn"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            New post
        </button>

    </div>

    <div id="post-editor" class="post-editor">

        <div class="post-editor-head">
            <h3 id="post-editor-title">New post</h3>
            <button type="button" class="icon-btn-sm" id="post-editor-close" title="Close" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
        </div>

        <input type="hidden" id="post-id" value="0">

        <div class="field">
            <label for="post-title">Title</label>
            <input type="text" id="post-title" maxlength="200" placeholder="Post title...">
        </div>

        <div class="post-editor-grid">

            <div class="field">
                <label for="post-slug">Slug <span class="hint">(auto-generated from title if left blank)</span></label>
                <input type="text" id="post-slug" maxlength="220" placeholder="my-post-title">
            </div>

            <div class="field">
                <label for="post-status">Status</label>
                <select id="post-status">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

        </div>

        <div class="field">
            <label for="post-cover">Cover image URL <span class="hint">(optional)</span></label>
            <input type="text" id="post-cover" maxlength="500" placeholder="https://... or /assets/images/...">
        </div>

        <div class="field">
            <label for="post-excerpt">Excerpt <span class="hint">(optional — auto-generated from content if left blank)</span></label>
            <textarea id="post-excerpt" maxlength="300" rows="2" placeholder="A short summary shown on the blog listing..."></textarea>
        </div>

        <div class="field">
            <label>Content</label>
            <div id="post-quill-toolbar">
                <span class="ql-formats">
                    <select class="ql-header" defaultValue="0">
                        <option value="1"></option>
                        <option value="2"></option>
                        <option value="3"></option>
                        <option value="0"></option>
                    </select>
                </span>
                <span class="ql-formats">
                    <button class="ql-bold"></button>
                    <button class="ql-italic"></button>
                    <button class="ql-underline"></button>
                    <button class="ql-strike"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-blockquote"></button>
                    <button class="ql-code-block"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-list" value="ordered"></button>
                    <button class="ql-list" value="bullet"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-link"></button>
                    <button class="ql-image"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-clean"></button>
                </span>
            </div>
            <div id="post-quill-editor"></div>
        </div>

        <div class="row">
            <button type="button" class="btn btn-primary" id="post-save-btn">Save post</button>
            <button type="button" class="btn btn-ghost" id="post-cancel-btn">Cancel</button>
        </div>

        <div class="edit-note" id="post-note">
            <svg class="ok-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>
            <span class="edit-note-text" id="post-note-text"></span>
        </div>

    </div>

    <?php if (empty($blogPosts) && $blogAvailable): ?>

        <div class="empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M6 4h9l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/>
                <path d="M9 12h6M9 16h6M9 8h2"/>
            </svg>
            <p>No blog posts yet — click "New post" to write your first one.</p>
        </div>

    <?php endif; ?>

    <div id="post-list">

    <?php foreach ($blogPosts as $p): ?>

        <div
            class="post-row"
            data-post-id="<?= (int)$p['id'] ?>"
            data-title="<?= h($p['title']) ?>"
            data-slug="<?= h($p['slug']) ?>"
            data-excerpt="<?= h($p['excerpt'] ?? '') ?>"
            data-cover="<?= h($p['cover_image'] ?? '') ?>"
            data-status="<?= h($p['status']) ?>"
            data-content-b64="<?= base64_encode($p['content']) ?>"
        >

            <?php if ($p['cover_image']): ?>
                <div class="post-row-thumb" style="background-image:url('<?= h($p['cover_image']) ?>')"></div>
            <?php else: ?>
                <div class="post-row-thumb post-row-thumb-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 16.5 8.5 12l3 3L17 10l3 3"/><rect x="3.5" y="4.5" width="17" height="15" rx="2"/></svg>
                </div>
            <?php endif; ?>

            <div class="post-row-body">

                <div class="post-row-title-line">
                    <span class="post-row-title"><?= h($p['title']) ?></span>
                    <span class="badge <?= $p['status'] === 'published' ? 'badge-replied' : 'badge-draft' ?> post-row-status">
                        <?= $p['status'] === 'published' ? 'PUBLISHED' : 'DRAFT' ?>
                    </span>
                </div>

                <div class="post-row-meta">
                    /blog-post.php?slug=<?= h($p['slug']) ?>
                    · <?= h(fmt_date($p['created_at'])) ?>
                    <?= isset($p['views']) ? ' · ' . (int)$p['views'] . ' views' : '' ?>
                </div>

                <?php if ($p['excerpt']): ?>
                    <div class="post-row-excerpt"><?= h($p['excerpt']) ?></div>
                <?php endif; ?>

            </div>

            <div class="post-row-actions">

                <?php if ($p['status'] === 'published'): ?>
                    <a class="btn btn-ghost" href="blog-post.php?slug=<?= h($p['slug']) ?>" target="_blank" rel="noopener">View</a>
                <?php endif; ?>

                <button type="button" class="btn btn-ghost post-edit-btn">Edit</button>
                <button type="button" class="btn btn-ghost post-delete-btn">Delete</button>

            </div>

        </div>

    <?php endforeach; ?>

    </div>

</div>



<!-- ========================================================
     CONFIRM DELETE MODAL
     ======================================================== -->

<div
    class="modal-backdrop"
    id="confirm-modal-backdrop"
>

<div class="modal modal-danger">

<div class="modal-icon">

<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
>

<path d="M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z"/>

<path d="M12 9v4M12 17h.01"/>

</svg>

</div>


<h3 id="confirm-modal-title">
Are you sure?
</h3>


<div
    class="sub"
    id="confirm-modal-message"
></div>


<div class="modal-actions">

<button
    type="button"
    class="btn btn-ghost"
    id="confirm-modal-cancel"
>
Cancel
</button>


<button
    type="button"
    class="btn btn-danger"
    id="confirm-modal-confirm"
>
Delete
</button>

</div>

</div>

</div>


<!-- ========================================================
     PROMPT MODAL (replaces window.prompt() for Block reason,
     visitor notes, and the manual .htaccess rule display)
     ======================================================== -->

<div
    class="modal-backdrop"
    id="prompt-modal-backdrop"
>

<div class="modal">

<h3 id="prompt-modal-title">
Enter a value
</h3>


<div
    class="sub"
    id="prompt-modal-message"
></div>


<textarea
    id="prompt-modal-input"
    class="prompt-modal-input"
    rows="1"
></textarea>


<div class="modal-actions">

<button
    type="button"
    class="btn btn-ghost"
    id="prompt-modal-cancel"
>
Cancel
</button>


<button
    type="button"
    class="btn btn-primary"
    id="prompt-modal-confirm"
>
Save
</button>

</div>

</div>

</div>


<!-- ========================================================
     VISITOR DETAILS MODAL
     ======================================================== -->

<div
    class="modal-backdrop"
    id="visitor-details-backdrop"
>

<div class="modal visitor-details-modal">


<div class="visitor-details-header">

<div>

<h3 class="visitor-details-title">
Visitor details
</h3>

<div
    class="visitor-details-subtitle"
    id="visitor-details-subtitle"
>
All stored visitor information
</div>

</div>


<button
    type="button"
    class="icon-btn visitor-details-close"
    id="visitor-details-close"
    aria-label="Close visitor details"
    title="Close"
>

<i class="fa-solid fa-xmark"></i>

</button>

</div>


<div
    class="visitor-details-body"
    id="visitor-details-body"
>

</div>


</div>




</div>


<!-- ========================================================
     TOAST
     ======================================================== -->

<div
    class="toast-stack"
    id="toast-stack"
    aria-live="polite"
></div>


<!-- ========================================================
     USER MODAL
     ======================================================== -->

<div
    class="modal-backdrop"
    id="user-modal-backdrop"
>

<div class="modal" style="max-width:500px;">

    <h3 id="user-modal-title">
        Add User
    </h3>

    <div class="sub" id="user-modal-subtitle">
        Create a new admin user
    </div>

    <form id="user-form">

        <input
            type="hidden"
            id="user-form-id"
        >

        <div class="field">

            <label>
                Username
            </label>

            <input
                type="text"
                id="user-form-username"
                required
            >

        </div>

        <div class="field">

            <label>
                Full Name
            </label>

            <input
                type="text"
                id="user-form-fullname"
                required
            >

        </div>

        <div class="field">

            <label>
                Email
            </label>

            <input
                type="email"
                id="user-form-email"
                required
            >

        </div>

        <div class="field" id="password-field">

            <label>
                Password
            </label>

            <div class="pw-field">

                <input
                    type="password"
                    id="user-form-password"
                >

                <button
                    type="button"
                    class="pw-toggle"
                    data-target="user-form-password"
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

        </div>

        <div class="field">

            <label>
                Role
            </label>

            <select
                id="user-form-role"
                required
            >

                <option value="viewer">
                    Viewer
                </option>

                <option value="manager">
                    Manager
                </option>

                <option value="admin">
                    Admin
                </option>

            </select>

        </div>

        <div class="field">

            <label class="check-field">

                <input
                    type="checkbox"
                    id="user-form-active"
                    checked
                >

                <span class="check-box">

                    <svg
                        class="check-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                    >
                        <path d="M4 12l5 5L20 6"/>
                    </svg>

                </span>

                <span class="check-label">
                    Active
                </span>

            </label>

        </div>

        <div class="modal-actions">

            <button
                type="button"
                class="btn btn-ghost"
                id="user-modal-cancel"
            >
                Cancel
            </button>

            <button
                type="submit"
                class="btn btn-primary"
                id="user-modal-save"
            >
                Save User
            </button>

        </div>

        <div class="modal-note" id="user-modal-note">

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
            >
                <path d="M20 6 9 17l-5-5"/>
            </svg>

            <span id="user-modal-note-text"></span>

        </div>

    </form>

</div>

</div>


<!-- ========================================================
     PASSWORD MODAL
     ======================================================== -->

<div
    class="modal-backdrop"
    id="pw-modal-backdrop"
>

<div class="modal">

<h3>
Change password
</h3>


<div class="sub">
Choose a new password for this admin panel.
</div>


<div class="field">

<label>
Current password
</label>


<div class="pw-field">

<input
    type="password"
    id="cp-current"
    autocomplete="current-password"
>


<button
    type="button"
    class="pw-toggle"
    data-target="cp-current"
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

<circle
    cx="12"
    cy="12"
    r="3"
/>

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

</div>


<div class="field">

<label>
New password (min. 8 characters)
</label>


<div class="pw-field">

<input
    type="password"
    id="cp-new"
    autocomplete="new-password"
>


<button
    type="button"
    class="pw-toggle"
    data-target="cp-new"
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

<circle
    cx="12"
    cy="12"
    r="3"
/>

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

</div>


<div class="field">

<label>
Confirm new password
</label>


<div class="pw-field">

<input
    type="password"
    id="cp-confirm"
    autocomplete="new-password"
>


<button
    type="button"
    class="pw-toggle"
    data-target="cp-confirm"
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

<circle
    cx="12"
    cy="12"
    r="3"
/>

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

</div>


<div class="modal-actions">

<button
    class="btn btn-ghost"
    id="pw-modal-cancel"
>
Cancel
</button>


<button
    class="btn btn-primary"
    id="pw-modal-save"
>
Save password
</button>

</div>


<div
    class="modal-note"
    id="pw-modal-note"
>

<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.4"
>

<path d="M20 6 9 17l-5-5"/>

</svg>

<span id="pw-modal-note-text"></span>

</div>

</div>

</div>


<!-- ========================================================
     JAVASCRIPT
     ======================================================== -->

<script>
    window.ADMIN_VISITOR_DATA = <?= json_encode(
        $analytics['recent'],
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES |
        JSON_HEX_TAG |
        JSON_HEX_AMP |
        JSON_HEX_APOS |
        JSON_HEX_QUOT
    ) ?>;
</script>

<!-- Quill.js (rich text editor for the Blog tab) -->
<script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"></script>

<!-- Admin JS -->
<script src="js/admin.js"></script>

</body>
</html>