"""
load_data.py — โหลด CSV เข้า Supabase pgvector
รัน: python scripts/load_data.py
"""

import sys
import os
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

from db.supabase import get_supabase
from services.embedder import get_embedding

CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
                        "DatafinitiElectronicsProductsPricingData.csv")
LIMIT = None  # None = โหลดทั้งหมด


def build_content(row):
    return (
        f"Product: {row['name']}\n"
        f"Brand: {row.get('brand', 'N/A')}\n"
        f"Category: {row.get('primaryCategories', 'N/A')}\n"
        f"Price: ${row.get('prices.amountMax', 'N/A')}\n"
        f"Condition: {row.get('prices.condition', 'N/A')}\n"
        f"Merchant: {row.get('prices.merchant', 'N/A')}"
    )


def main():
    print(f"📂 Reading CSV: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)

    # เลือก columns ที่มีอยู่จริงใน dataset นี้ (ไม่มี descriptions)
    cols = ["name", "brand", "primaryCategories", "prices.amountMax",
            "prices.condition", "prices.merchant"]
    df = df[[c for c in cols if c in df.columns]].dropna(subset=["name"])

    # deduplicate — เอาแค่ unique product (ราคา min ของแต่ละสินค้า)
    df = df.sort_values("prices.amountMax").drop_duplicates(subset=["name"], keep="first")
    df = df.reset_index(drop=True)

    if LIMIT:
        df = df.head(LIMIT)

    print(f"✅ Loaded {len(df)} products (limit={LIMIT})")

    supabase = get_supabase()
    inserted = 0
    errors = 0

    for i, (_, row) in enumerate(df.iterrows()):
        content = build_content(row)
        try:
            embedding = get_embedding(content)
            supabase.table("product_chunks").insert({
                "content": content,
                "embedding": embedding,
                "metadata": {
                    "name": str(row.get("name", "")),
                    "brand": str(row.get("brand", "")),
                    "price": str(row.get("prices.amountMax", ""))
                }
            }).execute()
            inserted += 1
            if inserted % 50 == 0:
                print(f"  → {inserted}/{len(df)} inserted...")
        except Exception as e:
            errors += 1
            print(f"  ⚠️  Row {i} error: {e}")

    print(f"\n🎉 Done! Inserted: {inserted} | Errors: {errors}")


if __name__ == "__main__":
    main()
