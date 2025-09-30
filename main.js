/* Preloader logic: load all gallery and hero images, update progress */
(function() {
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const imagePaths = [
    'photo_1_2025-09-30_10-21-07.jpg',
    'photo_2_2025-09-30_10-21-07.jpg',
    'photo_3_2025-09-30_10-21-07.jpg',
    'photo_4_2025-09-30_10-21-07.jpg',
    'photo_5_2025-09-30_10-21-07.jpg',
    'photo_6_2025-09-30_10-21-07.jpg',
    'photo_7_2025-09-30_10-21-07.jpg',
    'photo_8_2025-09-30_10-21-07.jpg',
    'photo_9_2025-09-30_10-21-07.jpg',
    'photo_10_2025-09-30_10-21-07.jpg'
  ];

  let loaded = 0;
  function updateProgress() {
    const pct = Math.round((loaded / imagePaths.length) * 100);
    progressBar.style.width = pct + '%';
    progressText.textContent = pct.toString();
    if (pct >= 100) {
      setTimeout(() => {
        preloader.classList.add('preloader-hide');
        setTimeout(() => preloader.remove(), 700);
      }, 250);
    }
  }
  imagePaths.forEach(src => {
    const img = new Image();
    img.onload = img.onerror = () => { loaded++; updateProgress(); };
    img.src = src;
  });
})();

/* Parallax hero */
(function() {
  const media = document.querySelector('[data-parallax] img');
  if (!media) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY * 0.15;
    media.style.transform = `translateY(${y}px) scale(1.06)`;
  }, { passive: true });
})();

/* Lightbox */
(function() {
  const grid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const prev = document.getElementById('lightbox-prev');
  const next = document.getElementById('lightbox-next');
  const closeBtn = document.getElementById('lightbox-close');
  if (!grid || !lightbox || !lbImg) return;
  const tiles = Array.from(grid.querySelectorAll('.tile'));
  let index = 0;
  function open(i) {
    index = i;
    const src = tiles[index].dataset.src;
    lbImg.src = src;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  function step(delta) {
    index = (index + delta + tiles.length) % tiles.length;
    lbImg.src = tiles[index].dataset.src;
  }
  tiles.forEach((t, i) => t.addEventListener('click', () => open(i)));
  closeBtn && closeBtn.addEventListener('click', close);
  prev && prev.addEventListener('click', () => step(-1));
  next && next.addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
})();

/* Specs counters */
(function() {
  const cards = document.querySelectorAll('.spec-card');
  if (!cards.length) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-counter')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const out = el.querySelector('.spec-value');
        let t0 = 0;
        const duration = 1200;
        function tick(ts) {
          if (!t0) t0 = ts;
          const p = Math.min(1, (ts - t0) / duration);
          const val = (target * p);
          out.textContent = (Math.round(val * 10) / 10).toString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      }
    }
  }, { threshold: 0.4 });
  cards.forEach(c => observer.observe(c));
})();

/* Story timeline reveal */
(function() {
  const items = document.querySelectorAll('.t-item');
  if (!items.length) return;
  const ob = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        ob.unobserve(entry.target);
      }
    }
  }, { threshold: 0.25 });
  items.forEach(i => ob.observe(i));
})();

