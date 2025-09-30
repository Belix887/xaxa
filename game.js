(function() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let running = true, gameOver = false;
  let score = 0, best = Number(localStorage.getItem('lacetti_best') || '0');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const restartBtn = document.getElementById('restart');
  bestEl.textContent = best.toString();

  const player = { x: W*0.5, y: H-90, w: 44, h: 78, speed: 4.2, vx:0, vy:0 };
  const keys = new Set();
  const cones = []; // obstacles
  const coins = []; // pickups
  const laneMark = []; // road lane markers

  function reset() {
    score = 0; gameOver = false; running = true;
    player.x = W*0.5; player.y = H-90; player.vx = 0; player.vy = 0;
    cones.length = 0; coins.length = 0; laneMark.length = 0;
    for (let i=0;i<10;i++) laneMark.push({ y: i*60 });
  }
  reset();

  window.addEventListener('keydown', (e) => { keys.add(e.key); });
  window.addEventListener('keyup', (e) => { keys.delete(e.key); });
  restartBtn && restartBtn.addEventListener('click', reset);

  function spawn() {
    if (Math.random() < 0.035) {
      const x = 120 + Math.random()*(W-240);
      cones.push({ x, y: -60, w: 32, h: 32, vy: 3.2+Math.random()*1.4 });
    }
    if (Math.random() < 0.025) {
      const x = 120 + Math.random()*(W-240);
      coins.push({ x, y: -40, r: 10, vy: 3.0+Math.random()*1.2, taken:false });
    }
  }

  function update(dt) {
    if (!running) return;
    // Input
    player.vx = 0; player.vy = 0;
    if (keys.has('ArrowLeft') || keys.has('a')) player.vx = -player.speed;
    if (keys.has('ArrowRight') || keys.has('d')) player.vx = player.speed;
    if (keys.has('ArrowUp') || keys.has('w')) player.vy = -player.speed*0.6;
    if (keys.has('ArrowDown') || keys.has('s')) player.vy = player.speed*0.8;
    player.x += player.vx; player.y += player.vy;
    player.x = Math.max(80, Math.min(W-80, player.x));
    player.y = Math.max(60, Math.min(H-90, player.y));

    // Background lane scrolling
    laneMark.forEach(m => { m.y += 5; if (m.y > H) m.y -= (60*10); });

    // Spawn objects
    spawn();

    // Move and collide
    for (let i=cones.length-1;i>=0;i--) {
      const c = cones[i]; c.y += c.vy;
      if (c.y - c.h > H) { cones.splice(i,1); continue; }
      if (rectsOverlap(player.x-22, player.y-39, player.w, player.h, c.x-16, c.y-16, c.w, c.h)) {
        endGame(); return;
      }
    }
    for (let i=coins.length-1;i>=0;i--) {
      const n = coins[i]; n.y += n.vy;
      if (n.y - n.r > H) { coins.splice(i,1); continue; }
      if (!n.taken && circleRectOverlap(n.x, n.y, n.r, player.x-22, player.y-39, player.w, player.h)) {
        n.taken = true; score += 10; coins.splice(i,1);
      }
    }
    score += 0.1; // distance score
    scoreEl.textContent = Math.floor(score).toString();
  }

  function endGame() {
    gameOver = true; running = false;
    if (score > best) { best = Math.floor(score); localStorage.setItem('lacetti_best', String(best)); bestEl.textContent = String(best); }
  }

  function draw() {
    // Road bg
    ctx.fillStyle = '#0b0f14'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#0f141b'; ctx.fillRect(60,0,W-120,H);
    // Lane center
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 4; ctx.setLineDash([28, 22]);
    ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
    // Lane marks
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    laneMark.forEach(m => { ctx.fillRect(90, m.y, W-180, 20); });

    // Player car
    drawCar(player.x, player.y);

    // Cones
    cones.forEach(c => { drawCone(c.x, c.y); });

    // Coins
    coins.forEach(n => { drawCoin(n.x, n.y, n.r); });

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#e8f1f8'; ctx.font = '700 36px Inter, Arial'; ctx.textAlign = 'center';
      ctx.fillText('Столкновение!', W/2, H/2 - 20);
      ctx.font = '400 18px Inter, Arial';
      ctx.fillText('Нажмите «Заново», чтобы попробовать ещё раз', W/2, H/2 + 18);
    }
  }

  function drawCar(x, y) {
    ctx.save();
    ctx.translate(x, y);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 40, 26, 10, 0, 0, Math.PI*2); ctx.fill();
    // body
    const grd = ctx.createLinearGradient(-20, -40, 20, 40);
    grd.addColorStop(0, '#1e89ff');
    grd.addColorStop(1, '#00ffa3');
    ctx.fillStyle = grd; ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    roundRect(-22,-39,44,78,8, true, true);
    // windows
    ctx.fillStyle = 'rgba(10,20,30,0.85)'; roundRect(-18,-30,36,20,4,true,false);
    roundRect(-18,10,36,16,4,true,false);
    // lights
    ctx.fillStyle = '#ffe38a'; ctx.fillRect(-18,-39,10,6); ctx.fillRect(8,-39,10,6);
    ctx.fillStyle = '#ff6b6b'; ctx.fillRect(-18,33,10,6); ctx.fillRect(8,33,10,6);
    ctx.restore();
  }

  function drawCone(x,y) {
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle = '#f97316'; roundRect(-16,-16,32,32,6,true,false);
    ctx.fillStyle = '#fff'; ctx.fillRect(-14,-2,28,6);
    ctx.restore();
  }
  function drawCoin(x,y,r) {
    ctx.save(); ctx.translate(x,y);
    const g = ctx.createRadialGradient(0,0,2,0,0,r);
    g.addColorStop(0, '#fff1a6'); g.addColorStop(1, '#eab308');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }
  function circleRectOverlap(cx, cy, cr, rx, ry, rw, rh) {
    const nearestX = Math.max(rx, Math.min(cx, rx + rw));
    const nearestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nearestX; const dy = cy - nearestY;
    return (dx*dx + dy*dy) <= cr*cr;
  }
  function roundRect(x, y, w, h, r, fill, stroke) {
    if (w < 2*r) r = w/2; if (h < 2*r) r = h/2;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    if (fill) ctx.fill(); if (stroke) ctx.stroke();
  }

  let last = performance.now();
  function loop(t) {
    const dt = Math.min(32, t - last); last = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();


