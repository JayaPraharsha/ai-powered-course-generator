import asyncio
import logging
import time

from app.agents import quiz_agent, video_agent, visual_agent
from app.agents.retry import with_retries
from app.models.lesson import Lesson
from app.services import lesson_service

logger = logging.getLogger(__name__)


async def auto_enrich_lesson(lesson: Lesson) -> Lesson:
    """Quiz/Video/Visual are meant to appear automatically per the spec ("automatically
    generates a quiz at the end of every lesson", etc.) — this runs all three concurrently
    the first time a lesson is opened, then caches the result via `auto_enriched`.
    Hinglish stays a separate explicit endpoint (button-triggered, not automatic)."""
    if lesson.auto_enriched:
        return lesson

    assert lesson.id is not None
    start = time.perf_counter()
    logger.info("Auto-enrichment started: lesson_id=%s title=%r", lesson.id, lesson.title)

    quiz, videos, visual_aids = await asyncio.gather(
        with_retries(quiz_agent.generate_quiz, lesson),
        with_retries(video_agent.discover_videos, lesson),
        with_retries(visual_agent.generate_visual_aids, lesson),
    )
    logger.info(
        "Auto-enrichment complete: lesson_id=%s %d quiz Qs, %d videos, %d visual aids in %.1fs",
        lesson.id,
        len(quiz),
        len(videos),
        len(visual_aids),
        time.perf_counter() - start,
    )

    await asyncio.gather(
        lesson_service.set_quiz(lesson.id, quiz),
        lesson_service.set_videos(lesson.id, videos),
        lesson_service.set_visual_aids(lesson.id, visual_aids),
        lesson_service.mark_auto_enriched(lesson.id),
    )

    lesson.quiz = quiz
    lesson.videos = videos
    lesson.visual_aids = visual_aids
    lesson.auto_enriched = True
    return lesson
