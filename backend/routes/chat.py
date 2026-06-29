from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.retriever import retrieve_relevant_chunks
from services.llm import stream_answer

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

    @property
    def validated_message(self):
        msg = self.message.strip()
        if not msg:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        return msg[:500]

@router.post("/api/chat/stream")
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
