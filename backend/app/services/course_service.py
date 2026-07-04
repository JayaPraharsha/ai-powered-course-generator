from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

from app.database import get_database
from app.models.course import Course
from app.models.lesson import QuizQuestion

COLLECTION = "courses"


async def create_course(course: Course) -> Course:
    db = get_database()
    doc = course.model_dump(by_alias=True, exclude={"id"})
    result = await db[COLLECTION].insert_one(doc)
    course.id = str(result.inserted_id)
    return course


async def get_course(course_id: str) -> Course | None:
    try:
        object_id = ObjectId(course_id)
    except InvalidId:
        return None
    db = get_database()
    doc = await db[COLLECTION].find_one({"_id": object_id})
    return Course(**doc) if doc else None


async def list_courses(owner_id: str, limit: int = 20) -> list[Course]:
    db = get_database()
    cursor = (
        db[COLLECTION].find({"owner_id": owner_id}).sort("created_at", -1).limit(limit)
    )
    return [Course(**doc) async for doc in cursor]


async def list_quiz_summaries(owner_id: str) -> list[dict]:
    """Flattens every module that has a quiz across all of the owner's courses.
    There's no standalone quiz entity — quizzes live nested in Course.modules[]."""
    db = get_database()
    cursor = db[COLLECTION].find(
        {"owner_id": owner_id}, {"title": 1, "modules": 1}
    )
    summaries: list[dict] = []
    async for doc in cursor:
        course_id = str(doc["_id"])
        for module in doc.get("modules", []):
            if not module.get("quiz"):
                continue
            summaries.append(
                {
                    "course_id": course_id,
                    "course_title": doc.get("title", ""),
                    "module_id": module.get("id"),
                    "module_title": module.get("title", ""),
                    "quiz_completed": module.get("quiz_completed", False),
                    "quiz_score": module.get("quiz_score"),
                    "quiz_total": module.get("quiz_total"),
                }
            )
    return summaries


async def mark_lesson_enriched(course_id: str, module_id: str, lesson_id: str) -> None:
    db = get_database()
    await db[COLLECTION].update_one(
        {
            "_id": ObjectId(course_id),
            "modules.id": module_id,
            "modules.lessons.id": lesson_id,
        },
        {"$set": {"modules.$[m].lessons.$[l].is_enriched": True}},
        array_filters=[{"m.id": module_id}, {"l.id": lesson_id}],
    )


async def set_lesson_completed(course_id: str, lesson_id: str, completed: bool) -> tuple[list[str], bool]:
    """Returns the updated id list plus whether this call actually changed the
    completion state (vs. a redundant repeat toggle) — callers use `changed`
    to decide whether to award/claw back rewards exactly once per transition."""
    db = get_database()
    before = await db[COLLECTION].find_one({"_id": ObjectId(course_id)}, {"completed_lesson_ids": 1})
    was_completed = lesson_id in (before.get("completed_lesson_ids", []) if before else [])

    op = {"$addToSet": {"completed_lesson_ids": lesson_id}} if completed else {
        "$pull": {"completed_lesson_ids": lesson_id}
    }
    doc = await db[COLLECTION].find_one_and_update(
        {"_id": ObjectId(course_id)},
        op,
        return_document=ReturnDocument.AFTER,
    )
    ids = doc["completed_lesson_ids"] if doc else []
    changed = completed != was_completed
    return ids, changed


async def set_module_quiz(course_id: str, module_id: str, quiz: list[QuizQuestion]) -> None:
    db = get_database()
    await db[COLLECTION].update_one(
        {"_id": ObjectId(course_id), "modules.id": module_id},
        {"$set": {"modules.$[m].quiz": [q.model_dump() for q in quiz]}},
        array_filters=[{"m.id": module_id}],
    )


async def set_module_quiz_result(
    course_id: str, module_id: str, *, completed: bool, score: int, total: int
) -> None:
    db = get_database()
    await db[COLLECTION].update_one(
        {"_id": ObjectId(course_id), "modules.id": module_id},
        {
            "$set": {
                "modules.$[m].quiz_completed": completed,
                "modules.$[m].quiz_score": score,
                "modules.$[m].quiz_total": total,
            }
        },
        array_filters=[{"m.id": module_id}],
    )
