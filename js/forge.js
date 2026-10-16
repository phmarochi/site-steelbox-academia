/* Emblema SB em 3D: forjado na abertura, esfria nas cores de revenimento do aço */
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const canvas = document.querySelector('.forge');
const hero = document.querySelector('.hero');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 16);

  /* --- geometria do emblema (coordenadas do logo.svg, 120x120) --- */
  const P = (pts) => {
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => (i ? s.lineTo(x - 60, 60 - y) : s.moveTo(x - 60, 60 - y)));
    s.closePath();
    return s;
  };
  const hole = (pts) => {
    const h = new THREE.Path();
    pts.forEach(([x, y], i) => (i ? h.lineTo(x - 60, 60 - y) : h.moveTo(x - 60, 60 - y)));
    h.closePath();
    return h;
  };
  const hex = (r) => [0, 1, 2, 3, 4, 5].map((k) => {
    const a = Math.PI / 2 + (k * Math.PI) / 3;
    return [60 + Math.cos(a) * r, 60 - Math.sin(a) * r];
  });

  const ring = P(hex(56));
  ring.holes.push(hole(hex(49).reverse()));
  const plateShape = P(hex(49));

  const S = P([[30, 40], [60, 40], [54, 49], [40, 49], [38, 52], [56, 52], [48, 73], [24, 73], [30, 64], [44, 64], [46, 60], [28, 60]]);
  const B = P([[62, 40], [86, 40], [94, 48], [88, 56], [94, 64], [86, 73], [52, 73]]);
  B.holes.push(hole([[72, 48], [81, 48], [83, 51], [80, 55], [69, 55]].reverse()));
  B.holes.push(hole([[66, 63], [76, 63], [79, 66], [76, 70], [63, 70]].reverse()));
  const bar = P([[30, 82], [90, 82], [86, 88], [26, 88]]);

  const bevel = { bevelEnabled: true, bevelThickness: 1.4, bevelSize: 1.1, bevelSegments: 4, curveSegments: 1 };
  const geo = (shape, depth, z = 0) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, ...bevel });
    g.translate(0, 0, z - depth / 2);
    return g;
  };

  const steel = new THREE.MeshPhysicalMaterial({ color: 0xcfd8e3, metalness: 1, roughness: 0.22, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.25 });
  const blue = new THREE.MeshPhysicalMaterial({ color: 0x2a6ee6, metalness: 0.85, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 1.2 });
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x18222f, metalness: 0.9, roughness: 0.55, envMapIntensity: 0.6 });
  const mats = [steel, blue, dark];

  const emblem = new THREE.Group();
  emblem.add(new THREE.Mesh(geo(plateShape, 4, -3), dark));
  emblem.add(new THREE.Mesh(geo(ring, 9, 0), steel));
  emblem.add(new THREE.Mesh(geo(S, 9, 2), steel));
  emblem.add(new THREE.Mesh(geo(B, 9, 2), blue));
  emblem.add(new THREE.Mesh(geo(bar, 6, 1), steel));
  emblem.scale.setScalar(0.05);
  const rig = new THREE.Group();
  rig.add(emblem);
  scene.add(rig);

  /* --- luzes: azul do pilar e roxo do revenimento nas bordas --- */
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rimBlue = new THREE.PointLight(0x1e6fd9, 60, 30);
  rimBlue.position.set(-6, 2, 3);
  scene.add(rimBlue);
  const rimViolet = new THREE.PointLight(0x5b4bc4, 50, 30);
  rimViolet.position.set(6, -3, 2);
  scene.add(rimViolet);
  const forgeLight = new THREE.PointLight(0xe9b45a, 0, 18);
  forgeLight.position.set(0, -2, 5);
  scene.add(forgeLight);

  /* --- faíscas --- */
  const N = 700;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const vel = new Float32Array(N * 3), life = new Float32Array(N), maxLife = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3 + 1] = -999; }
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dot = document.createElement('canvas');
  dot.width = dot.height = 64;
  const c2 = dot.getContext('2d');
  const grad = c2.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,220,160,.9)');
  grad.addColorStop(1, 'rgba(255,150,60,0)');
  c2.fillStyle = grad;
  c2.fillRect(0, 0, 64, 64);
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    size: 0.16, map: new THREE.CanvasTexture(dot), vertexColors: true, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
  rig.add(sparks);
  let cursor = 0;
  const spawn = (count, burst) => {
    for (let k = 0; k < count; k++) {
      const i = cursor; cursor = (cursor + 1) % N;
      const a = Math.random() * Math.PI * 2;
      const r = burst ? 0.4 + Math.random() * 2.2 : 1.8 + Math.random() * 1.6;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r * 0.9 - (burst ? 0 : 1.2);
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      const sp = burst ? 4 + Math.random() * 9 : 0.6 + Math.random() * 1.6;
      vel[i * 3] = Math.cos(a) * sp * (burst ? 1 : 0.4) + (Math.random() - 0.5);
      vel[i * 3 + 1] = (burst ? Math.sin(a) * sp + 3 : sp + 1.2);
      vel[i * 3 + 2] = (Math.random() - 0.2) * (burst ? 6 : 1);
      maxLife[i] = life[i] = burst ? 0.6 + Math.random() * 1.1 : 1.4 + Math.random() * 1.8;
    }
  };

  /* --- cores do revenimento: palha → bronze → roxo → azul → aço frio --- */
  const temper = [new THREE.Color(0xffd27a), new THREE.Color(0xe9b45a), new THREE.Color(0xb4532a), new THREE.Color(0x5b4bc4), new THREE.Color(0x1e6fd9), new THREE.Color(0x000000)];
  const heatColor = new THREE.Color();
  const setHeat = (h) => { // h: 1 (incandescente) → 0 (frio)
    const t = (1 - h) * (temper.length - 1);
    const i = Math.min(Math.floor(t), temper.length - 2);
    heatColor.copy(temper[i]).lerp(temper[i + 1], t - i);
    const intensity = Math.pow(h, 0.7) * 2.2;
    mats.forEach((m) => { m.emissive.copy(heatColor); m.emissiveIntensity = intensity; });
    forgeLight.intensity = h * 40;
  };

  /* --- layout responsivo --- */
  let mobile = false;
  const layout = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    mobile = w < 760;
    camera.position.z = mobile ? 21 : 16;
    camera.updateProjectionMatrix();
    rig.position.set(mobile ? 0.9 : Math.min(4.2, (w / h) * 2.3), mobile ? 3.7 : 0.1, 0);
  };
  layout();
  window.addEventListener('resize', layout);

  /* --- interação --- */
  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / window.innerWidth - 0.5;
    pointer.y = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  if (reduced) {
    setHeat(0);
    emblem.rotation.set(0.1, -0.35, 0);
    renderer.render(scene, camera);
    return;
  }

  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);

  const clock = new THREE.Clock();
  let t = 0, emitAcc = 0;
  const FORGE = 3.4; // segundos até esfriar
  spawn(380, true);

  const tick = () => {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    t += dt;

    const p = Math.min(t / FORGE, 1);
    setHeat(1 - p);
    const enter = 1 - Math.pow(1 - Math.min(t / 1.6, 1), 4);
    const scroll = Math.min(window.scrollY / hero.clientHeight, 1);

    const baseScale = (mobile ? 0.032 : 0.044) * (0.6 + 0.4 * enter);
    emblem.scale.setScalar(baseScale * (1 - scroll * 0.25));
    const spin = (1 - enter) * Math.PI * 1.4;
    const ty = pointer.x * 0.7 - 0.28 + Math.sin(t * 0.5) * 0.08 + spin;
    const tx = pointer.y * 0.45 + Math.sin(t * 0.7) * 0.04 + scroll * 0.9;
    emblem.rotation.y += (ty - emblem.rotation.y) * 0.06;
    emblem.rotation.x += (tx - emblem.rotation.x) * 0.06;
    emblem.position.y = Math.sin(t * 1.1) * 0.12 + scroll * 2.4;
    canvas.style.opacity = String(1 - scroll * 0.85);

    rimBlue.position.x = -6 + pointer.x * 4;
    rimViolet.position.y = -3 - pointer.y * 4;

    emitAcc += dt * (p < 1 ? 70 : 18);
    if (emitAcc >= 1) { spawn(Math.floor(emitAcc), false); emitAcc %= 1; }
    for (let i = 0; i < N; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      vel[i * 3 + 1] -= (maxLife[i] < 1.8 ? 9 : -0.3) * dt;
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      const k = Math.max(life[i] / maxLife[i], 0);
      col[i * 3] = k; col[i * 3 + 1] = k * (0.55 + 0.35 * k); col[i * 3 + 2] = k * k * 0.5;
      if (life[i] <= 0) pos[i * 3 + 1] = -999;
    }
    sparkGeo.attributes.position.needsUpdate = true;
    sparkGeo.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  };
  tick();
}

init();
