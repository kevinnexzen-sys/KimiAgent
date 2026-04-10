import json
import asyncio
from openai import AsyncOpenAI, OpenAI
from anthropic import AsyncAnthropic
import google.generativeai as genai
from groq import Groq
from config import Config

class LLMRouter:
    @staticmethod
    async def chat(prompt, system="", json_mode=False):
        cfg = Config
        
        if cfg.OFFLINE:
            c = OpenAI(base_url=cfg.LOCAL_URL, api_key="local")
            return c.chat.completions.create(
                model=cfg.LOCAL_MODEL,
                messages=[{"role": "user", "content": prompt}]
            ).choices[0].message.content
        
        fmt = {"type": "json_object"} if json_mode else None
        
        if cfg.PROVIDER == "openai":
            return (await AsyncOpenAI(api_key=cfg.API_KEY).chat.completions.create(
                model=cfg.MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ],
                response_format=fmt
            )).choices[0].message.content
        
        if cfg.PROVIDER == "anthropic":
            return (await AsyncAnthropic(api_key=cfg.API_KEY).messages.create(
                model=cfg.MODEL,
                system=system,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024
            )).content[0].text
        
        if cfg.PROVIDER == "google":
            genai.configure(api_key=cfg.API_KEY)
            return (await genai.GenerativeModel(cfg.MODEL).generate_content_async(
                f"{system}\n\n{prompt}"
            )).text
        
        if cfg.PROVIDER == "groq":
            return Groq(api_key=cfg.API_KEY).chat.completions.create(
                model=cfg.MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ]
            ).choices[0].message.content
        
        raise ValueError("Unsupported provider")
