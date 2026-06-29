import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are a friendly and knowledgeable product assistant for an IT distributor.

When product catalog context is provided, use it to answer questions about products, prices, brands, and availability.
When the question is general (e.g. product advice, comparisons, tech questions), answer from your own knowledge helpfully.
If asked something completely unrelated to products or tech, you can still help briefly but gently steer the conversation back.

Always respond in the same language as the user (Thai or English).
Keep answers concise, friendly, and useful."""


def generate_answer(query: str, contexts: list[str]) -> str:
    """Non-streaming version (kept for compatibility)"""
    context_text = "\n\n".join(contexts)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {query}"}
        ],
        temperature=0.1
    )
    return response.choices[0].message.content


def stream_answer(query: str, contexts: list[str], sources: list[dict]):
    """Streaming version — yields SSE chunks"""
    context_text = "\n\n".join(contexts)

    # ส่ง sources ก่อนเป็น event แรก
    yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

    stream = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {query}"}
        ],
        temperature=0.1,
        stream=True
    )

    for chunk in stream:
        token = chunk.choices[0].delta.content
        if token:
            yield f"data: {json.dumps({'type': 'token', 'token': token})}\n\n"

    yield "data: [DONE]\n\n"
