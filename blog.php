<?php
/**
 * /blog.php
 *
 * Public blog listing page. Shows published posts only (drafts never
 * appear here) in newest-first order, paginated.
 */

require __DIR__ . '/api/db.php';
require __DIR__ . '/api/helpers.php';

$cfg = require __DIR__ . '/api/config.php';
$pdo = db_connect();

$perPage = 9;
$page = max(1, (int)($_GET['page'] ?? 1));
$offset = ($page - 1) * $perPage;

$blogAvailable = true;
$posts = [];
$totalPosts = 0;

try {
    $totalPosts = (int)$pdo->query(
        "SELECT COUNT(*) FROM blog_posts WHERE status = 'published'"
    )->fetchColumn();

    // LIMIT/OFFSET are interpolated directly rather than bound — both
    // values are already forced to int above, so this is safe, and it
    // sidesteps a real-world quirk on some MySQL/MariaDB setups where a
    // *bound* LIMIT/OFFSET inside a prepared statement is rejected or
    // silently ignored depending on the driver's emulation settings.
    $stmt = $pdo->query(
        "SELECT id, title, slug, excerpt, cover_image, published_at, created_at
         FROM blog_posts
         WHERE status = 'published'
         ORDER BY COALESCE(published_at, created_at) DESC
         LIMIT {$perPage} OFFSET {$offset}"
    );
    $posts = $stmt->fetchAll();
} catch (PDOException $e) {
    // Most likely the blog_posts table doesn't exist yet on this
    // database (blog_migration.sql hasn't been run) — show the empty
    // state below rather than a fatal error. Logged so a *different*
    // cause (a real query error) still leaves a trail in the host's
    // PHP error log instead of silently looking like "no posts yet".
    error_log('blog.php: blog_posts query failed — ' . $e->getMessage());
    $blogAvailable = false;
}

$totalPages = $perPage > 0 ? (int)ceil($totalPosts / $perPage) : 1;
$siteName = $cfg['site_name'] ?? 'Amin';

function blog_fmt_date(?string $raw, array $cfg): string
{
    if (!$raw) return '';
    try {
        $dt = new DateTime($raw, new DateTimeZone('UTC'));
        $dt->setTimezone(new DateTimeZone($cfg['timezone'] ?? 'Asia/Dhaka'));
        return $dt->format('d M Y');
    } catch (Throwable $e) {
        return '';
    }
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1">
<title>ব্লগ — <?= h($siteName) ?></title>
<meta name="description" content="<?= h($siteName) ?>-এর ব্লগ — ডিজাইন, ডেভেলপমেন্ট এবং প্রজেক্ট নিয়ে লেখা।">
<meta name="theme-color" content="#0A0A0F">
<link rel="icon" href="assets/images/Amin___Black.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Baloo+Da+2:wght@500;600;700;800&family=Tiro+Bangla&family=Hind+Siliguri:wght@400;500;600;700&display=swap">

<link rel="stylesheet" href="css/style.css?v=6">
<link rel="stylesheet" href="css/blog.css?v=<?= @filemtime(__DIR__ . '/css/blog.css') ?>">
</head>
<body data-theme="dark">

<div id="app">

  <header class="topbar">
    <a href="index.html" class="brandmark">Amin<span style="color:var(--accent)">.</span></a>
    <div class="topbar-actions">
      <a href="index.html" class="btn btn-ghost blog-back-link">← পোর্টফোলিও</a>
      <button class="icon-btn" id="theme-toggle" aria-label="থিম পরিবর্তন করুন">
        <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.4A9 9 0 1 1 11.6 3a7 7 0 0 0 9.4 9.4Z"/></svg>
        <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>
      </button>
    </div>
  </header>

  <main id="main" class="blog-main">

    <section class="blog-hero">
      <h1 class="section-head">ব্লগ</h1>
      <p class="blog-hero-sub">ডিজাইন, ডেভেলপমেন্ট এবং প্রজেক্ট নিয়ে লেখা।</p>
    </section>

    <?php if (!$blogAvailable || empty($posts)): ?>

      <div class="blog-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
          <path d="M6 4h9l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"/>
          <path d="M9 12h6M9 16h6M9 8h2"/>
        </svg>
        <p>এখনো কোনো পোস্ট প্রকাশিত হয়নি। শীঘ্রই ফিরে আসুন।</p>
      </div>

    <?php else: ?>

      <div class="blog-grid">

        <?php foreach ($posts as $p): ?>

          <a class="blog-card" href="blog-post.php?slug=<?= h($p['slug']) ?>">

            <?php if ($p['cover_image']): ?>
              <div class="blog-card-cover" style="background-image:url('<?= h($p['cover_image']) ?>')"></div>
            <?php else: ?>
              <div class="blog-card-cover blog-card-cover-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 16.5 8.5 12l3 3L17 10l3 3"/><rect x="3.5" y="4.5" width="17" height="15" rx="2"/></svg>
              </div>
            <?php endif; ?>

            <div class="blog-card-body">
              <div class="blog-card-date"><?= h(blog_fmt_date($p['published_at'] ?? $p['created_at'], $cfg)) ?></div>
              <h2 class="blog-card-title"><?= h($p['title']) ?></h2>
              <?php if ($p['excerpt']): ?>
                <p class="blog-card-excerpt"><?= h($p['excerpt']) ?></p>
              <?php endif; ?>
              <span class="blog-card-readmore">আরও পড়ুন <i class="fa-solid fa-arrow-right"></i></span>
            </div>

          </a>

        <?php endforeach; ?>

      </div>

      <?php if ($totalPages > 1): ?>

        <div class="blog-pagination">

          <?php if ($page > 1): ?>
            <a class="btn btn-ghost" href="?page=<?= $page - 1 ?>">← আগের</a>
          <?php endif; ?>

          <span class="blog-page-indicator"><?= $page ?> / <?= $totalPages ?></span>

          <?php if ($page < $totalPages): ?>
            <a class="btn btn-ghost" href="?page=<?= $page + 1 ?>">পরের →</a>
          <?php endif; ?>

        </div>

      <?php endif; ?>

    <?php endif; ?>

  </main>

  <footer class="blog-footer">
    <p>&copy; <?= date('Y') ?> <?= h($siteName) ?>. সর্বস্বত্ব সংরক্ষিত।</p>
  </footer>

</div>

<script>
  (function() {
    var saved = localStorage.getItem('amin-theme');
    var theme = saved || 'dark';
    document.body.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function() {
        var current = document.body.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('amin-theme', next);
      });
    }
  })();
</script>

</body>
</html>
