import './index.css';

console.log(window.rats);

document.getElementById('minimize')?.addEventListener('click', () => {
  window.electronAPI.minimize();
});

document.getElementById('maximize')?.addEventListener('click', () => {
  window.electronAPI.maximize();
});

document.getElementById('close')?.addEventListener('click', () => {
  window.electronAPI.close();
});