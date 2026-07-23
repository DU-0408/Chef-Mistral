"""
AI recipe generation using HuggingFace Inference API.
Calls Qwen2.5-7B-Instruct via the huggingface_hub InferenceClient.
"""

import os
import asyncio
import logging
import base64
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


def _sync_get_recipe(ingredients_string: str, dietary_restrictions: str | None = None) -> str:
    """Synchronous recipe generation — run in a thread pool."""
    system_prompt = SYSTEM_PROMPT
    if dietary_restrictions:
        system_prompt += f"\n\nIMPORTANT DIETARY RESTRICTIONS: The user has the following dietary restrictions: {dietary_restrictions}. You MUST strictly adhere to these restrictions when suggesting ingredients and recipes."

    response = client.chat_completion(
        model=MODEL_ID,
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"I have {ingredients_string}. Please give me a recipe you'd recommend I make!",
            },
        ],
        max_tokens=1024,
    )
    return response.choices[0].message.content


async def get_recipe(ingredients: list[str], dietary_restrictions: str | None = None) -> str:
    """
    Generate a recipe suggestion from the given list of ingredients.
    Runs the synchronous HuggingFace client call in a thread pool
    to avoid blocking the async event loop.
    """
    ingredients_string = ", ".join(ingredients)

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, partial(_sync_get_recipe, ingredients_string, dietary_restrictions)
        )
        return result
    except Exception as e:
        logger.error(f"Recipe generation failed: {e}", exc_info=True)
        raise Exception(f"Failed to generate recipe: {str(e)}")


def _sync_generate_recipe_image(prompt: str) -> str:
    """Synchronous image generation — run in a thread pool."""
    # We will use SDXL
    image = client.text_to_image(prompt, model="stabilityai/stable-diffusion-xl-base-1.0")
    # image is a PIL Image
    from io import BytesIO
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{img_str}"


async def generate_recipe_image(prompt: str) -> str:
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, partial(_sync_generate_recipe_image, prompt)
        )
        return result
    except Exception as e:
        logger.error(f"Image generation failed: {e}", exc_info=True)
        raise Exception(f"Failed to generate image: {str(e)}")
