const { app, BrowserWindow, globalShortcut, ipcMain, screen, clipboard, session } = require('electron');
const path = require('path');
const robot = require('robotjs');
const {
  serveOllama,
  fixText,
  translateText,
} = require("./backend/ollama/client.js")

global.AbortController = require('abort-controller');

global.modelName = "qwen2:0.5b-instruct-q8_0"

let mainWindow;
let selectedText = '';
const CLIPBOARD_DELAY = 500; // In ms; DELAY is needed to ensure the clipboard has been updated
const EMPTY_CLIPBOARD_PLACEHOLDER = 'EMPTY';
// Current assumption is that user put mouse on the editor where they want their texts to be replaced
let cursor_x = 0;
let cursor_y = 0;


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 150,
    // width: 800, // For DEBUGGING
    // height: 600, // For DEBUGGING
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'),
      nodeIntegration: false, // FIXME
      contextIsolation: true, // FIXME
    },
  });

  console.log(`preload path: ${ path.join(__dirname, 'src/preload.js')}`)
  mainWindow.loadFile('./src/index.html');
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true);
  // mainWindow.webContents.openDevTools(); // For DEBUGGING
  mainWindow.hide();
}

app.whenReady().then(() => {

  // Handle the IPC between main and renderer processes based on signals
  ipcMain.handle('ollama:serve', async (event) => {
    try {
      serveOllama();
    } catch (error) {
      console.error('Error starting Ollama:', error);
      throw error;
    }
  })
  ipcMain.handle('ollama:fix', async (event) => {
    try {
        let fixedText = await fixText(global.modelName, selectedText);
        return fixedText;
    } catch (error) {
        console.error('Error fixing text:', error);
        throw error;
    }
  });
  ipcMain.handle('ollama:translate', async (event) => {
      try {
          let translatedText = await translateText(global.modelName, selectedText);
          return translatedText;
      } catch (error) {
          console.error('Error translating text:', error);
          throw error;
      }
  });
  
  createWindow();
  
  globalShortcut.register('CommandOrControl+Shift+X', () => {

    console.log("App Shortcut triggered!");

    // Clear the clipboard to avoid reading old contents; VI to prevent processing unrelated contents
    // Works fine without it in Windows // FIXME Needs more checking
    if (process.platform === 'darwin') {
      setTimeout(() => {
        clipboard.writeText(EMPTY_CLIPBOARD_PLACEHOLDER);
      }, CLIPBOARD_DELAY);
    }

    // Simulate copy to get the selected text
    setTimeout(() => {
        robot.keyTap('c', process.platform === 'darwin' ? 'command' : 'control');
    }, CLIPBOARD_DELAY);
    
    setTimeout(() => {
      selectedText = clipboard.readText();
      console.log(`Selected text: ${selectedText}`);
      
      if (selectedText && selectedText !== EMPTY_CLIPBOARD_PLACEHOLDER) {
        const { x, y } = screen.getCursorScreenPoint();
        cursor_x = x;
        cursor_y = y;
        console.log(cursor_x);
        console.log(cursor_y);
        mainWindow.setPosition(cursor_x, cursor_y);
        mainWindow.show();
        // mainWindow.webContents.send('selected-text', selectedText); // Not working for now
      }
    }, CLIPBOARD_DELAY);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

});

async function replaceText(action, processedText) {
  if (!processedText) {
    console.log('No text selected');
    mainWindow.hide();
    return;
  }
  // ({ cursor_x, cursor_y } = screen.getCursorScreenPoint());

  try {
    
    console.log(`"processedText: ${processedText}`)
    
    // Hide the window before replacing the text
    mainWindow.hide();
    
    // Replace the original text with the processed text
    setTimeout(() => {
      
      robot.moveMouse(cursor_x, cursor_y);
      // Perform a left click to focus on the text area;
      // Very Important, elsewise robotjs cannot find a cursor position to replace the with processed text
      robot.mouseClick();
      robot.typeString(processedText);
      // setTimeout(() => {
      //   // Directly type the processed text instead of pasting for streaming look
      //   robot.typeString(processedText);
      // }, CLIPBOARD_DELAY);
      
    }, CLIPBOARD_DELAY);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    mainWindow.hide();
  }
}

ipcMain.on('replace-text', (event, message) => replaceText('replace-text', message));


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


