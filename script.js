// ── Stars background ──
function initStars() {
  const c = document.getElementById('stars');
  if (!c) return;
  const ctx = c.getContext('2d');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  for (let i = 0; i < 160; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * c.width, Math.random() * c.height, Math.random() * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212,168,83,${Math.random() * 0.4 + 0.08})`;
    ctx.fill();
  }
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * c.width, Math.random() * c.height, Math.random() * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3 + 0.05})`;
    ctx.fill();
  }
}

// ── Scroll fade-in ──
function initScrollFade() {
  const els = document.querySelectorAll('.fade-in');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ── Active nav link ──
function initNav() {
  const links = document.querySelectorAll('.nav-links a');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(l => {
    if (l.getAttribute('href') === path) l.classList.add('active');
  });
}

// ── Globe (for index page) ──
function initGlobe() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const wrap = canvas.parentElement;
  const W = wrap.clientWidth, H = wrap.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
  camera.position.z = 2.8;

  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const sun = new THREE.DirectionalLight(0xd4a853, 1.1);
  sun.position.set(-3, 2, 4); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x3a6bb5, 0.4);
  rim.position.set(3, -1, -3); scene.add(rim);

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshPhongMaterial({ color: 0x0d2244, emissive: 0x0a1628, emissiveIntensity: 0.3, shininess: 30, specular: 0x1a3a6a })
  );
  scene.add(globe);

  const lm = new THREE.LineBasicMaterial({ color: 0xd4a853, opacity: 0.18, transparent: true });
  for (let lat = -80; lat <= 80; lat += 20) {
    const pts = [];
    for (let lon = 0; lon <= 360; lon += 2) {
      const phi = (90 - lat) * Math.PI / 180, theta = lon * Math.PI / 180;
      pts.push(new THREE.Vector3(1.001 * Math.sin(phi) * Math.cos(theta), 1.001 * Math.cos(phi), 1.001 * Math.sin(phi) * Math.sin(theta)));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm));
  }
  for (let lon = 0; lon < 360; lon += 20) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 2) {
      const phi = (90 - lat) * Math.PI / 180, theta = lon * Math.PI / 180;
      pts.push(new THREE.Vector3(1.001 * Math.sin(phi) * Math.cos(theta), 1.001 * Math.cos(phi), 1.001 * Math.sin(phi) * Math.sin(theta)));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm));
  }

  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.08, 32, 32), new THREE.MeshPhongMaterial({ color: 0x1a4080, transparent: true, opacity: 0.12, side: THREE.BackSide })));
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), new THREE.MeshPhongMaterial({ color: 0x0a2040, transparent: true, opacity: 0.06, side: THREE.BackSide })));

  const dests = [
    { lat: 51.5, lon: -0.1 }, { lat: 48.8, lon: 2.3 }, { lat: 25.2, lon: 55.3 },
    { lat: -8.4, lon: 115.2 }, { lat: 46.8, lon: 8.2 }, { lat: 35.7, lon: 139.7 },
    { lat: 40.7, lon: -74 }, { lat: -33.9, lon: 151.2 }, { lat: 28.6, lon: 77.2 },
    { lat: -22.9, lon: -43.2 }, { lat: 59.9, lon: 30.3 }, { lat: 1.3, lon: 103.8 }
  ];
  const dg = new THREE.SphereGeometry(0.022, 8, 8);
  const dm = new THREE.MeshBasicMaterial({ color: 0xd4a853 });
  const gm = new THREE.MeshBasicMaterial({ color: 0xd4a853, transparent: true, opacity: 0.3 });
  const gg = new THREE.SphereGeometry(0.04, 8, 8);
  dests.forEach(d => {
    const phi = (90 - d.lat) * Math.PI / 180, theta = d.lon * Math.PI / 180;
    const x = Math.sin(phi) * Math.cos(theta), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(theta);
    const dot = new THREE.Mesh(dg, dm.clone()); dot.position.set(x, y, z); scene.add(dot);
    const glow = new THREE.Mesh(gg, gm.clone()); glow.position.set(x, y, z); scene.add(glow);
  });

  function arc(la1, lo1, la2, lo2, col) {
    const pts = [];
    for (let t = 0; t <= 1; t += 0.02) {
      const la = la1 + (la2 - la1) * t, lo = lo1 + (lo2 - lo1) * t;
      const phi = (90 - la) * Math.PI / 180, theta = lo * Math.PI / 180;
      const r = 1.0 + 0.18 * Math.sin(Math.PI * t);
      pts.push(new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col || 0xd4a853, opacity: 0.45, transparent: true })));
  }
  arc(51.5, -0.1, 25.2, 55.3); arc(25.2, 55.3, -8.4, 115.2);
  arc(40.7, -74, 51.5, -0.1, 0x4488cc); arc(28.6, 77.2, -8.4, 115.2);
  arc(48.8, 2.3, 35.7, 139.7, 0x4488cc);

  let drag = false, px = 0, py = 0, ry = 0, rx = 0, vx = 0, vy = 0;
  canvas.addEventListener('mousedown', e => { drag = true; px = e.clientX; py = e.clientY; vx = vy = 0; });
  window.addEventListener('mouseup', () => { drag = false; });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    vx = (e.clientX - px) * 0.005; vy = (e.clientY - py) * 0.005;
    ry += vx; rx += vy; px = e.clientX; py = e.clientY;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!drag) { vx *= 0.95; vy *= 0.95; ry += vx + 0.002; rx += vy; rx = Math.max(-0.5, Math.min(0.5, rx)); }
    scene.children.forEach(c => { c.rotation.y = ry; c.rotation.x = rx; });
    renderer.render(scene, camera);
  }
  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initScrollFade();
  initNav();
  if (document.getElementById('globeCanvas')) {
    if (typeof THREE !== 'undefined') initGlobe();
    else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
      s.onload = initGlobe;
      document.head.appendChild(s);
    }
  }
});
