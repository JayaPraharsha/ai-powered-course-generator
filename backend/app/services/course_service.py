from bson import ObjectId
from bson.errors import InvalidId

from app.database import get_database
from app.models.course import Course

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


async def list_courses(limit: int = 20) -> list[Course]:
    db = get_database()
    cursor = db[COLLECTION].find().sort("created_at", -1).limit(limit)
    return [Course(**doc) async for doc in cursor]


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
