// Menu, cabeçalho ao rolar, animação de entrada e fotos ausentes
(function () {
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.menu-toggle');

  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Esconde da galeria qualquer foto que não carregar
  document.querySelectorAll('.gallery img').forEach(function (img) {
    function hide() { img.closest('figure').classList.add('missing'); }
    if (img.complete && img.naturalWidth === 0) hide();
    img.addEventListener('error', hide);
  });

  var targets = document.querySelectorAll('.section-head, .feature, .gallery figure, .unit, .reviews blockquote, .cta-final > *');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (t, i) {
      t.classList.add('reveal');
      t.style.transitionDelay = (i % 3) * 80 + 'ms';
      io.observe(t);
    });
  }

  document.getElementById('ano').textContent = new Date().getFullYear();
})();
