const { contextBridge, ipcRenderer } = require('electron');

console.log("Executing Preload script!!");

contextBridge.exposeInMainWorld('ollamaAPI', {
    serveOllama: () => ipcRenderer.invoke("ollama:serve"),
    getModel: () => ipcRenderer.invoke("model:get"),
    setModel: (model) => ipcRenderer.send("model:set", model),
    fixText: (text) => {
        console.log("Fixing text:", text);
        return ipcRenderer.invoke("ollama:fix", text);
    },
    translateText: (text) => {
        console.log("Translating text:", text);
        return ipcRenderer.invoke("ollama:translate", text);
    },
    replaceText: (text) => {
        return ipcRenderer.send("replace-text", text);
    },
    // selectedText: (callback) => ipcRenderer.on('selected-text', (_event, value) => callback(value)),
});

contextBridge.exposeInMainWorld('electronAPI', {
    onSelectedText: (callback) => ipcRenderer.on('selectedText', callback),
    send: (channel, data) => ipcRenderer.send(channel, data)
});

console.log("Preload script execution finished");
