import os

from dotenv import load_dotenv

load_dotenv()
SERVER_URL = "localhost"
PORT = 8900
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
