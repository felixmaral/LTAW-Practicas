const { ipcRenderer } = require('electron');

ipcRenderer.on('versions', (event, versions) => {
  document.getElementById('node-version').textContent = versions.node;
  document.getElementById('electron-version').textContent = versions.electron;
  document.getElementById('chrome-version').textContent = versions.chrome;
  document.getElementById('url').textContent = versions.url;
});

ipcRenderer.on('server-message', (event, message) => {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
});

document.getElementById('test-button').addEventListener('click', () => {
  ipcRenderer.send('test-message');
});
