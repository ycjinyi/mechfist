// A hidden directional wave field generates foam; only quantized foam pixels are rendered.
(() => {
  const canvas = document.getElementById('ambient-water');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!context) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const foamSteps = 8;
  const maxFoamOpacity = 0.331765;
  // Equal grayscale increments from transparent black background to the brightest foam.
  const tones = Array.from({ length: foamSteps }, (_, level) => level / (foamSteps - 1) * maxFoamOpacity);
  // Different wavelengths, phases and headings share a prevailing upper-right direction.
  const waves = [
    [6.2, .23, -.57, .4], [4.1, .16, -.95, 1.9],
    [2.8, .12, -.23, 4.4], [1.9, .075, -1.18, 2.7],
    [1.2, .04, .05, 5.5], [.85, .02, -.72, .8]
  ].map(([length, amplitude, angle, phase]) => {
    const k = Math.PI * 2 / length;
    return { k, amplitude, x: Math.cos(angle), y: Math.sin(angle), phase, speed: Math.sqrt(k) * .22 };
  });
  let width, height, columns, rows, cell, dot, phases, envelope, breakup, grain;
  let foam, nextFoam, elevation, compression, waveTime = 0, request = 0, lastFrame = 0;

  function hash(x, y) {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
  }
  function noise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    let u = x - ix, v = y - iy;
    u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v);
    return (hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u) * (1 - v)
      + (hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u) * v;
  }
  function smooth(low, high, value) {
    const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
    return t * t * (3 - 2 * t);
  }

  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    cell = Math.ceil(Math.max(7, width / 220, height / 180));
    dot = Math.max(2, Math.floor(cell * .55));
    columns = Math.ceil(width / cell); rows = Math.ceil(height / cell);
    const count = columns * rows;
    phases = new Float32Array(count * waves.length);
    envelope = new Float32Array(count); breakup = new Float32Array(count); grain = new Float32Array(count);
    foam = new Float32Array(count); nextFoam = new Float32Array(count);
    elevation = new Float32Array(count); compression = new Float32Array(count);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const index = y * columns + x, u = x * cell / 125, v = y * cell / 125;
        const warpedU = u + (noise(u * .43, v * .43) - .5) * 1.5;
        const warpedV = v + (noise(u * .38 + 19, v * .38 + 7) - .5) * 1.5;
        waves.forEach((wave, n) => {
          phases[index * waves.length + n] = wave.k * (warpedU * wave.x + warpedV * wave.y) + wave.phase;
        });
        envelope[index] = .65 + .65 * noise(u * .6 + 31, v * .6 + 13);
        breakup[index] = .65 * noise(u * 1.1 + 47, v * 1.1 + 29) + .35 * noise(u * 3.2, v * 3.2);
        grain[index] = hash(x + 71, y + 29);
      }
    }
    step(0);
  }

  function sampleFoam(x, y) {
    if (x < 0 || y < 0 || x >= columns - 1 || y >= rows - 1) return 0;
    const ix = Math.floor(x), iy = Math.floor(y), u = x - ix, v = y - iy;
    const a = iy * columns + ix;
    return (foam[a] * (1 - u) + foam[a + 1] * u) * (1 - v)
      + (foam[a + columns] * (1 - u) + foam[a + columns + 1] * u) * v;
  }

  function step(dt) {
    waveTime = reducedMotion.matches ? 0 : waveTime + dt;
    const decay = Math.exp(-dt * .9);
    const buckets = tones.map(() => []);
    for (let index = 0; index < foam.length; index++) {
      let heightAtPoint = 0, compressionAtPoint = 0;
      for (let n = 0; n < waves.length; n++) {
        const wave = waves[n];
        const crest = Math.sin(phases[index * waves.length + n] - waveTime * wave.speed);
        heightAtPoint += wave.amplitude * crest;
        compressionAtPoint += wave.amplitude * wave.k * crest * 1.6;
      }
      elevation[index] = heightAtPoint * envelope[index];
      compression[index] = compressionAtPoint * envelope[index];
      // Froth appears only where irregular crests become steep/compressed, not over the full wave.
      const threshold = .28 + breakup[index] * .32;
      const source = smooth(threshold, threshold + .7, compression[index])
        * smooth(.005, .18, elevation[index]) * (.7 + .3 * breakup[index]);
      const x = index % columns, y = Math.floor(index / columns);
      const trail = dt ? sampleFoam(x - dt * 1.8, y + dt * 1.2) * decay : 0;
      const value = Math.max(trail, source);
      nextFoam[index] = value;
      // Grain breaks up the foam fringe; intensity is limited to discrete grayscale levels.
      const broken = Math.max(0, value - grain[index] * .16) * (.68 + .32 * grain[index]);
      const level = Math.min(tones.length - 1, Math.floor(broken * tones.length));
      if (level) buckets[level].push(index);
    }
    [foam, nextFoam] = [nextFoam, foam];
    context.clearRect(0, 0, width, height);
    for (let level = 1; level < tones.length; level++) {
      context.fillStyle = `rgba(255,255,255,${tones[level]})`;
      context.beginPath();
      for (const index of buckets[level]) {
        context.rect((index % columns) * cell, Math.floor(index / columns) * cell, dot, dot);
      }
      context.fill();
    }
  }

  function animate(now) {
    if (document.hidden || reducedMotion.matches) { request = 0; return; }
    if (!lastFrame) lastFrame = now;
    if (now - lastFrame >= 80) {
      step(Math.min((now - lastFrame) / 1000, .16));
      lastFrame = now;
    }
    request = requestAnimationFrame(animate);
  }
  function updateMotion() {
    cancelAnimationFrame(request); request = 0; lastFrame = 0;
    if (document.hidden) return;
    step(0);
    if (!reducedMotion.matches) request = requestAnimationFrame(animate);
  }
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);
  resize(); updateMotion();
})();
