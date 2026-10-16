/* Steelbox — interações, rolagem e movimento */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var hasGsap = !!window.gsap;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- rolagem suave ---------- */
  var lenis = null;
  if (!reduced && window.Lenis && hasGsap) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      var el = id.length > 1 && document.querySelector(id);
      if (!el && id !== '#topo') return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(id === '#topo' ? 0 : el, { offset: -10 });
      else (el || document.body).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- topo e menu ---------- */
  var top = document.querySelector('.top');
  function onScroll() { top.classList.toggle('solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true;
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', function () {
    if (!menu.hidden) return closeMenu();
    menu.hidden = false;
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    if (lenis) lenis.stop();
    if (hasGsap && !reduced) gsap.from(menu.children, { yPercent: 60, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out' });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- avaliações reais do Google ---------- */
  var reviews = [
    { n: 'Roberta R.', m: 'Local Guide · cliente desde a inauguração', t: 'Lugar muito amplo, ar-condicionado central, variedade de equipamentos excelente. Equipe sempre disposta a ajudar e orientar. Academia nota 10.' },
    { n: 'Anne E.', m: 'Avaliação no Google', t: 'Melhor academia da região! Equipamentos novos, ambiente limpo e organizado. Os professores são atenciosos e sempre corrigem a execução.' },
    { n: 'Jessica M.', m: 'Local Guide', t: 'Toda estrutura maravilhosa. E os instrutores??? Sou suspeita pra falar, amo demais a Luciana e o Shavio, que me ajudam tanto e deixam todos os treinos mais leves.' },
    { n: 'Alessandro R.', m: 'Local Guide', t: 'Academia sensacional, bem ampla e completa de aparelhos. Tem espaço kids, sala de aulas coletivas, banheiros e vestiários. Super indico.' },
    { n: 'Marta', m: 'Avaliação no Google', t: 'Equipamentos super modernos e professores com muita atenção, principalmente com pessoas de mais idade. Lugar aconchegante e amplo.' },
    { n: 'Valdir D.', m: 'Local Guide', t: 'Pra quem busca uma academia top, com equipamentos de última geração, esse é o local! Profissionais preparados e muito bem capacitados.' },
    { n: 'Tétellyn O.', m: 'Avaliação no Google', t: 'A limpeza do ambiente é impecável e o lugar é super aconchegante, com equipamentos e espaços sempre organizados.' },
    { n: 'Ana Claudia P.', m: 'Avaliação no Google', t: 'Estrutura completa, equipamentos de alta qualidade e um atendimento que faz toda a diferença. Recomendo muito.' }
  ];
  var list = document.querySelector('.voice-list');
  var text = document.querySelector('.voice-text');
  var who = document.querySelector('.voice-who');
  var bar = document.querySelector('.voice-bar i');
  var current = -1, barTween = null, inView = false, hovering = false;

  reviews.forEach(function (r, i) {
    var li = document.createElement('li');
    li.setAttribute('role', 'presentation');
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.innerHTML = r.n + '<span>' + String(i + 1) + '/' + reviews.length + '</span>';
    b.addEventListener('click', function () { showReview(i, true); });
    li.appendChild(b);
    list.appendChild(li);
  });
  var buttons = list.querySelectorAll('button');

  function wordsOf(s) {
    return s.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  }
  function paint(i) {
    var r = reviews[i];
    text.innerHTML = '“' + wordsOf(r.t) + '”';
    who.innerHTML = '<span class="avatar" aria-hidden="true">' + r.n.charAt(0) + '</span><span><b>' + r.n + '</b>' + r.m + '</span>';
  }
  function runBar() {
    if (!hasGsap || reduced) return;
    if (barTween) barTween.kill();
    barTween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 8, ease: 'none', onComplete: function () { showReview((current + 1) % reviews.length); } });
    if (!inView || hovering) barTween.pause();
  }
  function showReview(i, user) {
    if (i === current) return;
    buttons.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    if (user && buttons[i].scrollIntoView && window.innerWidth < 640) buttons[i].scrollIntoView({ inline: 'center', block: 'nearest' });
    var first = current === -1;
    current = i;
    if (!hasGsap || reduced || first) { paint(i); runBar(); return; }
    gsap.to(text.querySelectorAll('.w'), {
      yPercent: -40, opacity: 0, duration: 0.3, stagger: 0.008, ease: 'power2.in',
      onComplete: function () {
        paint(i);
        gsap.from(text.querySelectorAll('.w'), { yPercent: 60, opacity: 0, rotateX: -50, duration: 0.7, stagger: 0.018, ease: 'power3.out' });
        gsap.from(who, { opacity: 0, x: -14, duration: 0.6, ease: 'power3.out' });
      }
    });
    runBar();
  }
  showReview(0);
  var stage = document.querySelector('.voices-stage');
  stage.addEventListener('mouseenter', function () { hovering = true; if (barTween) barTween.pause(); });
  stage.addEventListener('mouseleave', function () { hovering = false; if (barTween && inView) barTween.resume(); });
  new IntersectionObserver(function (es) {
    inView = es[0].isIntersecting;
    if (barTween) inView && !hovering ? barTween.resume() : barTween.pause();
  }, { threshold: 0.35 }).observe(stage);

  /* ---------- contadores ---------- */
  document.querySelectorAll('.count').forEach(function (el) {
    var to = parseFloat(el.dataset.to), dec = to % 1 ? 1 : 0;
    function set(v) { el.textContent = v.toFixed(dec).replace('.', ','); }
    if (!hasGsap || reduced) return set(to);
    var o = { v: 0 };
    gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: function () { set(o.v); },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  if (!hasGsap || reduced) return;

  /* ---------- abertura do hero ---------- */
  var heroWords = document.querySelectorAll('.hero-title .word');
  gsap.set(heroWords, { yPercent: 115 });
  gsap.set(['.hero-sub', '.hero-actions', '.hero-foot'], { opacity: 0, y: 24 });
  var intro = gsap.timeline({ delay: 1.1 });
  intro.to(heroWords, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' })
    .fromTo('.hero-title .line + .line .word', { backgroundPosition: '0% 0' }, { backgroundPosition: '100% 0', duration: 2.6, ease: 'power2.inOut' }, '-=0.8')
    .to(['.hero-sub', '.hero-actions', '.hero-foot'], { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, '-=2.1');

  gsap.to('.hero-copy', { yPercent: -18, opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-photo', { yPercent: 18, scale: 1.08, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- manifesto: palavras acendem com a rolagem ---------- */
  var fill = document.querySelector('.fill-text');
  fill.innerHTML = fill.textContent.trim().split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  var fw = fill.querySelectorAll('.w');
  ScrollTrigger.create({
    trigger: fill, start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: function (s) {
      var n = Math.round(s.progress * fw.length);
      fw.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    }
  });

  /* ---------- por dentro: galeria horizontal ---------- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', function () {
    var track = document.querySelector('.track');
    var dist = function () { return track.scrollWidth - window.innerWidth; };
    var h = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '.inside', pin: '.inside-pin', start: 'top top', end: function () { return '+=' + dist(); }, scrub: 1, invalidateOnRefresh: true }
    });
    document.querySelectorAll('.frame img').forEach(function (img) {
      gsap.fromTo(img, { xPercent: -6, scale: 1.16 }, { xPercent: 6, scale: 1.16, ease: 'none',
        scrollTrigger: { trigger: img.parentNode, containerAnimation: h, start: 'left right', end: 'right left', scrub: true } });
    });
    document.querySelectorAll('.shot').forEach(function (s) {
      gsap.from(s.querySelector('.frame'), { clipPath: 'inset(12% 0 12% 0)', ease: 'none',
        scrollTrigger: { trigger: s, containerAnimation: h, start: 'left 95%', end: 'left 55%', scrub: true } });
    });
  });

  /* ---------- ficha técnica: placa em 3D ---------- */
  var plate = document.querySelector('.plate');
  gsap.fromTo(plate, { rotateX: 38, rotateZ: -4, y: 80, opacity: 0.4 },
    { rotateX: 0, rotateZ: 0, y: 0, opacity: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '.plate-wrap', start: 'top 95%', end: 'top 35%', scrub: 1 } });
  gsap.from('.plate-rows > div', { opacity: 0, x: 24, stagger: 0.05, duration: 0.6, ease: 'power3.out',
    scrollTrigger: { trigger: '.plate-rows', start: 'top 75%', once: true } });
  if (finePointer) {
    var rx = gsap.quickTo(plate, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    var ry = gsap.quickTo(plate, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    var wrap = document.querySelector('.plate-wrap');
    wrap.addEventListener('pointermove', function (e) {
      var b = wrap.getBoundingClientRect();
      var px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
      rx(px * 14); ry(-py * 10);
      plate.style.backgroundPosition = (50 - px * 90) + '% 0, 0 0, 0 0';
    });
    wrap.addEventListener('pointerleave', function () { rx(0); ry(0); });
  }

  /* ---------- unidades ---------- */
  document.querySelectorAll('.unit').forEach(function (u) {
    gsap.from(u.querySelector('.unit-media img'), { scale: 1.25, ease: 'none',
      scrollTrigger: { trigger: u, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from(u.querySelector('h3'), { yPercent: 60, opacity: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: u, start: 'top 70%', once: true } });
  });
  if (finePointer) {
    document.querySelectorAll('.tilt').forEach(function (t) {
      var img = t.querySelector('img');
      t.addEventListener('pointermove', function (e) {
        var b = t.getBoundingClientRect();
        var px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
        gsap.to(img, { rotationY: px * 8, rotationX: -py * 6, scale: 1.06, duration: 0.6, ease: 'power3.out', transformPerspective: 900 });
      });
      t.addEventListener('pointerleave', function () { gsap.to(img, { rotationY: 0, rotationX: 0, scale: 1, duration: 0.8, ease: 'power3.out' }); });
    });
  }

  /* ---------- final: o aço preenche as letras ---------- */
  document.querySelectorAll('.finale-word span').forEach(function (s, i) {
    gsap.fromTo(s, { '--fill': '0%' }, { '--fill': '100%', ease: 'none',
      scrollTrigger: { trigger: '.finale', start: 'top ' + (70 - i * 15) + '%', end: 'center ' + (60 - i * 10) + '%', scrub: true } });
  });
  gsap.from('.finale .btn', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.finale .btn', start: 'top 90%', once: true } });

  /* ---------- botões magnéticos ---------- */
  if (finePointer) {
    document.querySelectorAll('.magnetic').forEach(function (m) {
      var xTo = gsap.quickTo(m, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      var yTo = gsap.quickTo(m, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      m.addEventListener('pointermove', function (e) {
        var b = m.getBoundingClientRect();
        xTo((e.clientX - b.left - b.width / 2) * 0.3);
        yTo((e.clientY - b.top - b.height / 2) * 0.4);
      });
      m.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
