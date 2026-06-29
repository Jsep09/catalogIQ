from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, upload

app = FastAPI(title="CatalogIQ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://catalogiq.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(chat.router)

@app.get("/")
def health():
    return {"status": "ok"}
