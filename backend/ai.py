"""
AI recipe generation using HuggingFace Inference API.
Calls Qwen2.5-7B-Instruct via the huggingface_hub InferenceClient.
"""

import os
import asyncio
import logging
from functools import partial
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

HF_ACCESS_TOKEN = os.getenv("HF_ACCESS_TOKEN", "")

SYSTEM_PROMPT = """
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page.
"""

# Model that supports chat completion on HuggingFace's inference API
MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"

# Initialize the inference client
client = InferenceClient(api_key=HF_ACCESS_TOKEN)


def _sync_get_recipe(ingredients_string: str) -> str:
    """Synchronous recipe generation — run in a thread pool."""
    response = client.chat_completion(
        model=MODEL_ID,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"I have {ingredients_string}. Please give me a recipe you'd recommend I make!",
            },
        ],
        max_tokens=1024,
    )
    return response.choices[0].message.content


async def get_recipe(ingredients: list[str]) -> str:
    """
    Generate a recipe suggestion from the given list of ingredients.
    Runs the synchronous HuggingFace client call in a thread pool
    to avoid blocking the async event loop.
    """
    ingredients_string = ", ".join(ingredients)

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, partial(_sync_get_recipe, ingredients_string)
        )
        return result
    except Exception as e:
        logger.error(f"Recipe generation failed: {e}", exc_info=True)
        raise Exception(f"Failed to generate recipe: {str(e)}")
