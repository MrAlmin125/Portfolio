<?php
/**
 * api/helpers.php
 *
 * Small helpers shared between admin.php, login.php, blog.php,
 * blog-post.php, and api/admin_action.php.
 */

function h($s)
{
    return htmlspecialchars(
        (string)$s,
        ENT_QUOTES,
        'UTF-8'
    );
}

/**
 * Turns a post title into a URL-safe slug: lowercase, ASCII letters/
 * numbers/hyphens only, no doubled or trailing hyphens.
 * "My First Post!" -> "my-first-post"
 * Non-Latin titles (Bengali, etc.) fall back to "post" so the slug is
 * never empty — uniqueness is then handled by the caller appending a
 * number, same as any other collision.
 */
function slugify(string $text): string
{
    $text = trim($text);
    // Transliterate accented Latin characters where possible.
    if (function_exists('iconv')) {
        $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        if ($converted !== false) $text = $converted;
    }
    $text = mb_strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    $text = trim($text, '-');
    return $text !== '' ? $text : 'post';
}

/**
 * Allowlist-based HTML sanitizer for blog post content coming out of
 * the Quill editor. Only the admin can write posts, but this is
 * defense in depth: it strips anything Quill's own toolbar wouldn't
 * produce (script/style/iframe/object/embed/form, on* event
 * attributes, javascript: URLs) while keeping normal formatting
 * markup intact, so a post can never become a script-injection vector
 * for site visitors.
 *
 * If the DOM extension isn't available on the host, falls back to a
 * simpler regex-based strip that covers the same dangerous cases with
 * less precision — degraded but safe, rather than fatal.
 */
function sanitize_blog_html(string $html): string
{
    if (!class_exists('DOMDocument')) {
        return sanitize_blog_html_fallback($html);
    }

    $allowedTags = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
        'h1', 'h2', 'h3', 'h4', 'blockquote', 'pre', 'code',
        'ul', 'ol', 'li', 'a', 'img', 'span', 'div', 'hr',
    ];
    $allowedAttrs = [
        'a'   => ['href', 'target', 'rel'],
        'img' => ['src', 'alt', 'width', 'height'],
        '*'   => ['class'],
    ];

    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    // Wrap in a fragment container so DOMDocument doesn't try to
    // invent a <html><body> structure around partial markup.
    $doc->loadHTML(
        '<?xml encoding="utf-8"?><div id="__root__">' . $html . '</div>',
        LIBXML_NOERROR | LIBXML_NOWARNING
    );
    libxml_clear_errors();

    $root = $doc->getElementById('__root__');
    if (!$root) return '';

    $strip_disallowed = function (DOMNode $node) use (&$strip_disallowed, $allowedTags, $allowedAttrs, $doc) {
        $children = iterator_to_array($node->childNodes);
        foreach ($children as $child) {
            if ($child instanceof DOMElement) {
                $tag = strtolower($child->tagName);

                // These tags are removed entirely, content included —
                // there's no safe reason a blog post needs them.
                if (in_array($tag, ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'], true)) {
                    $node->removeChild($child);
                    continue;
                }

                $strip_disallowed($child);

                if (!in_array($tag, $allowedTags, true)) {
                    // Unwrap: keep the (already-cleaned) children, drop the tag itself.
                    while ($child->firstChild) {
                        $node->insertBefore($child->firstChild, $child);
                    }
                    $node->removeChild($child);
                    continue;
                }

                $allowed = array_merge($allowedAttrs[$tag] ?? [], $allowedAttrs['*'] ?? []);
                foreach (iterator_to_array($child->attributes ?? []) as $attr) {
                    $name = strtolower($attr->name);
                    if (!in_array($name, $allowed, true)) {
                        $child->removeAttribute($attr->name);
                        continue;
                    }
                    if (($name === 'href' || $name === 'src') && preg_match('/^\s*javascript:/i', $attr->value)) {
                        $child->removeAttribute($attr->name);
                    }
                }
                if ($tag === 'a') {
                    $child->setAttribute('rel', 'noopener noreferrer');
                    if ($child->getAttribute('target') === '_blank') {
                        $child->setAttribute('target', '_blank');
                    }
                }
            } elseif (!($child instanceof DOMText || $child instanceof DOMComment)) {
                $node->removeChild($child);
            } elseif ($child instanceof DOMComment) {
                $node->removeChild($child);
            }
        }
    };

    $strip_disallowed($root);

    $out = '';
    foreach (iterator_to_array($root->childNodes) as $child) {
        $out .= $doc->saveHTML($child);
    }
    return $out;
}

function sanitize_blog_html_fallback(string $html): string
{
    $html = preg_replace('/<(script|style|iframe|object|embed|form)\b[^>]*>.*?<\/\1>/is', '', $html) ?? $html;
    $html = preg_replace('/<(script|style|iframe|object|embed|form|input|button)\b[^>]*\/?>/is', '', $html) ?? $html;
    $html = preg_replace('/\son\w+\s*=\s*"(?:[^"]*)"/i', '', $html) ?? $html;
    $html = preg_replace("/\son\w+\s*=\s*'(?:[^']*)'/i", '', $html) ?? $html;
    $html = preg_replace('/(href|src)\s*=\s*(["\'])\s*javascript:[^"\']*\2/i', '$1=$2#$2', $html) ?? $html;
    return $html;
}

/**
 * Short, plain-text preview of a blog post's HTML content — used for
 * excerpt fallback and list-view previews.
 */
function blog_excerpt_from_html(string $html, int $maxLen = 160): string
{
    $text = trim(preg_replace('/\s+/', ' ', strip_tags($html)) ?? '');
    if (mb_strlen($text) <= $maxLen) return $text;
    return mb_substr($text, 0, $maxLen) . '…';
}
