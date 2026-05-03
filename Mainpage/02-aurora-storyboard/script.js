// tab toggle
const tabs = document.querySelectorAll('.tabs button');
const nameField = document.getElementById('nameField');
const cta = document.getElementById('go');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('on'));
  t.classList.add('on');
  const signup = t.dataset.mode === 'signup';
  nameField.hidden = !signup;
  cta.textContent = signup ? 'Create Studio →' : 'Open Studio →';
}));
cta.addEventListener('click', () => {
  cta.style.transform = 'scale(.97)';
  setTimeout(() => location.href = '../login/index.html', 280);
});

// parallax on cursor
const frames = document.querySelectorAll('.frame');
const blobs = document.querySelectorAll('.blob');
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / innerWidth - 0.5);
  const y = (e.clientY / innerHeight - 0.5);
  frames.forEach((f, i) => {
    const k = (i + 1) * 12;
    f.style.translate = `${x * k}px ${y * k}px`;
  });
  blobs.forEach((b, i) => {
    const k = (i + 1) * 18;
    b.style.translate = `${x * k}px ${y * k}px`;
  });
});
