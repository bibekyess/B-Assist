const {chat, serve, stop} = require('./server.js')


// let model = "qwen2:0.5b-instruct-q8_0"

// async function setModel(event, msg) {
//     model = msg;
//   }
  
// async function getModel(event) {
//     event.reply("model:get", { success: true, content: model });
// }


async function serveOllama(){
  try {
    await serve();
    console.log('Ollama server started');
  } catch (error) {
    console.error('Failed to start Ollama server:', error);
    throw error;
  }
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
  await chat(modelName, prompt, (part) => {
    fixedText += part.message.content;
  });
  console.log(`output text: ${fixedText}`)
  return fixedText.trim();
}

async function translateText(modelName, text) {
  const prompt = TRANSLATE_PROMPT_TEMPLATE.replace('$TEXT', text);
  let translatedText = '';

  await chat(modelName, prompt, (part) => {
    translatedText += part.message.content;
  });

  console.log("Translate prompt:", prompt);
  return translatedText.trim();
}

module.exports = {
    serveOllama,
    // getModel,
    // setModel,
    fixText,
    translateText
};