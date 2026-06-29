from fastapi import APIRouter, UploadFile, File, HTTPException
from services.embedder import get_embedding, chunk_text
from db.supabase import get_supabase
import pandas as pd
import io

router = APIRouter()

@router.post("/upload")
async def upload_catalog(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    required_cols = {"name", "brand", "primaryCategories", "prices.amountMax", "descriptions"}
    if not required_cols.issubset(df.columns):
        raise HTTPException(status_code=400, detail=f"CSV must have columns: {required_cols}")

    df = df[list(required_cols)].dropna().head(500)

    supabase = get_supabase()
    inserted = 0

    for _, row in df.iterrows():
        content = (
            f"Product: {row['name']}\n"
            f"Brand: {row['brand']}\n"
            f"Category: {row['primaryCategories']}\n"
            f"Price: ${row['prices.amountMax']}\n"
            f"Description: {str(row['descriptions'])[:500]}"
        )
        chunks = chunk_text(content)
        for chunk in chunks:
            embedding = get_embedding(chunk)
            supabase.table("product_chunks").insert({
                "content": chunk,
                "embedding": embedding,
                "metadata": {"name": row["name"], "brand": row["brand"]}
            }).execute()
            inserted += 1

    return {"message": f"Uploaded {inserted} chunks from {len(df)} products"}
