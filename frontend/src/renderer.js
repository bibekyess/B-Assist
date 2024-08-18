const { ipcRenderer } = require('electron');

document.getElementById('fixButton').addEventListener('click', () => {
  ipcRenderer.send('fix-text');
});

document.getElementById('translateButton').addEventListener('click', () => {
  ipcRenderer.send('translate-text');
});