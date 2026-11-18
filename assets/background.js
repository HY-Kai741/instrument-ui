/* 星轨 + 悬停光斑 + 滚动渐入
   用法：<canvas class="starfield" data-starfield aria-hidden="true"></canvas>
        <div class="bg-nebula"></div><div class="planet"></div><div class="bg-veil"></div>
        <section class="reveal" style="--i:1">…</section>
        <div class="spot">…</div>
*/
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.querySelector("[data-starfield]");
  if (canvas && !reduce) initStars(canvas);

  function initStars(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var stars = [], meteors = [], glowSprites = [];
    var width = 0, height = 0, baseCx = 0, baseCy = 0, cx = 0, cy = 0, maxRadius = 1;
    var raf = 0, lastTime = 0, scrollBoost = 0, lastScrollY = window.scrollY;
    var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    var nextMeteorAt = 0;

    var nebulaSeeds = [
      { x: 0.16, y: 0.24, radius: 0.42, color: [41, 102, 151], alpha: 0.12, phase: 0.4 },
      { x: 0.78, y: 0.16, radius: 0.32, color: [86, 57, 117], alpha: 0.09, phase: 2.1 },
      { x: 0.58, y: 0.84, radius: 0.36, color: [25, 87, 101], alpha: 0.08, phase: 4.2 },
      { x: 0.96, y: 0.72, radius: 0.28, color: [101, 71, 54], alpha: 0.055, phase: 5.3 }
    ];

    function layerSpec(layer) {
      if (layer === 0) return { speed: 0.006, alpha: 0.28, size: 0.46 };
      if (layer === 1) return { speed: 0.018, alpha: 0.56, size: 0.9 };
      return { speed: 0.038, alpha: 0.82, size: 1.45 };
    }

    function makeGlowSprite(inner, outer) {
      var size = 64;
      var sprite = document.createElement("canvas");
      sprite.width = sprite.height = size;
      var sctx = sprite.getContext("2d");
      var g = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, inner);
      g.addColorStop(0.22, inner);
      g.addColorStop(0.62, outer);
      g.addColorStop(1, "rgba(0,0,0,0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, size, size);
      return sprite;
    }

    function prepareGlowSprites() {
      if (glowSprites.length) return;
      glowSprites = [
        makeGlowSprite("rgba(231,248,255,0.9)", "rgba(104,196,241,0.16)"),
        makeGlowSprite("rgba(203,229,255,0.9)", "rgba(84,154,225,0.14)"),
        makeGlowSprite("rgba(255,232,194,0.88)", "rgba(211,142,84,0.11)")
      ];
    }

    function resetStar(star, initial) {
      var roll = Math.random();
      star.layer = roll < 0.62 ? 0 : (roll < 0.92 ? 1 : 2);
      var spec = layerSpec(star.layer);
      star.angle = Math.random() * Math.PI * 2;
      star.radius = initial ? 12 + Math.random() * maxRadius : 8 + Math.random() * 54;
      star.prevRadius = star.radius;
      star.speed = spec.speed * (0.72 + Math.random() * 0.66);
      star.alpha = spec.alpha * (0.72 + Math.random() * 0.42);
      star.size = spec.size * (0.8 + Math.random() * 0.55);
      star.phase = Math.random() * Math.PI * 2;
      star.tint = Math.random();
      star.glow = star.layer > 0 && Math.random() < (star.layer === 2 ? 0.62 : 0.24);
    }

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseCx = width * 0.61;
      baseCy = height * 0.27;
      maxRadius = Math.hypot(width, height) * 0.74;
      var desired = width < 700 ? 150 : (width < 1200 ? 280 : 380);
      while (stars.length < desired) {
        var star = {};
        resetStar(star, true);
        stars.push(star);
      }
      if (stars.length > desired) stars.length = desired;
      stars.forEach(function (s) { if (s.radius > maxRadius) resetStar(s, true); });
      nextMeteorAt = performance.now() + 1800 + Math.random() * 2600;
      prepareGlowSprites();
    }

    function starColor(star, alpha) {
      if (star.tint > 0.955) return "rgba(255,218,174," + alpha.toFixed(3) + ")";
      if (star.tint > 0.74) return "rgba(168,214,255," + alpha.toFixed(3) + ")";
      if (star.tint > 0.48) return "rgba(202,231,255," + alpha.toFixed(3) + ")";
      return "rgba(236,247,255," + alpha.toFixed(3) + ")";
    }

    function drawNebula(seconds) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      nebulaSeeds.forEach(function (seed, index) {
        var driftX = Math.sin(seconds * 0.018 + seed.phase) * width * 0.018;
        var driftY = Math.cos(seconds * 0.014 + seed.phase) * height * 0.012;
        var x = width * seed.x + driftX + pointer.x * (8 + index * 2);
        var y = height * seed.y + driftY + pointer.y * (5 + index * 1.5);
        var radius = Math.max(width, height) * seed.radius;
        var g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        var rgb = seed.color.join(",");
        g.addColorStop(0, "rgba(" + rgb + "," + seed.alpha + ")");
        g.addColorStop(0.34, "rgba(" + rgb + "," + (seed.alpha * 0.52).toFixed(3) + ")");
        g.addColorStop(1, "rgba(" + rgb + ",0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - radius, y - radius * 0.5, radius * 2, radius);
      });
      ctx.restore();
    }

    function spawnMeteor(now) {
      var fromLeft = Math.random() < 0.5;
      var x = fromLeft ? -50 : width + 50;
      var angle = fromLeft ? (0.34 + Math.random() * 0.2) : (Math.PI - 0.54 - Math.random() * 0.2);
      var speed = 560 + Math.random() * 460;
      meteors.push({
        x: x,
        y: height * (0.04 + Math.random() * 0.48),
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        len: 150 + Math.random() * 190,
        life: 0,
        maxLife: 0.68 + Math.random() * 0.42,
        width: 0.9 + Math.random() * 1.2
      });
      nextMeteorAt = now + 3200 + Math.random() * 4600;
    }

    function drawMeteor(m, dt) {
      m.life += dt / 1000;
      m.x += m.dx * dt / 1000;
      m.y += m.dy * dt / 1000;
      if (m.life >= m.maxLife) return false;
      var mag = Math.max(1, Math.hypot(m.dx, m.dy));
      var tailX = m.x - m.dx / mag * m.len;
      var tailY = m.y - m.dy / mag * m.len;
      var strength = Math.sin(Math.PI * m.life / m.maxLife);
      var g = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      g.addColorStop(0, "rgba(235,251,255," + (0.92 * strength).toFixed(3) + ")");
      g.addColorStop(0.14, "rgba(160,229,255," + (0.58 * strength).toFixed(3) + ")");
      g.addColorStop(1, "rgba(85,165,220,0)");
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = g;
      ctx.lineWidth = m.width * 2.6;
      ctx.globalAlpha = 0.18;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = m.width;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(m.x, m.y, 1.4 + m.width, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(242,252,255," + (0.92 * strength).toFixed(3) + ")";
      ctx.fill();
      return m.x > -260 && m.x < width + 260 && m.y > -180 && m.y < height + 180;
    }

    function drawStar(star, seconds, dt) {
      var layerFactor = star.layer === 0 ? 0.66 : (star.layer === 1 ? 1 : 1.42);
      star.prevRadius = star.radius;
      star.radius += star.speed * dt * layerFactor * (1 + star.radius / maxRadius * 1.7) * (1 + scrollBoost * 0.82);
      var ax = Math.cos(star.angle);
      var ay = Math.sin(star.angle) * 0.72;
      var x = cx + ax * star.radius;
      var y = cy + ay * star.radius;
      if (star.radius > maxRadius || x < -90 || x > width + 90 || y < -90 || y > height + 90) {
        resetStar(star, false);
        return;
      }
      var depth = Math.min(1, star.radius / maxRadius);
      var twinkle = star.layer === 0
        ? (0.72 + Math.sin(seconds * 1.8 + star.phase) * 0.28)
        : (0.88 + Math.sin(seconds * 0.9 + star.phase) * 0.12);
      var alpha = Math.min(0.98, star.alpha * twinkle);

      if (star.layer === 0) {
        ctx.beginPath();
        ctx.arc(x, y, star.size + depth * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = starColor(star, alpha);
        ctx.fill();
        return;
      }

      if (star.glow && glowSprites.length) {
        var sprite = glowSprites[star.tint > 0.955 ? 2 : (star.tint > 0.74 ? 1 : 0)];
        var glowSize = 8 + star.size * 8 + depth * 8;
        ctx.globalAlpha = Math.min(0.72, alpha * 0.58);
        ctx.drawImage(sprite, x - glowSize / 2, y - glowSize / 2, glowSize, glowSize);
        ctx.globalAlpha = 1;
      }

      var trail = Math.max(star.prevRadius, star.radius - (1.5 + star.layer * 1.9 + scrollBoost * (6.2 + star.layer * 3.8)));
      var prevX = cx + ax * trail;
      var prevY = cy + ay * trail;

      if (star.layer === 2) {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = starColor(star, alpha * 0.2);
        ctx.lineWidth = star.size * 4.2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = starColor(star, alpha);
      ctx.lineWidth = star.size * (star.layer === 2 ? 1.25 : 0.8);
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, star.size * (0.62 + depth * 0.58), 0, Math.PI * 2);
      ctx.fillStyle = starColor(star, Math.min(0.99, alpha + 0.14));
      ctx.fill();

      if (star.layer === 2) {
        var flare = 4.8 + star.size * 4;
        ctx.strokeStyle = starColor(star, alpha * 0.46);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - flare, y); ctx.lineTo(x + flare, y);
        ctx.moveTo(x, y - flare); ctx.lineTo(x, y + flare);
        ctx.stroke();
      }
    }

    function draw(now) {
      if (document.hidden) { raf = 0; return; }
      var dt = Math.min(48, now - lastTime || 16);
      lastTime = now;
      var seconds = now / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;
      cx = baseCx + pointer.x * 30;
      cy = baseCy + pointer.y * 20;
      ctx.clearRect(0, 0, width, height);
      drawNebula(seconds);
      ctx.globalCompositeOperation = "lighter";
      stars.forEach(function (s) { drawStar(s, seconds, dt); });
      if (now >= nextMeteorAt && meteors.length < 2) spawnMeteor(now);
      meteors = meteors.filter(function (m) { return drawMeteor(m, dt); });
      ctx.globalCompositeOperation = "source-over";
      scrollBoost *= 0.94;
      if (scrollBoost < 0.01) scrollBoost = 0;
      raf = requestAnimationFrame(draw);
    }

    function onScroll() {
      var y = window.scrollY;
      var delta = Math.abs(y - lastScrollY);
      if (delta > 0) scrollBoost = Math.min(3.2, scrollBoost + delta * 0.018 + 0.035);
      lastScrollY = y;
    }

    function onPointerMove(e) {
      pointer.tx = Math.max(-1, Math.min(1, (e.clientX / width - 0.5) * 2));
      pointer.ty = Math.max(-1, Math.min(1, (e.clientY / height - 0.5) * 2));
    }

    function onPointerLeave() { pointer.tx = 0; pointer.ty = 0; }

    function onVisibility() {
      if (!document.hidden && !raf) {
        lastTime = performance.now();
        raf = requestAnimationFrame(draw);
      }
    }

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    lastTime = performance.now();
    raf = requestAnimationFrame(draw);
  }

  /* 光斑坐标：只对 .spot 生效，避免全局开销 */
  if (!reduce) {
    document.addEventListener("pointermove", function (e) {
      var el = e.target.closest && e.target.closest(".spot");
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(2) + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(2) + "%");
    }, { passive: true });
  }

  /* 滚动渐入：进入视口 12% 后触发一次 */
  var targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
  targets.forEach(function (el) { io.observe(el); });
})();
