import faiss
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from database import SessionLocal, MemoryEntry

class VectorMemory:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
        self.index = faiss.IndexFlatIP(384)
        self.data = []
        os.makedirs("memory_db", exist_ok=True)
        p = "memory_db/index.faiss"
        if os.path.exists(p):
            self.index = faiss.read_index(p)
    
    def add(self, text, meta):
        e = self.model.encode([text], normalize_embeddings=True).astype("float32")
        self.index.add(e)
        self.data.append({"text": text, **meta})
        faiss.write_index(self.index, "memory_db/index.faiss")
        with SessionLocal() as db:
            db.add(MemoryEntry(
                type=meta.get("type", "log"),
                content=text,
                relevance=meta.get("relevance", 1.0)
            ))
            db.commit()
    
    def query(self, text, k=3):
        if not self.data:
            return []
        e = self.model.encode([text], normalize_embeddings=True).astype("float32")
        D, I = self.index.search(e, min(k, len(self.data)))
        return [self.data[i] for i in I[0] if i < len(self.data)]
    
    def prune(self, thr=0.5):
        self.data = [d for d in self.data if d.get("relevance", 1.0) >= thr]
        with SessionLocal() as db:
            db.query(MemoryEntry).filter(MemoryEntry.relevance < thr).delete()
            db.commit()

# Global memory instance
memory = VectorMemory()
