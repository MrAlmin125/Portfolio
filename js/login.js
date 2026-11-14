// ============================================================
// LOGIN.JS — standalone script for login.php.
//
// This intentionally does NOT load admin.js: that file is built for
// the dashboard (tables, tabs, user management, IP blocking, etc.) and
// pulling in all of that for a login screen would be wasteful and
// fragile. This covers just the two things the login page actually
// uses: dark/light theme and the password show/hide eye icon.
// ============================================================

/* ==========================================================
   THEME BEFORE FIRST PAINT (avoids a flash of the wrong theme)
   ========================================================== */

(function () {
    try {
        var saved = localStorage.getItem('amin-admin-theme');
        var theme =
            saved ||
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
                ? 'light'
                : 'dark');
        document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // THEME TOGGLE
    // ============================================================

    document.querySelectorAll('#theme-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            var next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('amin-admin-theme', next); } catch (e) {}
        });
    });

    // ============================================================
    // PASSWORD EYE TOGGLE
    // ============================================================

    document.querySelectorAll('.pw-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var input = document.getElementById(btn.dataset.target);
            if (!input) return;
            var showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            btn.classList.toggle('showing', !showing);
        });
    });

});
