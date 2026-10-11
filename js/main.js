const $ = id => document.getElementById(id);
const stage = $('array_container'), sizeIn = $('a_size'), speedIn = $('a_speed');
const genBtn = $('generating'), lastBtn = $('last-array');
const algoBtns = [...document.querySelectorAll('.sorting-algo button')];
const DELAY = [260, 90, 30, 8, 0];            // ms per step; 0 = as fast as possible
const sleep = ms => new Promise(r => setTimeout(r, ms));
const frame = () => new Promise(r => requestAnimationFrame(r));

let arr = [], prev = [], bars = [], hot = [], running = false;

/* ---------- array + bars ---------- */
function paint(i) {
  bars[i].style.height = arr[i] + '%';
  bars[i].style.setProperty('--hue', 190 + arr[i] * 1.5);   // cyan → violet → magenta by value
}
function build(values) {
  arr = values.slice(); bars = []; hot = [];
  stage.innerHTML = '';
  arr.forEach((_, i) => {
    const b = document.createElement('div');
    b.className = 'bar'; stage.appendChild(b); bars.push(b); paint(i);
  });
  resetStats();
}
function generate_array() {
  if (running) return;
  prev = arr.slice();
  build(Array.from({ length: +sizeIn.value }, () => 10 + Math.floor(Math.random() * 90)));
}
function generate_last_array() {
  if (running || !prev.length) return;
  const cur = arr.slice(); sizeIn.value = prev.length; build(prev); prev = cur;
}
genBtn.onclick = generate_array;
lastBtn.onclick = generate_last_array;
sizeIn.oninput = generate_array;

/* ---------- stats ---------- */
let cmp = 0, swp = 0;
function resetStats() { cmp = swp = 0; $('Comparisons').textContent = 0; $('Swaps').textContent = 0; $('Time-diff').textContent = '0 ms'; }
function showStats() { $('Comparisons').textContent = cmp; $('Swaps').textContent = swp; }

/* ---------- one animation step ---------- */
function clearHot() { hot.forEach(i => bars[i] && bars[i].classList.remove('cmp', 'swp', 'piv')); hot = []; }
function spark(i) {
  if (DELAY[speedIn.value - 1] < 8 || Math.random() > 0.6) return;
  const b = bars[i], s = document.createElement('span');
  s.className = 'spark';
  s.style.left = b.offsetLeft + b.offsetWidth / 2 + 'px';
  s.style.top = stage.clientHeight - b.offsetHeight - 6 + 'px';
  s.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px');
  stage.appendChild(s); s.onanimationend = () => s.remove();
}
function step([t, i, j]) {
  if (t !== 'p' && t !== 'd') clearHot();
  if (t === 'c') { cmp++; bars[i].classList.add('cmp'); bars[j].classList.add('cmp'); hot.push(i, j); }
  else if (t === 's') {
    swp++; [arr[i], arr[j]] = [arr[j], arr[i]]; paint(i); paint(j);
    bars[i].classList.add('swp'); bars[j].classList.add('swp'); hot.push(i, j); spark(i); spark(j);
  } else if (t === 'w') { swp++; arr[i] = j; paint(i); bars[i].classList.add('swp'); hot.push(i); spark(i); }
  else if (t === 'p') { bars[i].classList.add('piv'); hot.push(i); }
  else if (t === 'd') bars[i].classList.add('done');
  showStats();
}

/* ---------- run ---------- */
function lock(on) {
  algoBtns.forEach(b => { b.disabled = on; b.classList.toggle('butt_locked', on && !b.classList.contains('butt_selected')); });
  [sizeIn, genBtn, lastBtn].forEach(el => el.disabled = on);   // speed stays live on purpose
}
async function runalgo(name, btn) {
  if (running) return;
  running = true; resetStats(); bars.forEach(b => b.className = 'bar');
  btn.classList.add('butt_selected'); lock(true);
  const S = SORTS[name];
  $('Time_Best').textContent = S.best; $('Time_Average').textContent = S.avg;
  $('Time_Worst').textContent = S.worst; $('Space_Worst').textContent = S.space;

  const steps = [], copy = arr.slice();
  S.run(copy, (t, i, j) => steps.push([t, i, j]));
  const t0 = performance.now();
  for (let n = 0; n < steps.length; n++) {
    step(steps[n]);
    const d = DELAY[speedIn.value - 1];
    if (d) await sleep(d); else if (n % 8 === 0) await frame();
    $('Time-diff').textContent = Math.round(performance.now() - t0) + ' ms';
  }
  clearHot();
  // finale: a ripple of light sweeps across the sorted bars
  bars.forEach((b, i) => { b.classList.add('done', 'wave'); b.style.animationDelay = i * 12 + 'ms'; });
  await sleep(bars.length * 12 + 700);
  bars.forEach(b => { b.classList.remove('wave'); b.style.animationDelay = ''; });
  btn.classList.remove('butt_selected'); lock(false); running = false;
}
algoBtns.forEach(b => b.addEventListener('click', () => runalgo(b.textContent.trim(), b)));

/* ---------- twinkling star background ---------- */
(function stars() {
  const c = $('stars'), x = c.getContext('2d'); let S = [];
  const size = () => {
    c.width = innerWidth; c.height = innerHeight;
    S = Array.from({ length: 110 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 1.4 + .3, p: Math.random() * 6 }));
  };
  size(); addEventListener('resize', size);
  (function draw(t) {
    x.clearRect(0, 0, c.width, c.height);
    S.forEach(s => { x.globalAlpha = .25 + .75 * Math.abs(Math.sin(t / 1200 + s.p)); x.fillStyle = '#fff'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 7); x.fill(); });
    requestAnimationFrame(draw);
  })(0);
})();

generate_array();
