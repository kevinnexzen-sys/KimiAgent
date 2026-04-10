from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import uuid
import datetime
import os
import logging

from config import Config
from database import SessionLocal, Task, Approval, Agent, Project, MemoryEntry, Setting, Invoice
from core.ceo_agent import ceo
from core.memory import memory
from core.heartbeat import Heartbeat
import integrations as intg

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

logging.basicConfig(level=logging.INFO)
ws_clients = set()

@app.on_event("startup")
def start():
    Config.load()
    
    async def bcast(d):
        m = json.dumps(d, default=str)
        for c in list(ws_clients):
            try:
                await c.send_text(m)
            except:
                ws_clients.discard(c)
    
    asyncio.create_task(Heartbeat(bcast, ceo).start())

@app.get("/")
def index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.websocket("/ws")
async def ws(socket: WebSocket):
    await socket.accept()
    ws_clients.add(socket)
    try:
        while True:
            d = json.loads(await socket.receive_text())
            if d.get("cmd"):
                res = await ceo.run(d["cmd"])
                await socket.send_text(json.dumps({"type": "resp", "data": res}))
    except:
        ws_clients.discard(socket)

@app.get("/api/settings")
def get_settings():
    Config.load()
    return {
        k: getattr(Config, k)
        for k in [
            "PROVIDER", "API_KEY", "MODEL", "LOCAL_URL", "LOCAL_MODEL",
            "OFFLINE", "AUTO_APPROVE", "DOCKER_ENABLED", "VOICE",
            "WA_TOKEN", "WA_PHONE", "TG_TOKEN", "EMAIL_USER", "EMAIL_PASS",
            "EMAIL_HOST", "EMAIL_PORT", "SHEETS_API", "SHEETS_ID"
        ]
    }

@app.post("/api/settings")
async def save_settings(req: dict):
    for k, v in req.items():
        Config.save(k, v)
    return {"status": "saved"}

@app.get("/api/tasks")
def get_tasks():
    with SessionLocal() as db:
        return [
            {
                "id": t.id,
                "d": t.description,
                "p": t.project_id,
                "s": t.status,
                "sc": t.score,
                "a": t.agent_id
            }
            for t in db.query(Task).order_by(Task.created.desc()).all()
        ]

@app.get("/api/approvals")
def get_approvals():
    with SessionLocal() as db:
        return [
            {
                "id": a.id,
                "d": a.description,
                "c": a.code,
                "s": a.status,
                "tid": a.task_id
            }
            for a in db.query(Approval).filter_by(status="pending").all()
        ]

@app.post("/api/approve")
async def approve(req: dict):
    with SessionLocal() as db:
        a = db.query(Approval).filter_by(id=req["id"]).first()
        if a:
            a.status = "approved"
            db.commit()
    asyncio.create_task(ceo.run(req.get("d", "")))
    return {"status": "ok"}

@app.get("/api/projects")
def get_projects():
    with SessionLocal() as db:
        return [
            {
                "id": p.id,
                "n": p.name,
                "i": p.instructions,
                "k": p.kb,
                "s": p.status
            }
            for p in db.query(Project).all()
        ]

@app.post("/api/projects")
async def add_proj(req: dict):
    with SessionLocal() as db:
        db.add(Project(
            id=str(uuid.uuid4()),
            name=req["n"],
            instructions=req.get("i", ""),
            kb=req.get("k", {})
        ))
        db.commit()
    return {"status": "created"}

@app.get("/api/agents")
def get_agents():
    with SessionLocal() as db:
        return [
            {
                "id": a.id,
                "n": a.name,
                "r": a.role,
                "sk": a.skills,
                "p": a.project,
                "s": a.status
            }
            for a in db.query(Agent).all()
        ]

@app.post("/api/agents")
async def add_agent(req: dict):
    res = await ceo.spawn_agent(
        req["n"],
        req.get("r", "worker"),
        req.get("sk", []),
        req.get("p")
    )
    return res

@app.get("/api/finance")
def get_finance():
    with SessionLocal() as db:
        c = db.query(Task).filter_by(status="completed").count()
        amt = c * 25.0
        return [{"id": str(uuid.uuid4())[:8], "tasks": c, "amt": amt, "st": "draft"}]

@app.get("/api/memory")
def get_memory():
    with SessionLocal() as db:
        return [
            {"t": m.type, "c": m.content[:80], "r": m.relevance}
            for m in db.query(MemoryEntry).order_by(MemoryEntry.id.desc()).limit(40).all()
        ]

@app.post("/api/memory/prune")
def prune_mem():
    memory.prune(0.5)
    return {"status": "pruned"}

@app.post("/api/test_int")
def test_int(req: dict):
    t = req.get("type")
    if t == "wa":
        return intg.test_wa(Config.WA_TOKEN, Config.WA_PHONE, req.get("to", ""))
    if t == "tg":
        return intg.test_tg(Config.TG_TOKEN, req.get("to", ""))
    if t == "email":
        return intg.test_email(
            Config.EMAIL_USER, Config.EMAIL_PASS,
            Config.EMAIL_HOST, Config.EMAIL_PORT,
            req.get("to", "")
        )
    return {"error": "Unknown"}
