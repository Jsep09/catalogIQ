from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.retriever import retrieve_relevant_chunks
from services.llm import stream_answer

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class ChatRequest(BaseModel):
    message: str

    @property
    def validated_message(self):
        return self.message[:500]  # จำกัด 500 ตัวอักษร

@router.post("/api/chat/stream")
@limiter.limit("10/minute")
async def chat_stream(request: Request, body: ChatRequest):
    msg = body.validated_message
    chunks = retrieve_relevant_chunks(msg)
    contexts = [chunk["content"] for chunk in chunks]
    sources = [{"content": c} for c in contexts[:3]]

    return StreamingResponse(
        stream_answer(msg, contexts, sources),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )
