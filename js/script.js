/* =========================================================================
   AMIN — PORTFOLIO APP LOGIC
   ========================================================================= */
(function() {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     LANGUAGE STATE — Bengali is the default
     ---------------------------------------------------------------------- */
  let lang = localStorage.getItem("amin-lang") || "bn";
  const T = () => SITE_DATA[lang];
  const UI = () => UI_STRINGS[lang];

  /* ----------------------------------------------------------------------
     Icon set (inline SVG strings, reused across dynamically built cards)
     ---------------------------------------------------------------------- */
  const ICONS = {
    layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17"/><path d="M9 9.5V20"/></svg>',
    cursor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3.5 18 12l-5.2 1.3L11 19 6 3.5Z"/></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20a8 8 0 1 1 0-16 7 7 0 0 1 7 7c0 1.8-1.2 3-3 3h-1.5a1.5 1.5 0 0 0-1 2.6l.3.3a1.4 1.4 0 0 1-1 2.4Z"/><circle cx="8.2" cy="10.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.8" cy="10.5" r="1.1" fill="currentColor" stroke="none"/></svg>',
    wordpress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><path d="M5 10l3 8 2.5-6L13 18l3-9M4 10h16"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 8-4 4 4 4M15 8l4 4-4 4"/></svg>',
    appdev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M11 18.2h2"/><path d="m9 9-2 2.5L9 14M15 9l2 2.5L15 14"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M4 6.5l8 6 8-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 17.5 4 20l1-3.6A8 8 0 1 1 12 20a8 8 0 0 1-4-1.1L7 17.5Z"/><path d="M9 9.2c0-.5.4-1 1-1h.6c.3 0 .5.2.6.5l.6 1.5c.1.3 0 .6-.2.8l-.6.6a5.6 5.6 0 0 0 2.5 2.5l.6-.6c.2-.2.5-.3.8-.2l1.5.6c.3.1.5.3.5.6v.6c0 .6-.5 1-1 1-3.9 0-7-3.1-7-7Z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.3 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9Z"/></svg>'
  };
    
/* ----------------------------------------------------------------------
   Social Icon Color and Animations - SLOWER WITH PAUSE
   Starts AFTER typewriter animation completes
   ---------------------------------------------------------------------- */

(function() {
    // Social icons animation function
    function startSocialAnimation() {
        var container = document.querySelector('.social-animated');
        if (!container) return;
        
        // Make container visible with animation
        container.classList.add('active');
        
        var items = container.querySelectorAll('.social-icon-item');
        var total = items.length;
        var currentIndex = 0;
        var isShowing = true;
        var timer = null;
        var pauseTimer = null;

        function resetAll() {
            for (var i = 0; i < total; i++) {
                items[i].classList.remove('anim-in', 'anim-out', 'show', 'hide');
                items[i].style.opacity = '0';
                items[i].style.transform = 'scale(0.6)';
            }
            currentIndex = 0;
            isShowing = true;
        }

        function showNext() {
            if (currentIndex < total) {
                items[currentIndex].classList.add('anim-in');
                items[currentIndex].style.opacity = '1';
                items[currentIndex].style.transform = 'scale(1)';
                currentIndex++;
                
                if (currentIndex === total) {
                    clearInterval(timer);
                    timer = null;
                    pauseTimer = setTimeout(function() {
                        isShowing = false;
                        currentIndex = total - 1;
                        timer = setInterval(hideNext, 600);
                    }, 2500);
                }
            }
        }

        function hideNext() {
            if (currentIndex >= 0) {
                items[currentIndex].classList.add('anim-out');
                items[currentIndex].style.opacity = '0';
                items[currentIndex].style.transform = 'scale(0.4)';
                currentIndex--;
                
                if (currentIndex < 0) {
                    clearInterval(timer);
                    timer = null;
                    pauseTimer = setTimeout(function() {
                        resetAll();
                        isShowing = true;
                        timer = setInterval(showNext, 700);
                        setTimeout(showNext, 200);
                    }, 1000);
                }
            }
        }

        function startAnimation() {
            resetAll();
            clearInterval(timer);
            clearTimeout(pauseTimer);
            timer = setInterval(showNext, 700);
            setTimeout(showNext, 300);
        }

        // Hover pause
        container.addEventListener('mouseenter', function() {
            clearInterval(timer);
            clearTimeout(pauseTimer);
            timer = null;
            pauseTimer = null;
        });

        container.addEventListener('mouseleave', function() {
            if (!timer && !pauseTimer) {
                if (isShowing && currentIndex < total) {
                    timer = setInterval(showNext, 700);
                    setTimeout(showNext, 200);
                } else if (!isShowing && currentIndex >= 0) {
                    timer = setInterval(hideNext, 600);
                    setTimeout(hideNext, 200);
                } else if (currentIndex >= total && isShowing) {
                    pauseTimer = setTimeout(function() {
                        isShowing = false;
                        currentIndex = total - 1;
                        timer = setInterval(hideNext, 600);
                    }, 1500);
                } else if (currentIndex < 0) {
                    resetAll();
                    isShowing = true;
                    timer = setInterval(showNext, 700);
                    setTimeout(showNext, 300);
                }
            }
        });

        startAnimation();
        console.log('Social icons started after typewriter!');
    }

    // Start the icons once the hero typewriter reports its first pass is done.
    // (Event-driven handoff — no polling, no guessing at DOM state.)
    var iconsStarted = false;
    function startOnce() {
        if (iconsStarted) return;
        iconsStarted = true;
        setTimeout(startSocialAnimation, 800); // small breathing room after the tagline lands
    }
    document.addEventListener('hero-typewriter:firstcomplete', startOnce, { once: true });

    // Safety net: if the typewriter event never fires for any reason
    // (script error, reduced-motion edge case, etc.) still show the icons.
    setTimeout(startOnce, 10000);

    

    // theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', function() {
      document.body.classList.toggle('light');
    });

    // bottom nav
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const target = this.dataset.nav;
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    document.querySelectorAll('[data-nav-link]').forEach(a => {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.dataset.navLink;
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    });
  })();
  /* ----------------------------------------------------------------------
     Decorative project-cover illustrations
     ---------------------------------------------------------------------- */
  const ILLUSTRATIONS = {
    ecommerce: '<svg viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 42 40 24h40l8 18" opacity=".9"/><rect x="26" y="42" width="68" height="52" rx="6" opacity=".95"/><path d="M46 42v8a14 14 0 0 0 28 0v-8" opacity=".9"/><circle cx="46" cy="70" r="3" fill="#fff" stroke="none"/><circle cx="74" cy="70" r="3" fill="#fff" stroke="none"/><path d="M46 82h28" opacity=".7"/></svg>',
    corporate: '<svg viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="20" y="28" width="80" height="58" rx="8" opacity=".95"/><path d="M20 42h80" opacity=".6"/><circle cx="30" cy="35" r="2" fill="#fff" stroke="none"/><circle cx="38" cy="35" r="2" fill="#fff" stroke="none"/><path d="M34 74V58M50 74V50M66 74V64M82 74V54" opacity=".95"/></svg>',
    hospitality: '<svg viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="56" r="26" opacity=".95"/><circle cx="60" cy="56" r="10" opacity=".6"/><path d="M60 30v-8M40 92l8-14M80 92l-8-14" opacity=".85"/></svg>',
    portfolio: '<svg viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="22" y="34" width="76" height="56" rx="8" opacity=".95"/><circle cx="60" cy="62" r="16" opacity=".9"/><circle cx="60" cy="62" r="6" fill="#fff" stroke="none"/><rect x="46" y="24" width="12" height="10" rx="2" opacity=".8"/></svg>',
    mobileapp: '<svg viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="38" y="16" width="44" height="88" rx="10" opacity=".95"/><path d="M50 90h20" opacity=".8"/><rect x="46" y="30" width="28" height="10" rx="2" opacity=".7"/><path d="M46 48h28M46 58h20" opacity=".6"/></svg>',
    dashboard: '<svg viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="24" width="84" height="72" rx="8" opacity=".95"/><path d="M18 44h84" opacity=".55"/><path d="M32 78V58M48 78V64M64 78V50M80 78V68" opacity=".95"/></svg>',
    branding: '<svg viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M60 18c14 10 26 24 26 42a26 26 0 1 1-52 0c0-18 12-32 26-42Z" opacity=".95"/><circle cx="60" cy="66" r="9" opacity=".85"/></svg>',
    social: '<svg viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="34" y="14" width="52" height="92" rx="12" opacity=".95"/><rect x="44" y="30" width="12" height="12" rx="2" opacity=".85"/><rect x="64" y="30" width="12" height="12" rx="2" opacity=".85"/><rect x="44" y="50" width="12" height="12" rx="2" opacity=".85"/><path d="M64 56a6 6 0 0 1 12 0c0 5-6 8-6 8s-6-3-6-8Z" fill="#fff" stroke="none" opacity=".9"/></svg>',
    appdev: '<svg viewBox="0 0 120 120" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="36" y="14" width="48" height="92" rx="10" opacity=".95"/><path d="M52 96h16" opacity=".8"/><path d="M48 44 38 56l10 12M72 44l10 12-10 12M64 40 56 72" opacity=".9"/></svg>'
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ----------------------------------------------------------------------
     1. LOADING SCREEN
     ---------------------------------------------------------------------- */
  function runLoader() {
    const letters = "AMIN".split("");
    const holder = $("#loader-letters");
    letters.forEach((ch, i) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.style.animationDelay = (i * 0.08) + "s";
      holder.appendChild(span);
    });
    const minTime = reduceMotion ? 200 : 1100;
    window.setTimeout(() => {
      $("#loading-screen").classList.add("hidden");
      $("#app").classList.add("ready");
      document.body.classList.remove("no-scroll");
    }, minTime);
  }
  document.body.classList.add("no-scroll");

  /* ----------------------------------------------------------------------
     2. THEME
     ---------------------------------------------------------------------- */
  function initTheme() {
    const saved = localStorage.getItem("amin-theme");
    const theme = saved || "dark";
    document.body.setAttribute("data-theme", theme);
    $("#theme-toggle").addEventListener("click", () => {
      const current = document.body.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.body.setAttribute("data-theme", next);
      localStorage.setItem("amin-theme", next);
    });
  }

  /* ----------------------------------------------------------------------
     2b. LANGUAGE
     ---------------------------------------------------------------------- */
  function applyStaticStrings() {
    const dict = UI();
    document.documentElement.setAttribute("lang", lang);
    $$("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    $$("[data-i18n-placeholder]").forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });
    $("#lang-toggle").textContent = dict.lang_toggle_to;
    const readBtn = $("#read-more-btn span");
    if (readBtn) {
      const expanded = $("#about-copy").classList.contains("expanded");
      readBtn.textContent = expanded ? dict.btn_read_less : dict.btn_read_more;
    }
    // Update gallery labels
    const galleryEyebrow = document.querySelector('#about .reveal .eyebrow');
    if (galleryEyebrow) galleryEyebrow.textContent = dict.gallery_title;
    const gallerySub = document.querySelector('#about .reveal .sub');
    if (gallerySub) gallerySub.textContent = dict.gallery_sub;
  }

  function renderAll() {
    renderHero();
    renderStats();
    renderFeatured();
    renderFilters();
    renderWorkGrid("__ALL__");
    renderAbout();
    renderTimeline();
    renderTestimonials();
    renderSkills();
    renderServices();
    renderContact();
    renderGallery();
    applyStaticStrings();
  }

  function snapDynamicEffects() {
    $$(".count").forEach(el => { el.textContent = el.dataset.target; });
    $$(".skill-fill").forEach(el => { el.style.width = el.dataset.level + "%"; });
  }

  function initLang() {
    $("#lang-toggle").addEventListener("click", () => {
      lang = lang === "bn" ? "en" : "bn";
      localStorage.setItem("amin-lang", lang);
      currentFilter = "__ALL__";
      renderAll();
      snapDynamicEffects();
      initGallery();
    });
  }

  /* ----------------------------------------------------------------------
     3. RENDER CONTENT FROM SITE_DATA
     ---------------------------------------------------------------------- */
  function renderHero() {
    const p = T().profile;
    const dict = UI();
    $("#hero-name").textContent = p.name;
    $("#hero-role").textContent = p.title.toUpperCase();
    $("#hero-tagline").textContent = p.tagline;
    $("#hero-photo").src = p.image;
    $("#hero-photo").onerror = function() { this.src = "assets/images/profile-placeholder.svg"; };
    $$('.about-photo img, .hero-portrait img').forEach(img => {
      if (img.id !== "hero-photo") {
        img.src = p.image;
        img.loading = "lazy";
        img.decoding = "async";
        img.onerror = function() { this.src = "assets/images/profile-placeholder.svg"; };
      }
    });
    $("#availability-pill").innerHTML = `<span class="status-dot"></span> ${p.available ? dict.available : dict.booked}`;
    $("#year").textContent = new Date().getFullYear();
    runHeroTypewriter(p.name, p.title.toUpperCase(), p.tagline);
  }

  // ---- infinite typewriter animation: name → (pause) → role → (pause) → tagline → (hold) → erase all → repeat ----
  let heroTypeToken = 0;
  function splitGraphemes(text) {
    try {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
        return Array.from(seg.segment(text), s => s.segment);
      }
    } catch (e) {}
    return Array.from(text); // code-point fallback (still safe for most Bengali text)
  }
  async function runHeroTypewriter(nameText, roleText, taglineText) {
    const nameEl = $("#hero-name");
    const roleEl = $("#hero-role");
    const taglineEl = $("#hero-tagline");
    if (!nameEl || !roleEl || !taglineEl) return;
    const myToken = ++heroTypeToken;

    if (reduceMotion) {
      nameEl.textContent = nameText;
      roleEl.textContent = roleText;
      taglineEl.textContent = taglineText;
      document.dispatchEvent(new CustomEvent("hero-typewriter:firstcomplete"));
      return;
    }

    const alive = () => myToken === heroTypeToken;
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    const allEls = [nameEl, roleEl, taglineEl];

    async function typeInto(el, text, speed) {
      const graphemes = splitGraphemes(text);
      for (let i = 0; i < graphemes.length; i++) {
        if (!alive()) return false;
        el.textContent += graphemes[i];
        await wait(speed);
      }
      return true;
    }
    async function eraseFrom(el, speed) {
      let graphemes = splitGraphemes(el.textContent);
      while (graphemes.length > 0) {
        if (!alive()) return false;
        graphemes.pop();
        el.textContent = graphemes.join("");
        await wait(speed);
      }
      return true;
    }
    function setCursor(activeEl) {
      allEls.forEach(el => el.classList.toggle("type-cursor", el === activeEl));
    }

    let firstCycleTyped = false;
    while (alive()) {
      nameEl.textContent = ""; roleEl.textContent = ""; taglineEl.textContent = "";

      setCursor(nameEl);
      if (!(await typeInto(nameEl, nameText, 68))) return;
      await wait(380);

      setCursor(roleEl);
      if (!(await typeInto(roleEl, roleText, 42))) return;
      await wait(380);

      setCursor(taglineEl);
      if (!(await typeInto(taglineEl, taglineText, 22))) return;

      // Let the rest of the page (e.g. the social icons) know the very
      // first type-out has finished, exactly once, right as it happens —
      // no need to poll the DOM guessing whether text looks "done".
      if (!firstCycleTyped) {
        firstCycleTyped = true;
        document.dispatchEvent(new CustomEvent("hero-typewriter:firstcomplete"));
      }

      await wait(2600); // hold the full line before erasing

      setCursor(taglineEl);
      if (!(await eraseFrom(taglineEl, 10))) return;
      setCursor(roleEl);
      if (!(await eraseFrom(roleEl, 26))) return;
      setCursor(nameEl);
      if (!(await eraseFrom(nameEl, 42))) return;

      setCursor(null);
      await wait(550); // brief pause before the loop restarts
    }
  }

  function renderStats() {
    const grid = $("#stat-grid");
    grid.innerHTML = T().stats.map((s) => `
      <div class="stat-card">
        <div class="num"><span class="count" data-target="${s.value}">0</span><span class="accent-suffix">${s.suffix}</span></div>
        <div class="label">${s.label}</div>
      </div>`).join("");
  }

  function projectCardHTML(p) {
    return `
      <div class="card project-card" data-project="${p.id}" tabindex="0" role="button" aria-label="View ${p.title}">
        <div class="project-cover" style="background:${p.cover}">
          <span class="tag">${p.tag}</span>
          <div class="illo">${ILLUSTRATIONS[p.illustration] || ''}</div>
        </div>
        <div class="project-body">
          <h3>${p.title}</h3>
          <span class="cat">${p.category}</span>
          <p>${p.description}</p>
          <span class="project-view">${UI().project_view} ${ICONS.arrow}</span>
        </div>
      </div>`;
  }

  function renderFeatured() {
    const wrap = $("#featured-projects");
    wrap.innerHTML = T().projects.slice(0, 4).map(p => projectCardHTML(p)).join("");
    initAutoScroll("featured-projects");
  }

  let currentFilter = "__ALL__";

  function renderWorkGrid(filter) {
    if (filter !== undefined) currentFilter = filter;
    const grid = $("#project-grid");
    const items = currentFilter && currentFilter !== "__ALL__" ? T().projects.filter(p => p.category === currentFilter) : T().projects;
    grid.innerHTML = items.map(p => projectCardHTML(p)).join("");
    initAutoScroll("project-grid");
  }

  // ---- auto-sliding horizontal card rows (featured projects + work grid) ----
  const autoScrollTimers = {};
  function initAutoScroll(id, stepMs = 3200) {
    const el = document.getElementById(id);
    if (!el) return;
    if (autoScrollTimers[id]) clearInterval(autoScrollTimers[id]);
    if (!el.children.length) return;

    function tick() {
      if (el._asPaused || document.hidden) return;
      const card = el.children[0];
      if (!card) return;
      const cs = getComputedStyle(el);
      const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 14;
      const step = card.getBoundingClientRect().width + gap;
      const maxScroll = el.scrollWidth - el.clientWidth - 2;
      if (maxScroll <= 0) return;
      if (el.scrollLeft >= maxScroll) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }
    autoScrollTimers[id] = setInterval(tick, stepMs);

    // Bind pause/resume handlers once per element — state lives on the
    // element itself so it survives future re-renders/re-inits.
    if (!el.dataset.autoScrollBound) {
      el.dataset.autoScrollBound = "1";
      el.addEventListener("mouseenter", () => { el._asPaused = true; });
      el.addEventListener("mouseleave", () => { el._asPaused = false; });
      el.addEventListener("touchstart", () => { el._asPaused = true; }, { passive: true });
      el.addEventListener("touchend", () => { setTimeout(() => { el._asPaused = false; }, 1500); }, { passive: true });
    }
  }

  function renderFilters() {
    const cats = ["__ALL__", ...new Set(T().projects.map(p => p.category))];
    const row = $("#filter-row");
    row.innerHTML = cats.map((c) => `<button class="filter-pill ${c === currentFilter ? 'active' : ''}" data-filter="${c}">${c === "__ALL__" ? UI().filter_all : c}</button>`).join("");
  }

  function initFilters() {
    $("#filter-row").addEventListener("click", e => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      $$(".filter-pill", $("#filter-row")).forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderWorkGrid(btn.dataset.filter);
    });
  }

  function renderAbout() {
    const p = T().profile;
    $("#about-meta").innerHTML = `
      <span class="meta-chip">${ICONS.pin} ${p.location}</span>
      <span class="meta-chip">${ICONS.briefcase} ${p.title}</span>
      <span class="meta-chip"><span class="status-dot" style="width:6px;height:6px"></span> ${p.available ? UI().available : UI().booked}</span>`;
    const copy = $("#about-copy");
    const wasExpanded = copy.classList.contains("expanded");
    copy.innerHTML = p.bio.map((para, i) => `<p class="${i > 0 ? 'clamp' : ''}">${para}</p>`).join("");
    if (wasExpanded) copy.classList.add("expanded");
    $("#read-more-btn").style.display = p.bio.length <= 1 ? "none" : "";
  }

  function renderTimeline() {
    $("#timeline").innerHTML = T().experience.map(e => `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-period">${e.period}</div>
        <div class="tl-role">${e.role}</div>
        <div class="tl-place">${e.place}</div>
        <div class="tl-desc">${e.desc}</div>
      </div>`).join("");
  }

  function renderTestimonials() {
    $("#testimonials").innerHTML = T().testimonials.map(t => `
      <div class="card testi-card">
        <div class="testi-stars">${ICONS.star.repeat(t.rating).split('</svg>').filter(Boolean).map(s => s + '</svg>').join('')}</div>
        <p class="testi-review">"${t.review}"</p>
        <div class="testi-person">
          <div class="testi-avatar">${t.photo}</div>
          <div><div class="name">${t.name}</div><div class="role">${t.role}</div></div>
        </div>
      </div>`).join("");
    initAutoScroll("testimonials", 3800);
  }

  function renderSkills() {
    $("#skills-list").innerHTML = T().skills.map(block => `
      <div class="skill-block">
        <h3>${block.category}</h3>
        ${block.items.map(item => `
          <div class="skill-row">
            <div class="skill-row-top"><span>${item.name}</span><span>${item.level}%</span></div>
            <div class="skill-track"><div class="skill-fill" data-level="${item.level}"></div></div>
          </div>`).join("")}
      </div>`).join("");
  }

  function renderServices() {
    $("#service-grid").innerHTML = T().services.map(s => `
      <div class="card service-card">
        <div class="service-icon">${ICONS[s.icon] || ICONS.layout}</div>
        <h4>${s.title}</h4>
        <p>${s.desc}</p>
      </div>`).join("");
  }

  function renderContact() {
    const p = T().profile;
    const dict = UI();
    $("#contact-info").innerHTML = `
      <a class="card info-card" href="mailto:${p.email}"><div class="info-icon">${ICONS.mail}</div><div><div class="label">${dict.label_email}</div><div class="value">${p.email}</div></div></a>
      <a class="card info-card" href="tel:${CONTACT.phone}"><div class="info-icon">${ICONS.phone}</div><div><div class="label">${dict.label_phone}</div><div class="value">${p.phone}</div></div></a>
      <a class="card info-card" href="${p.whatsapp}" target="_blank" rel="noopener"><div class="info-icon">${ICONS.whatsapp}</div><div><div class="label">${dict.label_whatsapp}</div><div class="value">${dict.value_chat_now}</div></div></a>
      <div class="card info-card"><div class="info-icon">${ICONS.pin}</div><div><div class="label">${dict.label_location}</div><div class="value">${p.location}</div></div></div>`;

    $("#social-row").innerHTML = T().social.map(s => `
      <a class="social-btn" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}"><i class="${s.icon}"></i></a>`).join("");
  }

  /* ----------------------------------------------------------------------
     4. GALLERY — Sliding 2 by 2
     ---------------------------------------------------------------------- */
  let galleryIndex = 0;
  let gallerySlides = [];
  let galleryTimer = null;
  const GALLERY_AUTOPLAY_MS = 4000;

  function renderGallery() {
    const images = T().gallery || [];
    const track = $("#gallery-track");
    const dots = $("#gallery-dots");

    // Create slides with 2 images each (2 slides × 2 images = 4 total)
    gallerySlides = [];
    for (let i = 0; i < images.length; i += 2) {
      gallerySlides.push(images.slice(i, i + 2));
    }

    track.innerHTML = gallerySlides.map(slide => `
      <div class="gallery-slide">
        ${slide.map(src => `
          <div class="gallery-item"><img src="${src}" alt="গ্যালারি ছবি" loading="lazy" onerror="this.style.display='none'"></div>
        `).join('')}
        ${slide.length < 2 ? Array.from({ length: 2 - slide.length }).map(() => '<div class="gallery-item" style="background:transparent;border:none;"></div>').join('') : ''}
      </div>
    `).join('');

    // Dots
    dots.innerHTML = gallerySlides.map((_, i) => `
      <button class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i+1}"></button>
    `).join('');

    galleryIndex = 0;
    updateGallery();
    startGalleryAutoplay();
  }

  function updateGallery() {
    const track = $("#gallery-track");
    const dots = $$(".gallery-dot");
    track.style.transform = `translateX(-${galleryIndex * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === galleryIndex);
    });
    const prev = $("#gallery-prev");
    const next = $("#gallery-next");
    if (prev) prev.disabled = gallerySlides.length <= 1;
    if (next) next.disabled = gallerySlides.length <= 1;
  }

  function startGalleryAutoplay() {
    stopGalleryAutoplay();
    if (gallerySlides.length <= 1) return;
    galleryTimer = setInterval(() => {
      galleryIndex = (galleryIndex + 1) % gallerySlides.length;
      updateGallery();
    }, GALLERY_AUTOPLAY_MS);
  }

  function stopGalleryAutoplay() {
    if (galleryTimer) {
      clearInterval(galleryTimer);
      galleryTimer = null;
    }
  }

  function initGallery() {
    const prev = $("#gallery-prev");
    const next = $("#gallery-next");
    const dots = $("#gallery-dots");
    const wrapper = $("#gallery-wrapper");

    if (prev) {
      prev.addEventListener("click", () => {
        galleryIndex = galleryIndex > 0 ? galleryIndex - 1 : gallerySlides.length - 1;
        updateGallery();
        startGalleryAutoplay();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        galleryIndex = (galleryIndex + 1) % gallerySlides.length;
        updateGallery();
        startGalleryAutoplay();
      });
    }

    if (dots) {
      dots.addEventListener("click", (e) => {
        const dot = e.target.closest(".gallery-dot");
        if (dot) {
          const index = parseInt(dot.dataset.index);
          if (!isNaN(index) && index !== galleryIndex) {
            galleryIndex = index;
            updateGallery();
            startGalleryAutoplay();
          }
        }
      });
    }

    // Pause autoplay while the user is interacting with the gallery,
    // resume once they move away.
    if (wrapper) {
      wrapper.addEventListener("mouseenter", stopGalleryAutoplay);
      wrapper.addEventListener("mouseleave", startGalleryAutoplay);
      wrapper.addEventListener("touchstart", stopGalleryAutoplay, { passive: true });
      wrapper.addEventListener("touchend", startGalleryAutoplay, { passive: true });
    }

    // Pause when the tab isn't visible so it doesn't jump ahead while away.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopGalleryAutoplay();
      else startGalleryAutoplay();
    });
  }

  /* ----------------------------------------------------------------------
     5. NAVIGATION — scrollspy + smooth scroll
     ---------------------------------------------------------------------- */
  function initNav() {
    const navItems = $$(".nav-item");
    const screens = $$("[data-screen]");

    function go(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }

    navItems.forEach(btn => btn.addEventListener("click", () => go(btn.dataset.nav)));
    $$('[data-nav-link]').forEach(a => a.addEventListener("click", e => {
      e.preventDefault();
      go(a.dataset.navLink);
    }));

    const setActive = (id) => {
      navItems.forEach(b => b.classList.toggle("active", b.dataset.nav === id));
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    screens.forEach(s => io.observe(s));
  }

  /* ----------------------------------------------------------------------
     6. SCROLL REVEAL + COUNTERS + SKILL BARS
     ---------------------------------------------------------------------- */
  function initReveal() {
    const targets = $$(".reveal");
    if (reduceMotion) { targets.forEach(t => t.classList.add("in")); return; }

    // Track scroll direction so sections animate the way you're actually
    // scrolling: rise up from below while scrolling down, drop in from
    // above while scrolling back up.
    let lastY = window.scrollY;
    let scrollDir = "down";
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      scrollDir = y > lastY ? "down" : y < lastY ? "up" : scrollDir;
      lastY = y;
    }, { passive: true });

    // Section-by-section reveal that replays every time a block crosses
    // into or out of view — scrolling down plays it in, scrolling back up
    // plays it out and back in again, instead of firing only once.
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        e.target.classList.toggle("reveal-up", scrollDir === "up");
        e.target.classList.toggle("in", e.isIntersecting);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -15% 0px" });
    targets.forEach(t => io.observe(t));
  }

  function initCounters() {
    const els = $$(".count");
    if (!els.length) return;
    const animate = (el) => {
      const target = parseInt(el.dataset.target, 10);
      if (reduceMotion) { el.textContent = target; return; }
      const dur = 1200;
      const start = performance.now();

      // Each (re)play gets its own token, stored on the element — if the
      // element re-enters view and a new animate() starts before an old
      // one finished, the old tick() loop sees its token no longer
      // matches and stops instead of fighting the new run for control.
      const runId = (el._countRunId = (el._countRunId || 0) + 1);
      el.textContent = "0";

      function tick(now) {
        if (el._countRunId !== runId) return;
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) animate(e.target); });
    }, { threshold: 0.4 });
    els.forEach(el => io.observe(el));
  }

  function initSkillBars() {
    const fills = $$(".skill-fill");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.width = e.target.dataset.level + "%";
          io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    fills.forEach(f => io.observe(f));
  }

  /* ----------------------------------------------------------------------
     7. READ MORE (About)
     ---------------------------------------------------------------------- */
  function initReadMore() {
    const btn = $("#read-more-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const copy = $("#about-copy");
      const expanded = copy.classList.toggle("expanded");
      const span = $("#read-more-btn span");
      span.textContent = expanded ? UI().btn_read_less : UI().btn_read_more;
    });
  }

  /* ----------------------------------------------------------------------
     8. PROJECT BOTTOM SHEET
     ---------------------------------------------------------------------- */
  function initSheet() {
    const sheet = $("#project-sheet");
    const backdrop = $("#sheet-backdrop");
    const body = $("#sheet-body");

    function openProject(id) {
      const p = T().projects.find(x => x.id === id);
      if (!p) return;
      const dict = UI();
      body.innerHTML = `
        <div class="sheet-cover" style="background:${p.cover}">
          <span class="tag">${p.tag}</span>
          <div class="illo">${ILLUSTRATIONS[p.illustration] || ''}</div>
        </div>
        <div class="sheet-content">
          <span class="cat">${p.category}</span>
          <h3>${p.title}</h3>
          <p class="desc">${p.description}</p>
          <div class="sheet-block"><h4>${dict.sheet_problem}</h4><p>${p.problem}</p></div>
          <div class="sheet-block"><h4>${dict.sheet_solution}</h4><p>${p.solution}</p></div>
          <div class="sheet-block"><h4>${dict.sheet_features}</h4><ul>${p.features.map(f => `<li>${f}</li>`).join("")}</ul></div>
          <div class="sheet-block"><h4>${dict.sheet_technologies}</h4><div class="sheet-tech">${p.tech.map(t => `<span>${t}</span>`).join("")}</div></div>
          <a href="${p.link}" class="btn btn-primary" target="_blank" rel="noopener">${dict.btn_visit_project} ${ICONS.arrow}</a>
        </div>`;
      sheet.classList.add("open");
      backdrop.classList.add("open");
      document.body.classList.add("no-scroll");
      sheet.scrollTop = 0;
    }

    function close() {
      sheet.classList.remove("open");
      backdrop.classList.remove("open");
      document.body.classList.remove("no-scroll");
    }

    document.addEventListener("click", e => {
      const card = e.target.closest("[data-project]");
      if (card) { openProject(card.dataset.project); }
    });
    document.addEventListener("keydown", e => {
      const card = e.target.closest && e.target.closest("[data-project]");
      if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault();
        openProject(card.dataset.project); }
      if (e.key === "Escape") close();
    });
    $("#sheet-close").addEventListener("click", close);
    backdrop.addEventListener("click", close);
  }

  /* ----------------------------------------------------------------------
     9. CONTACT FORM
     ---------------------------------------------------------------------- */
  function initForm() {
    const form = $("#contact-form");
    const note = $("#form-note");
    const errNote = $("#form-note-error");
    const errText = $("#form-error-text");
    const submitBtn = $("#contact-submit");
    const submitLabel = submitBtn.querySelector("span");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      note.classList.remove("show");
      errNote.classList.remove("show");

      const payload = {
        name: $("#f-name").value.trim(),
        email: $("#f-email").value.trim(),
        phone: $("#f-phone").value.trim(),
        subject: $("#f-subject").value.trim(),
        message: $("#f-message").value.trim(),
        subscribe: $("#f-subscribe").checked,
        website: $("#f-website").value
      };

      submitBtn.setAttribute("disabled", "true");
      const originalLabel = submitLabel.textContent;
      submitLabel.textContent = UI().btn_sending;

      try {
        const res = await fetch("api/contact.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const rawText = await res.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          // The server didn't return valid JSON (a PHP fatal error the host
          // printed as HTML, a 404/500 error page, a host-injected banner,
          // etc). Logging the raw response is the fastest way to see the
          // *real* cause in the browser console instead of just the
          // generic message shown to the visitor below.
          console.error("Contact form: server response was not valid JSON.", { status: res.status, body: rawText });
          data = { ok: false };
        }

        if (res.ok && data.ok) {
          note.classList.add("show");
          form.reset();
          window.setTimeout(() => note.classList.remove("show"), 5000);
        } else {
          if (!data.error) console.error("Contact form failed.", { status: res.status, data });
          errText.textContent = data.error || UI().contact_error;
          errNote.classList.add("show");
        }
      } catch (err) {
        console.error("Contact form: request failed before reaching the server.", err);
        errText.textContent = UI().contact_error;
        errNote.classList.add("show");
      } finally {
        submitBtn.removeAttribute("disabled");
        submitLabel.textContent = originalLabel;
      }
    });
  }

  /* ----------------------------------------------------------------------
     10. NEWSLETTER
     ---------------------------------------------------------------------- */
  function initNewsletter() {
    const form = $("#newsletter-form");
    if (!form) return;
    const note = $("#newsletter-note");
    const successText = $("#newsletter-success-text");
    const errNote = $("#newsletter-note-error");
    const errText = $("#newsletter-error-text");
    const submitBtn = $("#newsletter-submit");
    const submitLabel = submitBtn.querySelector("span");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      note.classList.remove("show");
      errNote.classList.remove("show");

      const payload = {
        email: $("#n-email").value.trim(),
        website: $("#n-website").value
      };

      submitBtn.setAttribute("disabled", "true");
      const originalLabel = submitLabel.textContent;
      submitLabel.textContent = UI().btn_subscribing;

      try {
        const res = await fetch("api/subscribe.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const rawText = await res.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          // See the matching comment in the contact form handler above —
          // same idea: a non-JSON response means something (usually a PHP
          // fatal error or a host error page) happened before our code
          // could send back its own JSON. Logged here for debugging.
          console.error("Newsletter form: server response was not valid JSON.", { status: res.status, body: rawText });
          data = { ok: false };
        }

        if (res.ok && data.ok) {
          successText.textContent = data.already ? UI().newsletter_already : UI().newsletter_success;
          note.classList.add("show");
          form.reset();
          window.setTimeout(() => note.classList.remove("show"), 5000);
        } else {
          if (!data.error) console.error("Newsletter form failed.", { status: res.status, data });
          errText.textContent = data.error || UI().newsletter_error;
          errNote.classList.add("show");
        }
      } catch (err) {
        console.error("Newsletter form: request failed before reaching the server.", err);
        errText.textContent = UI().newsletter_error;
        errNote.classList.add("show");
      } finally {
        submitBtn.removeAttribute("disabled");
        submitLabel.textContent = originalLabel;
      }
    });
  }

  /* ----------------------------------------------------------------------
     11. ANALYTICS
     ---------------------------------------------------------------------- */
  function getVisitorId() {
    try {
      let id = localStorage.getItem("amin-visitor-id");
      if (!id) {
        id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ("v-" + Date.now() + "-" + Math.random().toString(36).slice(2));
        localStorage.setItem("amin-visitor-id", id);
      }
      return id;
    } catch (e) {
      return "v-" + Date.now() + "-" + Math.random().toString(36).slice(2);
    }
  }

  function trackPageView() {
    try {
      // navigator.brave only exists in Brave, and Brave's own UA string
      // deliberately says "Chrome" for site-compatibility — so we ask
      // Brave directly instead of relying on the UA string.
      const braveCheck = (navigator.brave && typeof navigator.brave.isBrave === 'function')
        ? navigator.brave.isBrave().catch(() => false)
        : Promise.resolve(false);

      // Chromium browsers (Chrome, Brave, Edge, Opera, Samsung Internet)
      // stopped putting the real device model in the User-Agent header
      // for privacy — but they still hand it over through the newer
      // User-Agent Client Hints API when a page asks for it directly.
      // This is what gets the real model back instead of just "Hidden".
      const modelCheck = (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === 'function')
        ? navigator.userAgentData.getHighEntropyValues(["model"]).then(v => v.model || "").catch(() => "")
        : Promise.resolve("");

      Promise.all([braveCheck, modelCheck]).then(([isBrave, model]) => {
        let visitorTz = "";
        try { visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}

        const payload = JSON.stringify({
          visitor_id: getVisitorId(),
          page: location.pathname + location.hash,
          referrer: document.referrer || "",
          lang: navigator.language || "",
          browser_override: isBrave ? "Brave" : "",
          model_override: model || "",
          visitor_tz: visitorTz
        });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("api/track.php", blob);
        } else {
          fetch("api/track.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
        }
      });
    } catch (e) {}
  }

  /* ----------------------------------------------------------------------
     INIT
     ---------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    // Check if SITE_DATA and UI_STRINGS are defined
    if (typeof SITE_DATA === 'undefined' || typeof UI_STRINGS === 'undefined') {
      console.error("SITE_DATA or UI_STRINGS not defined. Make sure data.js is loaded before script.js");
      return;
    }

    renderAll();
    initTheme();
    initLang();
    initNav();
    initFilters();
    initReveal();
    initCounters();
    initSkillBars();
    initReadMore();
    initSheet();
    initForm();
    initNewsletter();
    initGallery();
    runLoader();
    trackPageView();
  });
})();