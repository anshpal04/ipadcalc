import base64
from database import Base, engine
from auth_routes import router as auth_router
import uvicorn
from constants import PORT, SERVER_URL
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils import analyze_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
class ImageData(BaseModel):
    image: str
    dict_of_vars: dict


@app.post("/calculate")
async def calculate(data: ImageData):
    try:
        if "," in data.image:
            header, base64_data = data.image.split(",", 1)
        else:
            base64_data = data.image

        image_bytes = base64.b64decode(base64_data)

        analysis_result = analyze_image(image_bytes, data.dict_of_vars)

        return {"status": "success", "data": analysis_result}

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Data normalization failure: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host=SERVER_URL, port=PORT, reload=True)
