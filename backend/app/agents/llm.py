from crewai import LLM

from app.config import settings


def get_gemini_llm(temperature: float = 0.7) -> LLM:
    """gemini-2.0-flash has zero free-tier quota as of mid-2026 — gemini-2.5-flash
    is the current working default (see app.config.settings.gemini_model)."""
    return LLM(model=settings.gemini_model, api_key=settings.gemini_api_key, temperature=temperature)
