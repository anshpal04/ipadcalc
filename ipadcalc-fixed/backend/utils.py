import io
import json

import google.generativeai as genai
from constants import GEMINI_API_KEY
from PIL import Image

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(model_name="gemini-3.1-flash-lite")

CALCULATOR_PROMPT = """
You are an advanced mathematical reasoning engine. You will be given an image containing handwritten math equations, expressions, variables, graphs, or abstract concepts.

Analyze the image carefully and return a JSON array containing objects structured exactly like this:
[
  {
    "expression": "The extracted mathematical formula or question text",
    "result": "The final computed numerical or textual answer",
    "assign": true/false
  }
]

Rules:
1. If the user writes a variable assignment like 'x = 5', solve it, set 'assign' to true, and output the result.
2. If the user draws abstract concepts (e.g., historical references, physical schemas), reason through it logically and output an explanation in the 'result' field.
3. Keep 'expression' as close to standard algebraic notation or clean text as possible.
4. Output raw, clean JSON inside a valid array format. Do not wrap it in markdown code blocks like ```json.
"""


def analyze_image(image_bytes: bytes, dict_of_vars: dict) -> list:
    """
    Decodes raw image bytes, constructs the situational context including current variables,
    and runs inference through Gemini Flash.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))

        context_vars = f"\n\nCurrent active variable states available for calculation: {json.dumps(dict_of_vars)}"
        full_prompt = CALCULATOR_PROMPT + context_vars

        response = model.generate_content([image, full_prompt])

        clean_text = response.text.strip()

        if clean_text.startswith("```json"):
            clean_text = clean_text.replace("```json", "").replace("```", "").strip()
        elif clean_text.startswith("```"):
            clean_text = clean_text.replace("```", "").strip()

        return json.loads(clean_text)

    except Exception as e:
        print(f"Error during Gemini processing: {str(e)}")
        return [
            {
                "expression": "Error",
                "result": f"Inference failed: {str(e)}",
                "assign": False,
            }
        ]
