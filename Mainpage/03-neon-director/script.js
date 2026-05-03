// typewriter
const lines = [
  "> initializing pre-vis pipeline...",
  "> linking sora · runway · higgsfield · kling...",
  "> studio offline — authentication required.",
];
const target = document.getElementById('typed');
let li = 0, ci = 0;
function type() {
  if (li >= lines.length) return;
  const l = lines[li];
  if (ci <= l.length) {
    target.textContent = lines.slice(0, li).join('\n') + (li ? '\n' : '') + l.slice(0, ci);
    ci++;
    setTimeout(type, 28);
  } else {
    li++; ci = 0;
    setTimeout(type, 480);
  }
}
type();

// clock
const clk = document.getElementById('clock');
setInterval(() => {
  const d = new Date();
  clk.textContent = d.toUTCString().slice(17, 25) + ' UTC';
}, 1000);

// tabs
const seg = document.querySelectorAll('.seg button');
const exec = document.getElementById('exec');
const nameField = document.getElementById('nameField');
seg.forEach(b => b.addEventListener('click', () => {
  seg.forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  const signup = b.dataset.mode === 'signup';
  nameField.hidden = !signup;
  exec.textContent = signup ? 'REGISTER' : 'EXECUTE';
}));
exec.addEventListener('click', () => {
  exec.textContent = 'CONNECTING...';
  setTimeout(() => location.href = '../login/index.html', 500);
});
