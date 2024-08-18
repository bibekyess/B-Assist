const { app, BrowserWindow, globalShortcut, ipcMain, screen, clipboard } = require('electron');
const path = require('path');
const axios = require('axios');
const robot = require('robotjs');

let mainWindow;
let selectedText = '';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 150,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.hide();
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('CommandOrControl+Shift+X', () => {

    // Clear the clipboard to avoid reading old contents; VI to prevent processing unrelated contents
    clipboard.writeText('');

    // Simulate copy to get the selected text
    setTimeout(() => {
        robot.keyTap('c', process.platform === 'darwin' ? 'command' : 'control');
    }, 100);
    
    // Small delay to ensure the clipboard has been updated
    setTimeout(() => {
      selectedText = clipboard.readText();
      if (selectedText) {
        const { x, y } = screen.getCursorScreenPoint();
        mainWindow.setPosition(x, y);
        mainWindow.show();
      }
    }, 100);
  });
});

async function processText(action) {
  if (!selectedText) {
    console.log('No text selected');
    mainWindow.hide();
    return;
  }

  // Get the current cursor position before hiding the window
  const { x, y } = screen.getCursorScreenPoint();

  try {
    const response = await axios.post(`http://localhost:5000/${action}`, { text: selectedText });
    const processedText = response.data.result;
    
    // Hide the window before replacing the text
    mainWindow.hide();
    
    console.log(`"processedText: ${processedText}`)

    // Replace the original text with the processed text
    setTimeout(() => {
      
      robot.moveMouse(x, y);
      // Perform a left click to focus on the text area;
      // Very Important, elsewise robotjs cannot find a cursor position to replace the with processed text
      robot.mouseClick();

      setTimeout(() => {
        // Directly type the processed text instead of pasting for streaming look
        robot.typeString(processedText);
      }, 100);
      
    }, 100);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    mainWindow.hide();
  }
}

ipcMain.on('fix-text', () => processText('fix'));
ipcMain.on('translate-text', () => processText('translate'));


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


