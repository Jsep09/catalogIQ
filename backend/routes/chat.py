from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.retriever import retrieve_relevant_chunks
from services.llm import stream_answer

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    chunks = retrieve_relevant_chunks(request.message)
    contexts = [chunk["content"] for chunk in chunks]
    sources = [{"content": c} for c in contexts[:3]]

    return StreamingResponse(
        stream_answer(request.message, contexts, sources),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )
