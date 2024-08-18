# backend.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from llama_cpp import Llama
from string import Template
import uvicorn
import logging

logger = logging.getLogger(__name__)

app = FastAPI()

llm = Llama.from_pretrained(
    repo_id="Qwen/Qwen2-0.5B-Instruct-GGUF",
    filename="*q8_0.gguf",
    verbose=False
)

FIX_PROMPT_TEMPLATE = Template(
"""Fix all typos, and grammars like casing and punctuation in this text, but preserve all new line characters:

$text

Return only the corrected text. Don't include a preamble.
"""
)

TRANSLATE_PROMPT_TEMPLATE = Template(
"""Translate this text to Korean language, but preserve all new line characters:

$text

Return only the translated text. Don't include a preamble.
"""
)

class TextRequest(BaseModel):
    text: str


def fix_text(text):
    prompt = FIX_PROMPT_TEMPLATE.substitute(text=text)
    output = llm.create_chat_completion(
        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    return output["choices"][0]["message"]["content"].strip()


def translate_text(text):
    prompt = TRANSLATE_PROMPT_TEMPLATE.substitute(text=text)
    output = llm.create_chat_completion(
        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]
    )
    logger.info("Translate prompt: ", prompt)
    return output["choices"][0]["message"]["content"].strip()

@app.post("/fix")
async def fix(request: TextRequest):
    try:
        logger.info("Requested text: ", request.text)
        fixed_text = fix_text(request.text)
        logger.info("Fixed text: ", fixed_text)
        return {"result": fixed_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translate")
async def translate(request: TextRequest):
    try:
        logger.info("Requested text: ", request.text)
        translated_text = translate_text(request.text)
        logger.info("Translated text: ", translated_text)
        return {"result": translated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
    