# AI CEO Platform

A fully functional AI automation platform with multi-agent system, memory, and integrations.

## Features

### 🤖 Core AI System
- **Multi-Provider LLM Router**: OpenAI, Anthropic, Google, Groq, Ollama (local)
- **CEO Agent**: Main orchestrator that spawns sub-agents
- **Critic System**: Self-evaluation and code improvement loop
- **Vector Memory**: FAISS-based memory with relevance scoring
- **Heartbeat**: Background task processing and approvals

### 📊 Dashboard
- **Real-time WebSocket**: Live updates from the agent
- **Task Management**: View all tasks with scores
- **Approval System**: Manual or auto-approve workflows
- **Project Management**: Create projects with KB
- **Agent Spawning**: Create specialized sub-agents
- **Finance Tracking**: Invoice generation
- **Memory Pruning**: Clean low-relevance memories

### 🔗 Integrations
- **WhatsApp**: Meta Business API
- **Telegram**: Bot API
- **Email**: SMTP (Gmail, etc.)
- **Google Sheets**: API v4

### ⚙️ Settings
- **Zero .env files**: All config via UI, saved to DB
- **Offline Mode**: Route to local Ollama
- **Auto-Execute**: Skip approvals
- **Multi-provider**: Switch LLM providers instantly

## Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py

# Open in browser
http://127.0.0.1:8000
```

## Usage

1. **Configure LLM**: Go to Settings → Select provider → Add API key
2. **Send Command**: Type in Home tab or use voice
3. **Approve**: Check Approvals tab for pending tasks
4. **Spawn Agents**: Create specialized agents in Agents tab
5. **Test Integrations**: Configure WhatsApp/Telegram/Email in Integrations tab

## Architecture

```
ai_ceo_platform/
├── api/
│   └── server.py          # FastAPI + WebSocket
├── core/
│   ├── llm_router.py      # Multi-provider LLM
│   ├── ceo_agent.py       # Main agent logic
│   ├── critic.py          # Self-evaluation
│   ├── memory.py          # FAISS vector store
│   └── heartbeat.py       # Background tasks
├── integrations/
│   └── __init__.py        # WA, TG, Email, Sheets
├── static/
│   └── index.html         # Dashboard UI
├── database.py            # SQLAlchemy models
├── config.py              # Settings management
└── main.py                # Entry point
```

## API Endpoints

- `WS /ws` - WebSocket for real-time communication
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Save settings
- `GET /api/tasks` - List all tasks
- `GET /api/approvals` - List pending approvals
- `POST /api/approve` - Approve a task
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/agents` - List agents
- `POST /api/agents` - Spawn agent
- `GET /api/memory` - List memory entries
- `POST /api/memory/prune` - Prune low relevance
- `POST /api/test_int` - Test integrations

## Mobile App

The dashboard is fully responsive and works as a PWA:
1. Open in Chrome Mobile
2. Tap ⋮ → "Add to Home Screen"
3. Works like a native app

## License

MIT
