/* Steelbox — rolagem, movimento e interações */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var hasGsap = !!window.gsap;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- rolagem suave ---------- */
  var lenis = null;
  if (!reduced && window.Lenis && hasGsap) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(el, { offset: -10 });
      else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- topo: some ao descer, volta ao subir ---------- */
  var top = document.querySelector('.top');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    top.classList.toggle('solid', y > 40);
    top.classList.toggle('hidden', y > 400 && y > lastY && document.getElementById('menu').hidden);
    lastY = y;
  }
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
    if (hasGsap && !reduced) gsap.from(menu.children, { y: 30, opacity: 0, stagger: 0.05, duration: 0.5, ease: 'power3.out' });
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
  var text = document.querySelector('.voice-text');
  var who = document.querySelector('.voice-who');
  var dotsBox = document.querySelector('.voice-dots');
  var current = -1, timer = null, inView = false, hovering = false;
  var DURATION = 8;

  var dots = reviews.map(function (r, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Avaliação de ' + r.n);
    b.addEventListener('click', function () { show(i); });
    dotsBox.appendChild(b);
    return b;
  });
  document.querySelectorAll('.vbtn').forEach(function (b) {
    b.addEventListener('click', function () { show((current + Number(b.dataset.dir) + reviews.length) % reviews.length); });
  });

  function paint(i) {
    var r = reviews[i];
    text.innerHTML = '“' + r.t.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ') + '”';
    who.innerHTML = '<span class="avatar" aria-hidden="true">' + r.n.charAt(0) + '</span><span><b>' + r.n + '</b>' + r.m + '</span>';
  }
  function runTimer() {
    if (!hasGsap || reduced) return;
    if (timer) timer.kill();
    dots.forEach(function (d) { d.style.setProperty('--p', 0); });
    timer = gsap.fromTo(dots[current], { '--p': 0 }, { '--p': 1, duration: DURATION, ease: 'none', onComplete: function () { show((current + 1) % reviews.length); } });
    if (!inView || hovering) timer.pause();
  }
  function show(i) {
    if (i === current) return;
    dots.forEach(function (d, k) { d.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    var first = current === -1;
    current = i;
    if (!hasGsap || reduced || first) { paint(i); runTimer(); return; }
    gsap.to(text.querySelectorAll('.w'), {
      y: -14, opacity: 0, duration: 0.25, stagger: 0.006, ease: 'power2.in',
      onComplete: function () {
        paint(i);
        gsap.from(text.querySelectorAll('.w'), { y: 18, opacity: 0, duration: 0.6, stagger: 0.014, ease: 'power3.out' });
        gsap.from(who, { opacity: 0, x: -12, duration: 0.5, ease: 'power3.out' });
      }
    });
    runTimer();
  }
  show(0);
  var stage = document.querySelector('.voices-stage');
  stage.addEventListener('mouseenter', function () { hovering = true; if (timer) timer.pause(); });
  stage.addEventListener('mouseleave', function () { hovering = false; if (timer && inView) timer.resume(); });
  new IntersectionObserver(function (es) {
    inView = es[0].isIntersecting;
    if (timer) (inView && !hovering) ? timer.resume() : timer.pause();
  }, { threshold: 0.3 }).observe(stage);

  if (!hasGsap || reduced) return;

  /* ---------- abertura ---------- */
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro.from('.hero-logo', { clipPath: 'inset(0 100% 0 0)', x: -40, duration: 1.2 })
    .from('.hl > span', { yPercent: 110, duration: 1.1, stagger: 0.1 }, '-=0.7')
    .from(['.hero-sub', '.hero-actions', '.hero-rating'], { opacity: 0, y: 20, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, '-=0.7')
    .from('.card-back', { opacity: 0, x: -60, rotateY: 30, duration: 1.4 }, 0.2)
    .from('.card-front', { opacity: 0, y: 80, rotateX: 12, duration: 1.4 }, 0.35)
    .from('.stage-tag', { opacity: 0, x: -30, duration: 1 }, 0.9);

  var mm = gsap.matchMedia();

  mm.add('(min-width: 981px)', function () {
    /* palco em 3D: inclina de leve com o mouse e se abre ao rolar */
    var st = document.querySelector('.stage');
    if (finePointer) {
      var ry = gsap.quickTo(st, 'rotationY', { duration: 1, ease: 'power3.out' });
      var rx = gsap.quickTo(st, 'rotationX', { duration: 1, ease: 'power3.out' });
      window.addEventListener('pointermove', function (e) {
        ry((e.clientX / innerWidth - 0.5) * 10);
        rx(-(e.clientY / innerHeight - 0.5) * 7);
      }, { passive: true });
    }
    gsap.to('.card-back', { z: -220, x: -40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.card-front', { z: 140, y: -40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-text', { y: -60, opacity: 0.3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });

  /* ---------- faixa: anda sozinha e acelera com a rolagem ---------- */
  var belt = document.querySelector('.belt-track');
  var rowW = belt.children[0].offsetWidth;
  var beltX = 0, boost = 0;
  window.addEventListener('resize', function () { rowW = belt.children[0].offsetWidth; });
  ScrollTrigger.create({ trigger: '.belt', start: 'top bottom', end: 'bottom top', onUpdate: function (s) { boost = Math.min(Math.abs(s.getVelocity()) / 120, 14) * (s.direction || 1); } });
  gsap.ticker.add(function (t, dt) {
    beltX -= (1.2 + Math.abs(boost)) * (dt / 16);
    boost *= 0.92;
    if (-beltX >= rowW) beltX += rowW;
    belt.style.transform = 'translate3d(' + beltX + 'px,0,0)';
  });

  /* ---------- por dentro: trilho horizontal com profundidade ---------- */
  mm.add('(min-width: 768px)', function () {
    var track = document.querySelector('.track');
    var shots = gsap.utils.toArray('.shot');
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
    var depth = function () {
      var c = innerWidth / 2;
      shots.forEach(function (s) {
        var b = s.getBoundingClientRect();
        var off = (b.left + b.width / 2 - c) / innerWidth; // -1..1
        gsap.set(s, { rotationY: off * -10, z: -Math.abs(off) * 90 });
      });
    };
    var h = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: '.inside', pin: '.inside-pin', start: 'top top', end: function () { return '+=' + dist(); },
        scrub: 1, invalidateOnRefresh: true,
        onUpdate: function (s) { gsap.set('.rail-progress i', { scaleX: s.progress }); }
      },
      onUpdate: depth
    });
    depth();
    return function () { gsap.set(shots, { clearProps: 'transform' }); };
  });

  /* ---------- ficha técnica: placa em 3D (mantida) ---------- */
  var plate = document.querySelector('.plate');
  gsap.fromTo(plate, { rotateX: 32, rotateZ: -3, y: 70, opacity: 0.4 },
    { rotateX: 0, rotateZ: 0, y: 0, opacity: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '.plate-wrap', start: 'top 95%', end: 'top 40%', scrub: 1 } });
  gsap.from('.plate-rows > div', { opacity: 0, x: 24, stagger: 0.05, duration: 0.6, ease: 'power3.out',
    scrollTrigger: { trigger: '.plate-rows', start: 'top 80%', once: true } });
  if (finePointer) {
    var px = gsap.quickTo(plate, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    var py = gsap.quickTo(plate, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    var wrap = document.querySelector('.plate-wrap');
    wrap.addEventListener('pointermove', function (e) {
      var b = wrap.getBoundingClientRect();
      var x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      px(x * 12); py(-y * 8);
      plate.style.backgroundPosition = (50 - x * 90) + '% 0, 0 0, 0 0';
    });
    wrap.addEventListener('pointerleave', function () { px(0); py(0); });
  }

  /* ---------- contadores ---------- */
  document.querySelectorAll('.count').forEach(function (el) {
    var to = parseFloat(el.dataset.to), dec = to % 1 ? 1 : 0, o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = o.v.toFixed(dec).replace('.', ','); },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* ---------- unidades ---------- */
  gsap.utils.toArray('.unit').forEach(function (u, i) {
    gsap.from(u.querySelector('.unit-media img'), { y: 80, rotateX: 14, opacity: 0, duration: 1.2, ease: 'expo.out', delay: i * 0.1,
      scrollTrigger: { trigger: u, start: 'top 82%', once: true } });
    gsap.from(u.querySelectorAll('.unit-body > *'), { y: 24, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out', delay: 0.2 + i * 0.1,
      scrollTrigger: { trigger: u, start: 'top 82%', once: true } });
  });
  if (finePointer) {
    document.querySelectorAll('.tilt').forEach(function (t) {
      var img = t.querySelector('img');
      t.addEventListener('pointermove', function (e) {
        var b = t.getBoundingClientRect();
        var x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
        gsap.to(img, { rotationY: x * 10, rotationX: -y * 8, duration: 0.6, ease: 'power3.out' });
      });
      t.addEventListener('pointerleave', function () { gsap.to(img, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out' }); });
    });
  }

  /* ---------- final ---------- */
  gsap.from('.finale-mark', { x: -120, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.finale', start: 'top 75%', once: true } });
  gsap.from('.finale-title', { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', delay: 0.1, scrollTrigger: { trigger: '.finale', start: 'top 75%', once: true } });
  gsap.from('.finale .btn', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: 0.25, scrollTrigger: { trigger: '.finale', start: 'top 75%', once: true } });

  /* ---------- botões magnéticos ---------- */
  if (finePointer) {
    document.querySelectorAll('.magnetic').forEach(function (m) {
      var xTo = gsap.quickTo(m, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      var yTo = gsap.quickTo(m, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
      m.addEventListener('pointermove', function (e) {
        var b = m.getBoundingClientRect();
        xTo((e.clientX - b.left - b.width / 2) * 0.25);
        yTo((e.clientY - b.top - b.height / 2) * 0.35);
      });
      m.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
