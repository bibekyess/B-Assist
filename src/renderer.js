

window.ollamaAPI.serveOllama();

document.getElementById('fixButton').addEventListener('click', async () => {
    try {
        // let selectedText = 'dummy';
        // window.ollamaAPI.selectedText((value) => {
        //     console.log(`from outside: ${value}`);
        //     selectedText = value;
        // })
        // console.log(`Selected Text received: ${selectedText}`);
        let fixedText = await window.ollamaAPI.fixText();
        console.log('Fixed text:', fixedText);
        window.ollamaAPI.replaceText(fixedText)
        // ipcRenderer.send('fix-text', fixedText);
    } catch (error) {
        console.error('Error fixing text:', error);
    }
});

document.getElementById('translateButton').addEventListener('click', async () => {
    try {
        let translatedText = await window.ollamaAPI.translateText();
        console.log('Translated text:', translatedText);
        window.ollamaAPI.replaceText(translatedText)
        // ipcRenderer.send('translate-text', translatedText);
    } catch (error) {
        console.error('Error translating text:', error);
    }
});
