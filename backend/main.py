import os
import time
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from routes import chat, upload

load_dotenv()

app = FastAPI(title="CatalogIQ")

# Simple in-memory rate limiter (10 req/min per IP)
request_counts: dict = defaultdict(list)

@app.middleware("http")
async def rate_limit(request: Request, call_next):
    if request.url.path == "/api/chat/stream":
        ip = request.client.host
        now = time.time()
        request_counts[ip] = [t for t in request_counts[ip] if now - t < 60]
        if len(request_counts[ip]) >= 10:
            return JSONResponse(status_code=429, content={"detail": "Too many requests"})
        request_counts[ip].append(now)
    return await call_next(request)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.getenv("ENABLE_UPLOAD", "false").lower() == "true":
    app.include_router(upload.router, prefix="/api")

app.include_router(chat.router)

@app.get("/")
def health():
    return {"status": "ok"}
