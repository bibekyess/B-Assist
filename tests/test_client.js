
async function main() {
    const modelName = "qwen2:0.5b-instruct-q8_0"
    try {
      // Start Ollama server
      await serve();
      console.log('Ollama server started');
  
      // Test fixText function
      const textToFix = "this is a Test text with som typos and Incorrect capitalization.";
      console.log("\nOriginal text:", textToFix);
      const fixedText = await fixText(chat, modelName, textToFix);
      console.log("Fixed text:", fixedText);
  
      // Test translateText function
      const textToTranslate = "Hello, world! How are you today?";
      console.log("\nOriginal text:", textToTranslate);
      const translatedText = await translateText(chat, modelName, textToTranslate);
      console.log("Translated text:", translatedText);
  
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Stop the Ollama server
      await stop();
      console.log('Ollama server stopped');
    }
  }
  
  main();