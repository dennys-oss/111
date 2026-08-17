/* plain 主题交互脚本 */
(function () {
  'use strict';

  /* 回到顶部 */
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      backToTop.classList.toggle('visible', y > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* 移动端导航 */
  var header = document.getElementById('site-header');
  var navToggle = document.querySelector('.nav-toggle');
  if (header && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    header.querySelectorAll('.site-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* 代码复制 */
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, function () {
        fallbackCopy(text);
        onDone();
      });
    } else {
      fallbackCopy(text);
      onDone();
    }
  }

  document.querySelectorAll('.post-content pre').forEach(function (pre) {
    if (pre.closest('.gutter')) return;
    var wrap = pre.closest('figure.highlight') || pre;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '复制';
    btn.setAttribute('aria-label', '复制代码到剪贴板');
    wrap.appendChild(btn);
    btn.addEventListener('click', function () {
      var code = wrap.querySelector('.code pre, pre code') || pre;
      copyText(code ? code.innerText : pre.innerText, function () {
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = '复制'; }, 1600);
      });
    });
  });
})();