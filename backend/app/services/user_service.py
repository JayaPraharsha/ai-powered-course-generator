from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

from app.database import get_database
from app.models.user import User

COLLECTION = "users"
LESSON_COMPLETE_XP = 50
LESSON_COMPLETE_GOLD = 10


async def create_user(user: User) -> User:
    db = get_database()
    doc = user.model_dump(by_alias=True, exclude={"id"})
    result = await db[COLLECTION].insert_one(doc)
    user.id = str(result.inserted_id)
    return user


async def get_user_by_email(email: str) -> User | None:
    db = get_database()
    doc = await db[COLLECTION].find_one({"email": email.lower()})
    return User(**doc) if doc else None


async def get_user_by_id(user_id: str) -> User | None:
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        return None
    db = get_database()
    doc = await db[COLLECTION].find_one({"_id": object_id})
    return User(**doc) if doc else None


async def award_rewards(user_id: str, xp_delta: int, gold_delta: int) -> User | None:
    """Applies an XP/gold delta (positive on completion, negative on
    un-completion) and returns the user's fresh totals in one round-trip."""
    db = get_database()
    doc = await db[COLLECTION].find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$inc": {"xp": xp_delta, "gold": gold_delta}},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        return None
    if doc["xp"] < 0 or doc["gold"] < 0:
        doc["xp"] = max(doc["xp"], 0)
        doc["gold"] = max(doc["gold"], 0)
        await db[COLLECTION].update_one(
            {"_id": ObjectId(user_id)}, {"$set": {"xp": doc["xp"], "gold": doc["gold"]}}
        )
    return User(**doc)
