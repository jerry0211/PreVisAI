const tabs = document.querySelectorAll('.toggle button');
const nameField = document.getElementById('nameField');
const cta = document.getElementById('cta').querySelector('span');
tabs.forEach(b => b.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  const signup = b.dataset.mode === 'signup';
  nameField.hidden = !signup;
  cta.textContent = signup ? 'ROLL IT!' : 'ACTION!';
}));
document.getElementById('cta').addEventListener('click', () => {
  setTimeout(() => location.href = '../login/index.html', 280);
});
