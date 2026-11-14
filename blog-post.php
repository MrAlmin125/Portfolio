<?php
/**
 * /blog-post.php?slug=...
 *
 * Public single-post view. Only ever shows posts with status =
 * 'published' — a draft is treated exactly like a missing post, so
 * there's no way to view unpublished content just by guessing/leaking
 * a slug.
 */

require __DIR__ . '/api/db.php';
require __DIR__ . '/api/helpers.php';

$cfg = require __DIR__ . '/api/config.php';
$pdo = db_connect();

$slug = trim((string)($_GET['slug'] ?? ''));
$post = null;
$blogAvailable = true;

if ($slug !== '') {
    try {
        $stmt = $pdo->prepare(
            "SELECT * FROM blog_posts WHERE slug = :slug AND status = 'published' LIMIT 1"
        );
        $stmt->execute(['slug' => $slug]);
        $post = $stmt->fetch();

        if ($post) {
            // Best-effort view counter — a failure here should never
            // stop the post itself from rendering.
            try {
                $upd = $pdo->prepare('UPDATE blog_posts SET views = views + 1 WHERE id = :id');
                $upd->execute(['id' => $post['id']]);
            } catch (Throwable $e) { /* ignore */ }
        }
    } catch (PDOException $e) {
        $blogAvailable = false;
    }
}

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

if (!$post) {
    http_response_code(404);
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1">
<title><?= $post ? h($post['title']) . ' — ' . h($siteName) : 'পোস্ট পাওয়া যায়নি — ' . h($siteName) ?></title>
<?php if ($post): ?>
<meta name="description" content="<?= h($post['excerpt'] ?: blog_excerpt_from_html($post['content'], 160)) ?>">
<meta property="og:type" content="article">
<meta property="og:title" content="<?= h($post['title']) ?>">
<meta property="og:description" content="<?= h($post['excerpt'] ?: blog_excerpt_from_html($post['content'], 160)) ?>">
<?php if ($post['cover_image']): ?>
<meta property="og:image" content="<?= h($post['cover_image']) ?>">
<?php endif; ?>
<?php else: ?>
<meta name="robots" content="noindex">
<?php endif; ?>
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
      <a href="blog.php" class="btn btn-ghost blog-back-link">← ব্লগ</a>
      <button class="icon-btn" id="theme-toggle" aria-label="থিম পরিবর্তন করুন">
        <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.4A9 9 0 1 1 11.6 3a7 7 0 0 0 9.4 9.4Z"/></svg>
        <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>
      </button>
    </div>
  </header>

  <main id="main" class="blog-main">

  <?php if (!$post): ?>

    <div class="blog-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
        <circle cx="12" cy="12" r="9"/><path d="M9.5 9.5 14.5 14.5M14.5 9.5 9.5 14.5"/>
      </svg>
      <p>পোস্টটি পাওয়া যায়নি। এটি সরিয়ে ফেলা হতে পারে, অথবা লিংকটি ভুল।</p>
      <a class="btn btn-primary" href="blog.php">ব্লগে ফিরে যান</a>
    </div>

  <?php else: ?>

    <article class="blog-article">

      <div class="blog-article-meta">
        <span><?= h(blog_fmt_date($post['published_at'] ?? $post['created_at'], $cfg)) ?></span>
      </div>

      <h1 class="blog-article-title"><?= h($post['title']) ?></h1>

      <?php if ($post['cover_image']): ?>
        <div class="blog-article-cover" style="background-image:url('<?= h($post['cover_image']) ?>')"></div>
      <?php endif; ?>

      <div class="blog-article-content">
        <?= sanitize_blog_html($post['content']) ?>
      </div>

      <div class="blog-article-footer">
        <a class="btn btn-ghost" href="blog.php">← সব পোস্ট দেখুন</a>
      </div>

    </article>

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
