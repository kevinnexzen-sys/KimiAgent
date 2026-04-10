import asyncio
import logging
import datetime
from database import SessionLocal, Task, Approval
from config import Config

logger = logging.getLogger("Heartbeat")

class Heartbeat:
    def __init__(self, broadcast, ceo):
        self.broadcast = broadcast
        self.ceo = ceo
        self.running = False
    
    async def start(self):
        self.running = True
        while self.running:
            try:
                with SessionLocal() as db:
                    pending = db.query(Approval).filter_by(status="pending").all()
                    for a in pending:
                        if Config.AUTO_APPROVE:
                            a.status = "approved"
                            db.commit()
                            asyncio.create_task(self.ceo.run(a.description))
                
                await self.broadcast({
                    "type": "hb",
                    "time": datetime.datetime.utcnow().strftime("%H:%M:%S")
                })
                await asyncio.sleep(8)
            except Exception as e:
                logger.error(f"Heartbeat: {e}")
                await asyncio.sleep(5)
