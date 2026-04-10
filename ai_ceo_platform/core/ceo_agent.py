import json
import datetime
import uuid
import asyncio
from core.llm_router import LLMRouter
from core.critic import Critic
from core.memory import memory
from database import SessionLocal, Task, Approval, Agent
from config import Config

class CEOAgent:
    def __init__(self):
        self.mem = memory
    
    async def run(self, cmd, proj="global", agent_id=None):
        self.mem.add(cmd, {"type": "cmd", "relevance": 1.0})
        ctx = self.mem.query(cmd, k=3)
        ctx_txt = json.dumps([c["text"] for c in ctx])
        
        prompt = f"""AI CEO. Generate automation for: {cmd}
Context: {ctx_txt}
Return ONLY JSON: {{"thought": str, "code": str, "needs_browser": bool, "needs_approval": bool}}"""
        
        raw = await LLMRouter.chat(
            prompt,
            "You are an AI CEO that generates automation code.",
            True
        )
        plan = json.loads(raw)
        
        tid = str(uuid.uuid4())
        with SessionLocal() as db:
            db.add(Task(
                id=tid,
                project_id=proj,
                agent_id=agent_id,
                description=cmd,
                status="generated",
                result=plan["thought"]
            ))
            db.commit()
        
        if plan.get("needs_approval", True) and not Config.AUTO_APPROVE:
            with SessionLocal() as db:
                db.add(Approval(
                    task_id=tid,
                    description=cmd,
                    code=plan["code"]
                ))
                db.commit()
            return {"status": "pending_approval", "tid": tid, "thought": plan["thought"]}
        
        return await self._execute(plan["code"], cmd, tid)
    
    async def _execute(self, code, task, tid):
        out = {}
        try:
            # Simple code execution (sandboxed)
            exec_globals = {"__builtins__": {"print": lambda x: out.update({"output": x})}}
            exec(code, exec_globals)
            out = {"status": "success", "output": str(out)}
        except Exception as e:
            out = {"status": "error", "output": str(e)}
        
        c = await Critic.evaluate(task, code, out)
        
        if c.get("needs_retry") and c.get("improved_code"):
            return await self._execute(c["improved_code"], task, tid)
        
        with SessionLocal() as db:
            t = db.query(Task).filter_by(id=tid).first()
            if t:
                t.status = "completed"
                t.result = c["feedback"]
                t.score = c["score"]
                db.commit()
        
        self.mem.add(
            f"Executed: {task}",
            {"type": "exec", "score": c["score"], "relevance": c["score"] / 10}
        )
        
        return {
            "status": "completed",
            "tid": tid,
            "score": c["score"],
            "thought": c["feedback"]
        }
    
    async def spawn_agent(self, name, role, skills, project=None):
        with SessionLocal() as db:
            db.add(Agent(
                id=str(uuid.uuid4()),
                name=name,
                role=role,
                skills=skills,
                project=project,
                status="active"
            ))
            db.commit()
        return {"status": "agent_spawned", "name": name, "role": role}

# Global CEO instance
ceo = CEOAgent()