/* Interactive showcase */
(function() {
  const stageImg = document.getElementById('showcase-img');
  const chips = document.querySelectorAll('.chip');
  const popover = document.getElementById('hotspot-popover');
  const title = document.getElementById('hotspot-title');
  const text = document.getElementById('hotspot-text');
  const stage = document.querySelector('.showcase-stage');
  const thumbs = document.getElementById('showcase-thumbs');
  const prevBtn = document.getElementById('stage-prev');
  const nextBtn = document.getElementById('stage-next');
  const rainCanvas = document.getElementById('rain-canvas');
  const glass = document.getElementById('glass');
  if (!stageImg || !chips.length || !stage) return;

  const filters = {
    none: 'none',
    contrast: 'contrast(1.25) saturate(1.1)',
    warm: 'saturate(1.2) hue-rotate(-10deg)',
    cool: 'saturate(1.1) hue-rotate(12deg)',
    noir: 'grayscale(1) contrast(1.2)'
  };
  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    const f = ch.getAttribute('data-filter');
    stageImg.style.filter = filters[f] || 'none';
  }));

  const hotspots = stage.querySelectorAll('.hotspot');
  hotspots.forEach(h => {
    h.addEventListener('click', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = rect.left + parseFloat(h.style.left) / 100 * rect.width;
      const y = rect.top + parseFloat(h.style.top) / 100 * rect.height;
      title.textContent = h.getAttribute('data-title') || '';
      text.textContent = h.getAttribute('data-text') || '';
      popover.style.left = Math.min(window.innerWidth - 340, Math.max(12, x + 16)) + 'px';
      popover.style.top = Math.min(window.innerHeight - 120, Math.max(12, y - 10)) + 'px';
      popover.classList.add('show');
    });
  });
  window.addEventListener('click', (e) => {
    if (!popover.contains(e.target) && !(e.target.classList && e.target.classList.contains('hotspot'))) {
      popover.classList.remove('show');
    }
  });

  // Photo switching
  const thumbButtons = thumbs ? Array.from(thumbs.querySelectorAll('.thumb')) : [];
  let activeIndex = Math.max(0, thumbButtons.findIndex(t => t.classList.contains('active')));
  function setActiveByIndex(i) {
    if (!thumbButtons.length) return;
    activeIndex = (i + thumbButtons.length) % thumbButtons.length;
    thumbButtons.forEach(b => b.classList.remove('active'));
    const btn = thumbButtons[activeIndex];
    btn.classList.add('active');
    const src = btn.getAttribute('data-src');
    // fade transition
    stageImg.style.opacity = '0';
    const img = new Image();
    img.onload = () => {
      stageImg.src = src;
      stageImg.style.opacity = '1';
      // sweep highlight
      stage.classList.remove('sweep-run');
      void stage.offsetWidth; // restart
      stage.classList.add('sweep-run');
      // glass flash
      if (glass) {
        glass.classList.add('show');
        setTimeout(()=> glass.classList.remove('show'), 260);
      }
    };
    img.src = src;
  }
  thumbButtons.forEach((b, i) => b.addEventListener('click', () => setActiveByIndex(i)));
  prevBtn && prevBtn.addEventListener('click', () => setActiveByIndex(activeIndex - 1));
  nextBtn && nextBtn.addEventListener('click', () => setActiveByIndex(activeIndex + 1));

  // Tilt parallax and flare
  const flare = document.createElement('div');
  flare.className = 'flare';
  stage.appendChild(flare);
  const stageRect = { w: 0, h: 0, l: 0, t: 0 };
  function updateRect() {
    const r = stage.getBoundingClientRect();
    stageRect.w = r.width; stageRect.h = r.height; stageRect.l = r.left; stageRect.t = r.top;
  }
  updateRect();
  window.addEventListener('resize', updateRect);
  stage.addEventListener('mousemove', (e) => {
    const x = (e.clientX - stageRect.l) / stageRect.w - 0.5;
    const y = (e.clientY - stageRect.t) / stageRect.h - 0.5;
    const rx = y * -6; const ry = x * 8;
    stage.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    const fx = e.clientX - stageRect.l; const fy = e.clientY - stageRect.t;
    flare.style.left = `${fx - 60}px`;
    flare.style.top = `${fy - 60}px`;
  });
  stage.addEventListener('mouseleave', () => { stage.style.transform = 'none'; });

  // Ripple on thumbs
  thumbButtons.forEach(b => b.addEventListener('click', (e) => {
    const r = b.getBoundingClientRect();
    const el = document.createElement('span');
    el.className = 'ripple';
    el.style.left = `${e.clientX - r.left}px`;
    el.style.top = `${e.clientY - r.top}px`;
    b.appendChild(el);
    setTimeout(() => el.remove(), 650);
  }));

  // Rain particles (reduced on small screens)
  if (rainCanvas) {
    const ctx = rainCanvas.getContext('2d');
    function resizeCanvas() {
      rainCanvas.width = stage.clientWidth;
      rainCanvas.height = stage.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const isSmall = window.matchMedia('(max-width: 480px)').matches;
    const dropCount = isSmall ? 60 : 120;
    const drops = Array.from({ length: dropCount }, () => ({
      x: Math.random() * rainCanvas.width,
      y: Math.random() * rainCanvas.height,
      l: 8 + Math.random() * 14,
      s: 2 + Math.random() * 3,
      o: 0.2 + Math.random() * 0.6
    }));
    function step() {
      ctx.clearRect(0,0,rainCanvas.width,rainCanvas.height);
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.5)';
      ctx.lineWidth = 1.1;
      ctx.lineCap = 'round';
      for (const d of drops) {
        ctx.globalAlpha = d.o;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.l);
        ctx.stroke();
        d.x -= 1.2 * d.s * 0.2;
        d.y += d.s * 2.2;
        if (d.y > rainCanvas.height + 20) { d.y = -20; d.x = Math.random() * rainCanvas.width; }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();

/* Plate interactive: tilt, scan, and joke */
(function() {
  const card = document.getElementById('plate-card');
  const scanBtn = document.getElementById('scan-btn');
  const scanLine = card ? card.querySelector('.scan-line') : null;
  const luckyBadge = document.getElementById('lucky-badge');
  const joke = document.getElementById('plate-joke');
  if (!card) return;

  card.classList.add('tilt');
  const rectCache = { w: 0, h: 0, l: 0, t: 0 };
  function updateRect() {
    const r = card.getBoundingClientRect();
    rectCache.w = r.width; rectCache.h = r.height; rectCache.l = r.left; rectCache.t = r.top;
  }
  updateRect();
  window.addEventListener('resize', updateRect);
  card.addEventListener('mousemove', (e) => {
    const x = (e.clientX - rectCache.l) / rectCache.w - 0.5;
    const y = (e.clientY - rectCache.t) / rectCache.h - 0.5;
    const rx = y * -8; const ry = x * 14;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = 'rotateX(0deg) rotateY(0deg)'; });

  const jokes = [
    '701 — количество улыбок за поездку. Проверим?',
    'К701СА: Коэффициент харизмы +7.01% подтверждён.',
    'Расшифровка: «К» — красавчик, «701» — скоростной, «СА» — всегда аккуратен.',
    '701 — ровно столько взглядов соберёт сегодня Lacetti.',
    'Номер орёт: «да ну нахуй, как же это красиво едет!»',
    'Газ в пол — и весь мир такой: «ебать, что за ракета?»',
    'К‑701‑СА: «блять, только не тормози у каждого шаурмиста!»',
    'Светофор зелёный — сука, держись, мы стартуем.'
  ];
  function randomJoke() { return jokes[Math.floor(Math.random()*jokes.length)]; }

  function runScan() {
    if (!scanLine) return;
    scanLine.classList.remove('scan-run');
    // restart animation
    // eslint-disable-next-line no-unused-expressions
    void scanLine.offsetWidth;
    scanLine.classList.add('scan-run');
    // Lucky calc: simple checksum
    const digits = [7,0,1,3,2];
    const sum = digits.reduce((a,b)=>a+b,0);
    const lucky = (sum % 2) === 1;
    luckyBadge.textContent = lucky ? 'Сегодня номер прям пиздец какой счастливый! ✨' : 'Сегодня номер с характером — ездим без херни 😎';
    joke.textContent = randomJoke();
  }
  scanBtn && scanBtn.addEventListener('click', runScan);
})();


