import os

from dotenv import load_dotenv

load_dotenv()
SERVER_URL = os.getenv("SERVER_URL", "0.0.0.0")
PORT = int(os.getenv("PORT", 8900))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
