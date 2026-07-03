from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agents import hinglish_agent, quiz_agent, tutor_agent, video_agent, visual_agent
from app.agents.retry import with_retries
from app.services import enrichment_service, lesson_service, video_note_service

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str):
    lesson = await lesson_service.get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not lesson.auto_enriched:
        lesson = await enrichment_service.auto_enrich_lesson(lesson)
    return lesson


async def _require_lesson(lesson_id: str):
    lesson = await lesson_service.get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.post("/{lesson_id}/quiz/generate")
async def generate_quiz(lesson_id: str):
    lesson = await _require_lesson(lesson_id)
    quiz = await with_retries(quiz_agent.generate_quiz, lesson)
    await lesson_service.set_quiz(lesson_id, quiz)
    return quiz


class QuizSubmission(BaseModel):
    answers: dict[str, str]


@router.post("/{lesson_id}/quiz/submit")
async def submit_quiz(lesson_id: str, submission: QuizSubmission):
    lesson = await _require_lesson(lesson_id)
    results = []
    correct_count = 0
    for question in lesson.quiz:
        submitted = submission.answers.get(question.id, "")
        is_correct = submitted.strip().lower() == question.correct_answer.strip().lower()
        correct_count += int(is_correct)
        results.append(
            {
                "question_id": question.id,
                "correct": is_correct,
                "correct_answer": question.correct_answer,
                "explanation": question.explanation,
            }
        )
    return {"score": correct_count, "total": len(lesson.quiz), "results": results}


@router.post("/{lesson_id}/visuals/generate")
async def generate_visuals(lesson_id: str):
    lesson = await _require_lesson(lesson_id)
    aids = await with_retries(visual_agent.generate_visual_aids, lesson)
    await lesson_service.set_visual_aids(lesson_id, aids)
    return aids


@router.post("/{lesson_id}/videos/discover")
async def discover_videos(lesson_id: str):
    lesson = await _require_lesson(lesson_id)
    videos = await with_retries(video_agent.discover_videos, lesson)
    await lesson_service.set_videos(lesson_id, videos)
    return videos


class VideoNotesRequest(BaseModel):
    video_url: str


@router.post("/{lesson_id}/videos/notes")
async def video_notes(lesson_id: str, body: VideoNotesRequest):
    lesson = await _require_lesson(lesson_id)
    existing = await video_note_service.find_video_note(lesson_id, body.video_url)
    if existing:
        return existing
    note = await with_retries(
        video_agent.generate_video_notes, lesson_id, body.video_url, lesson.title
    )
    return await video_note_service.create_video_note(note)


@router.post("/{lesson_id}/hinglish")
async def generate_hinglish(lesson_id: str):
    lesson = await _require_lesson(lesson_id)
    hinglish = await with_retries(hinglish_agent.generate_hinglish_content, lesson)
    await lesson_service.set_hinglish(lesson_id, hinglish)
    return hinglish


class TutorQuestion(BaseModel):
    question: str


@router.post("/{lesson_id}/tutor/ask")
async def tutor_ask(lesson_id: str, body: TutorQuestion):
    lesson = await _require_lesson(lesson_id)
    answer = await with_retries(tutor_agent.ask_tutor, lesson, body.question)
    return {"answer": answer}
