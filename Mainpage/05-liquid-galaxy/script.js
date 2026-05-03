// starfield
const c = document.getElementById('stars');
const ctx = c.getContext('2d');
let stars = [];
function size() {
  c.width = innerWidth * devicePixelRatio;
  c.height = innerHeight * devicePixelRatio;
  c.style.width = innerWidth + 'px';
  c.style.height = innerHeight + 'px';
  stars = Array.from({ length: 220 }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    r: Math.random() * 1.6 + 0.3,
    vx: (Math.random() - 0.5) * 0.06,
    vy: (Math.random() - 0.5) * 0.06,
    tw: Math.random() * Math.PI * 2,
  }));
}
size();
addEventListener('resize', size);
function tick() {
  ctx.clearRect(0, 0, c.width, c.height);
  for (const s of stars) {
    s.x += s.vx; s.y += s.vy; s.tw += 0.04;
    if (s.x < 0) s.x = c.width; if (s.x > c.width) s.x = 0;
    if (s.y < 0) s.y = c.height; if (s.y > c.height) s.y = 0;
    const a = 0.5 + 0.5 * Math.sin(s.tw);
    ctx.fillStyle = `rgba(255,255,255,${0.35 + a * 0.55})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(tick);
}
tick();

// tabs
const seg = document.querySelectorAll('.seg button');
const nameField = document.getElementById('nameField');
const enter = document.getElementById('enter');
seg.forEach(b => b.addEventListener('click', () => {
  seg.forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  const signup = b.dataset.mode === 'signup';
  nameField.hidden = !signup;
  enter.textContent = signup ? 'Create studio →' : 'Enter the studio →';
}));
enter.addEventListener('click', () => {
  enter.textContent = 'Opening...';
  setTimeout(() => location.href = '../login/index.html', 380);
});
