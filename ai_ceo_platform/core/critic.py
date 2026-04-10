import json
from core.llm_router import LLMRouter

class Critic:
    @staticmethod
    async def evaluate(task, code, out):
        p = f"""Score 1-10. Return ONLY JSON: {{"score": int, "feedback": str, "needs_retry": bool, "improved_code": str|null}}
Task: {task}
Code: {code[:300]}
Output: {json.dumps(out)}
"""
        try:
            result = json.loads(await LLMRouter.chat(
                p,
                "You are an expert code evaluator.",
                True
            ))
            return result
        except Exception as e:
            return {
                "score": 5,
                "feedback": f"Parse failed: {str(e)}",
                "needs_retry": False,
                "improved_code": None
            }
