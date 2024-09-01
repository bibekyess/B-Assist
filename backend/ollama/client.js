const {chat, run, serve, stop} = require('./server.js')
const { logInfo, logErr, logDebug } = require("../logger.js");


async function serveOllama(){
  try {
    await serve();
    console.log('Ollama server started');
  } catch (error) {
    console.error('Failed to start Ollama server:', error);
    throw error;
  }
}

function extractModelName(error) {
  const regex = /model "(.*?)" not found/;
  const match = error.message.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}


modelPullCallbackFn = (json) => {
  // In streaming mode, we can get the status of the model download or initialization
    if (json.status) {
      if (json.status.includes("pulling")) {
        // Calculate download progress percentage
        const percent = Math.round((json.completed / json.total) * 100);
        const content = isNaN(percent)
          ? "Downloading AI model..."
          : `Downloading AI model... ${percent}%`;
        logInfo(content);
        return;
      }
      if (json.status.includes("verifying")) {
        logInfo("Verifying AI model...");
        return;
      }
    }
    
    if (json.done) {
      logInfo("Model loading complete:", json);
      return;
    }

    logInfo("Initializing...");
  }


const FIX_PROMPT_TEMPLATE = `Fix all typos, and grammars like casing and punctuation in this text, but preserve all new line characters:
----------
$TEXT
----------
Return only the corrected text. Don't include a preamble.`;

const TRANSLATE_PROMPT_TEMPLATE = `Translate this text to Korean language, but preserve all new line characters:
----------
$TEXT
----------
Return only the translated text. Don't include a preamble.`;

async function fixText(modelName, text) {
  const prompt = FIX_PROMPT_TEMPLATE.replace('$TEXT', text);
  let fixedText = '';

  console.log(`input text: ${prompt}`)
  try {
    await chat(modelName, prompt, (part) => {
      fixedText += part.message.content;
    });
    console.log(`output text: ${fixedText}`)
  } catch (error) {
    console.error('An Error occured when chatting:', error);

    const modelName = extractModelName(error);
    if (modelName) {
        console.log(`Model name extracted from error message: ${modelName}`);
        try {
          await run(modelName, modelPullCallbackFn );
        } catch (err) {
          logErr("An Error occurred while running the Ollama model:", err);  // Log any errors that occur
        }

        try {
          await chat(modelName, prompt, (part) => {
            fixedText += part.message.content;
          });
          console.log(`output text: ${fixedText}`)
        } catch (error) {
          console.error('An Error occured when chatting:', error);
        }

    } else {
      console.log(`Unable to pull model ${modelName}. Please turn on internet and TRY AGAIN!`);
    }
  }
  return fixedText.trim();
}

async function translateText(modelName, text) {
  const prompt = TRANSLATE_PROMPT_TEMPLATE.replace('$TEXT', text);
  let translatedText = '';
  try {
    await chat(modelName, prompt, (part) => {
      translatedText += part.message.content;
    });
  } catch (error) {
    console.error('An Error occured when chatting:', error);

    const modelName = extractModelName(error);
    if (modelName) {
        console.log(`Model name extracted from error message: ${modelName}`);
        try {
          await run(modelName, modelPullCallbackFn );
        } catch (err) {
          logErr("An Error occurred while running the Ollama model:", err);  // Log any errors that occur
        }

        try {
          await chat(modelName, prompt, (part) => {
            translatedText += part.message.content;
          });
          console.log(`output text: ${translatedText}`)
        } catch (error) {
          console.error('An Error occured when chatting:', error);
        }

    } else {
      console.log(`Unable to pull model ${modelName}. Please turn on internet and TRY AGAIN!`);
    }
  }
  return translatedText.trim();
}

module.exports = {
    serveOllama,
    fixText,
    translateText
};