import json
from functools import lru_cache
from typing import Any

from openai import AsyncOpenAI

from app.core.config import get_settings


class LLMError(Exception):
    """Raised when the LLM call fails or returns something that isn't a JSON object."""


@lru_cache
def _client() -> AsyncOpenAI:
    settings = get_settings()
    return AsyncOpenAI(
        api_key=settings.LLM_API_KEY,
        base_url=settings.LLM_BASE_URL,
        timeout=settings.LLM_TIMEOUT_SECONDS,
        max_retries=1,
    )


async def complete_json(system: str, user: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        response = await _client().chat.completions.create(
            model=settings.LLM_MODEL,
            temperature=settings.LLM_TEMPERATURE,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        content = response.choices[0].message.content or ""
        data = json.loads(content)
    except Exception as exc:
        raise LLMError(str(exc)) from exc
    if not isinstance(data, dict):
        raise LLMError("LLM response was not a JSON object")
    return data
