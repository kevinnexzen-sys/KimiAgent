from sqlalchemy import create_engine, Column, String, Integer, Float, Text, JSON, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import uuid

Base = declarative_base()
engine = create_engine("sqlite:///./ceo_platform.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    instructions = Column(Text, default="")
    kb = Column(JSON, default=dict)
    status = Column(String, default="active")
    created = Column(DateTime, default=datetime.datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String)
    agent_id = Column(String, nullable=True)
    description = Column(Text)
    status = Column(String, default="pending")
    result = Column(Text)
    score = Column(Integer, default=0)
    created = Column(DateTime, default=datetime.datetime.utcnow)

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String)
    description = Column(Text)
    code = Column(Text)
    status = Column(String, default="pending")

class Agent(Base):
    __tablename__ = "agents"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    role = Column(String, default="worker")
    skills = Column(JSON, default=list)
    project = Column(String, nullable=True)
    status = Column(String, default="idle")

class MemoryEntry(Base):
    __tablename__ = "memory"
    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String)
    content = Column(Text)
    relevance = Column(Float, default=1.0)

class Setting(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True)
    value = Column(Text, default="")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tasks = Column(Integer, default=0)
    amount = Column(Float, default=0.0)
    status = Column(String, default="draft")
    created = Column(DateTime, default=datetime.datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)
