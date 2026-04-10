import os
from database import SessionLocal, Setting

class Config:
    PROVIDER = "openai"
    API_KEY = ""
    MODEL = "gpt-4o"
    LOCAL_URL = "http://localhost:11434/v1"
    LOCAL_MODEL = "qwen2.5:7b"
    OFFLINE = False
    AUTO_APPROVE = False
    DOCKER_ENABLED = True
    VOICE = "en-US-GuyNeural"
    WA_TOKEN = ""
    WA_PHONE = ""
    TG_TOKEN = ""
    EMAIL_USER = ""
    EMAIL_PASS = ""
    EMAIL_HOST = "smtp.gmail.com"
    EMAIL_PORT = 465
    SHEETS_API = ""
    SHEETS_ID = ""
    
    @classmethod
    def load(cls):
        try:
            with SessionLocal() as db:
                for s in db.query(Setting).all():
                    k = s.key.upper()
                    v = s.value
                    if k in ("OFFLINE", "AUTO_APPROVE", "DOCKER_ENABLED"):
                        v = v.lower() == "true"
                    if k == "EMAIL_PORT":
                        v = int(v)
                    if hasattr(cls, k):
                        setattr(cls, k, v)
        except Exception as e:
            print(f"Config load error: {e}")
    
    @classmethod
    def save(cls, key, value):
        try:
            with SessionLocal() as db:
                r = db.query(Setting).filter_by(key=key).first()
                if r:
                    r.value = str(value)
                else:
                    db.add(Setting(key=key, value=str(value)))
                db.commit()
            cls.load()
        except Exception as e:
            print(f"Config save error: {e}")

# Load config on import
Config.load()
