const {
    abort,
    run,
    chat,
    stop,
    serve,
  } = require('../backend/ollama/server.js');
  global.AbortController = require('abort-controller');

  async function main() {
  
    // const model = "qwen2:0.5b-instruct-q8_0"
    // try {
    //   // Start Ollama server
    //   const serveType = await serve();
    //   console.log(`Ollama server started. Type: ${serveType}`);    
    //   // send an empty message to the model to load it into memory
    //   await run(model, (json) => {
    //     // status will be set if the model is downloading
    //     if (json.status) {
    //       if (json.status.includes("pulling")) {
    //         const percent = Math.round((json.completed / json.total) * 100);
    //         const content = isNaN(percent)
    //           ? "Downloading AI model..."
    //           : `Downloading AI model... ${percent}%`;
    //         console.log("ollama:run", { success: true, content: content });
    //         return;
    //       }
    //       if (json.status.includes("verifying")) {
    //         const content = `Verifying AI model...`;
    //         console.log("ollama:run", { success: true, content: content });
    //         return;
    //       }
    //     }
    //     if (json.done) {
    //       console.log("ollama:run", { success: true, content: json });
    //       return;
    //     }
    //     console.log("ollama:run", { success: true, content: "Initializing..." });
    //   });
    // } catch (err) {
    //   console.log(err);
    //   console.log("ollama:run", { success: false, content: err.message });
    // }
  
    // try {
    //   console.log("Sending prompt to Ollama...");
    //   const prompt = "How are you doing today?"
    //   console.log(prompt);
    //   await chat(model, prompt, (json) => {
    //     // Reply with the content every time we receive data
    //     console.log("chat:reply", { success: true, content: json });
    //   });
    // } catch (err) {
    //   console.log(err);
    //   console.log("chat:reply", { success: false, content: err.message });
    // }
  
    try {
      // Start Ollama server
      const serveType = await serve();
      console.log(`Ollama server started. Type: ${serveType}`);
  
      // Pull the model
      const modelName = "qwen2:0.5b"
      await run(modelName, (part) => {
        console.log('Pull progress:', part);
      });
      console.log(`Model ${modelName} pulled successfully`);
  
      // Perform inference (chat)
      const prompt = 'Tell me a joke about programming';
      await chat(modelName, prompt, (part) => {
        process.stdout.write(part.message.content);
      });
      console.log('\nChat completed');
  
      // Stop the Ollama server (optional)
      await stop();
      console.log('Ollama server stopped');
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  main();
  
  // async function prepareModel(modelName) {
  //   return new Promise((resolve, reject) => {
  //     run(modelName, (part) => {
  //       if (part.status) {
  //         console.log('Model preparation status:', part.status);
  //       } else {
  //         console.log('Model prepared:', part);
  //         resolve();
  //       }
  //     }).catch(reject);
  //   });
  // }
  
  // prepareModel("qwen2:0.5b");