/* =========================================================
   Portfolio — Mariem Louhichi
   Thème, langue FR/EN, navigation, texte animé, filtres,
   copie, formulaire de contact, apparitions au défilement
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var lang = 'fr';

  function $(id) { return document.getElementById(id); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function t(fr, en) { return lang === 'en' ? en : fr; }

  /* ---------- Stockage local tolérant aux pannes ---------- */
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignoré */ } }
  };

  /* =======================================================
     Notification (toast)
     ======================================================= */
  var toastEl = $('toast');
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) { return; }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2400);
  }

  /* =======================================================
     1. Thème clair / sombre
     ======================================================= */
  var themeBtn = $('themeBtn');

  function systemDark() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  var savedTheme = store.get('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    root.setAttribute('data-theme', savedTheme);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      var isDark = current ? current === 'dark' : systemDark();
      var next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('theme', next);
    });
  }

  /* =======================================================
     2. Texte animé (machine à écrire)
     ======================================================= */
  var typedEl = $('typed');
  var typedTimer = null;

  function startTyped() {
    if (!typedEl) { return; }
    clearTimeout(typedTimer);

    var words = null;
    try { words = JSON.parse(typedEl.getAttribute(lang === 'en' ? 'data-en-words' : 'data-fr-words')); }
    catch (e) { words = null; }
    if (!words || !words.length) { return; }

    var wi = 0;
    var ci = words[0].length;
    var deleting = true;
    typedEl.textContent = words[0];
    if (reduceMotion || words.length < 2) { return; }

    function tick() {
      var word = words[wi];
      if (deleting) {
        ci -= 1;
        typedEl.textContent = word.slice(0, ci);
        if (ci <= 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
          typedTimer = setTimeout(tick, 350);
          return;
        }
        typedTimer = setTimeout(tick, 38);
      } else {
        ci += 1;
        typedEl.textContent = word.slice(0, ci);
        if (ci >= word.length) {
          deleting = true;
          typedTimer = setTimeout(tick, 1900);
          return;
        }
        typedTimer = setTimeout(tick, 75);
      }
    }

    typedTimer = setTimeout(tick, 2200);
  }

  /* =======================================================
     3. Langue FR / EN
     ======================================================= */
  var langBtn = $('langBtn');
  var langLabel = $('langLabel');
  var burger = $('burger');
  var toTop = $('toTop');
  var translatable = document.querySelectorAll('[data-fr][data-en]');
  var placeholders = document.querySelectorAll('[data-fr-ph][data-en-ph]');
  var menuOpen = false;

  function applyLabels() {
    if (langBtn) { langBtn.setAttribute('aria-label', t('Switch to English', 'Passer en français')); }
    if (themeBtn) { themeBtn.setAttribute('aria-label', t('Changer de thème', 'Toggle theme')); }
    if (burger) { burger.setAttribute('aria-label', menuOpen ? t('Fermer le menu', 'Close menu') : t('Ouvrir le menu', 'Open menu')); }
    if (toTop) { toTop.setAttribute('aria-label', t('Retour en haut', 'Back to top')); }
    each(document.querySelectorAll('.copy-btn[data-copy]'), function (btn) {
      btn.setAttribute('aria-label', t('Copier', 'Copy') + ' ' + btn.getAttribute('data-copy'));
    });
  }

  function applyLang(next) {
    lang = next === 'en' ? 'en' : 'fr';
    each(translatable, function (el) {
      el.innerHTML = el.getAttribute(lang === 'en' ? 'data-en' : 'data-fr');
    });
    each(placeholders, function (el) {
      el.setAttribute('placeholder', el.getAttribute(lang === 'en' ? 'data-en-ph' : 'data-fr-ph'));
    });
    root.setAttribute('lang', lang);
    if (langLabel) { langLabel.textContent = lang === 'en' ? 'FR' : 'EN'; }
    applyLabels();
    startTyped();
    store.set('lang', lang);
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () { applyLang(lang === 'en' ? 'fr' : 'en'); });
  }

  if (store.get('lang') === 'en') { applyLang('en'); } else { applyLabels(); startTyped(); }

  /* =======================================================
     4. Barre de navigation, progression, haut de page
     ======================================================= */
  var topbar = $('topbar');
  var progress = $('progress');
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (topbar) { topbar.classList.toggle('is-solid', y > 24 || menuOpen); }
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    if (toTop) { toTop.classList.toggle('is-visible', y > 640); }
  }

  function requestScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }

  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* =======================================================
     5. Menu mobile
     ======================================================= */
  var menu = $('menu');

  function setMenu(open) {
    if (!menu || !burger) { return; }
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    applyLabels();
    onScroll();
  }

  if (menu && burger) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(!menuOpen);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setMenu(false); }
    });
    document.addEventListener('click', function (e) {
      if (menuOpen && !e.target.closest('#menu') && !e.target.closest('#burger')) { setMenu(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', function () {
      if (menuOpen && window.innerWidth > 1180) { setMenu(false); }
    });
  }

  /* =======================================================
     6. Lien actif selon la section visible
     ======================================================= */
  if (menu && 'IntersectionObserver' in window) {
    var links = menu.querySelectorAll('a[href^="#"]');
    var linkFor = {};
    each(links, function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });

    var watched = Object.keys(linkFor).map(function (id) { return $(id); }).filter(Boolean);
    var hero = $('accueil');
    if (hero) { watched.push(hero); }

    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        each(links, function (a) { a.classList.remove('is-active'); });
        var link = linkFor[entry.target.id];
        if (link) { link.classList.add('is-active'); }
      });
    }, { rootMargin: '-45% 0px -54% 0px', threshold: 0 });

    watched.forEach(function (section) { navObserver.observe(section); });
  }

  /* =======================================================
     7. Filtres de projets
     ======================================================= */
  var filters = document.querySelectorAll('.filter');
  var cards = document.querySelectorAll('.project-card');

  each(filters, function (btn) {
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
    btn.addEventListener('click', function () {
      each(filters, function (f) { f.classList.remove('is-active'); f.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');

      var cat = btn.getAttribute('data-filter');
      each(cards, function (card) {
        var show = cat === 'all' || card.getAttribute('data-cat') === cat;
        card.hidden = !show;
        if (show && !reduceMotion) {
          card.classList.remove('pop');
          void card.offsetWidth;
          card.classList.add('pop');
        }
      });
    });
  });

  /* =======================================================
     8. Copier email / téléphone
     ======================================================= */
  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { if (document.execCommand('copy')) { resolve(); } else { reject(); } }
      catch (err) { reject(err); }
      document.body.removeChild(area);
    });
  }

  each(document.querySelectorAll('.copy-btn[data-copy]'), function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      var icon = btn.querySelector('use');
      copyText(value).then(function () {
        btn.classList.add('is-done');
        if (icon) { icon.setAttribute('href', '#i-check'); }
        toast(t('Copié : ', 'Copied: ') + value);
        setTimeout(function () {
          btn.classList.remove('is-done');
          if (icon) { icon.setAttribute('href', '#i-copy'); }
        }, 1800);
      }, function () {
        toast(t('Copie impossible — sélectionnez le texte.', 'Copy failed — please select the text.'));
      });
    });
  });

  /* =======================================================
     9. Formulaire de contact → messagerie pré-remplie
     ======================================================= */
  var form = $('contactForm');
  var formError = $('formError');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl = $('f-name');
      var emailEl = $('f-email');
      var subjectEl = $('f-subject');
      var messageEl = $('f-message');

      var name = nameEl.value.trim();
      var email = emailEl.value.trim();
      var subject = subjectEl.value.trim();
      var message = messageEl.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !emailOk || !message) {
        if (formError) { formError.hidden = false; }
        (!name ? nameEl : !emailOk ? emailEl : messageEl).focus();
        return;
      }
      if (formError) { formError.hidden = true; }

      var finalSubject = subject || (t('Contact depuis le portfolio — ', 'Portfolio contact — ') + name);
      var body = message + '\n\n— ' + name + '\n' + email;
      window.location.href = 'mailto:mariem.louhichi@esprit.tn'
        + '?subject=' + encodeURIComponent(finalSubject)
        + '&body=' + encodeURIComponent(body);
      toast(t('Ouverture de votre messagerie…', 'Opening your email app…'));
    });
  }

  /* =======================================================
     10. Apparition au défilement
     (les éléments visibles au chargement restent en place)
     ======================================================= */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var selector = '.sec-head, .about-text, .info-card, .skill-card, .feature, .filters, '
                 + '.project-card, .tl-item, .edu-card, .cert-card, .contact-info, .contact-form';

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var el = entry.target;
        revealObserver.unobserve(el);
        el.classList.add('is-in');

        var finished = false;
        var cleanup = function (ev) {
          if (finished || (ev && ev.target !== el)) { return; }
          finished = true;
          el.classList.remove('reveal', 'is-in');
          el.style.transitionDelay = '';
          el.removeEventListener('transitionend', cleanup);
        };
        el.addEventListener('transitionend', cleanup);
        setTimeout(cleanup, 1500);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    var limit = window.innerHeight * 0.92;
    each(document.querySelectorAll(selector), function (el) {
      if (el.getBoundingClientRect().top < limit) { return; }
      var index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = (index % 3) * 90 + 'ms';
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  /* =======================================================
     11. Année du pied de page
     ======================================================= */
  var year = $('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
