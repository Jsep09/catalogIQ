from db.supabase import get_supabase
from services.embedder import get_embedding

def retrieve_relevant_chunks(query: str, top_k: int = 5) -> list[dict]:
    supabase = get_supabase()
    query_embedding = get_embedding(query)

    result = supabase.rpc("match_product_chunks", {
        "query_embedding": query_embedding,
        "match_count": top_k
    }).execute()

    return result.data
