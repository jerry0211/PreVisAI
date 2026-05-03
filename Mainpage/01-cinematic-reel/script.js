const seg = document.querySelectorAll('.seg button');
const cta = document.getElementById('cta');
const nameField = document.getElementById('nameField');
seg.forEach(b => b.addEventListener('click', () => {
  seg.forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  const signup = b.dataset.mode === 'signup';
  nameField.hidden = !signup;
  cta.textContent = signup ? 'ROLL CREDITS →' : 'ACTION →';
}));
cta.addEventListener('click', () => {
  cta.style.transform = 'scale(.97)';
  setTimeout(() => location.href = '../login/index.html', 350);
});
