from fastapi import APIRouter, HTTPException

from app.models.course import CourseGenerateRequest
from app.services import course_service, generation_service

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("/generate")
async def generate_course(request: CourseGenerateRequest):
    return await generation_service.generate_course(request)


@router.get("")
async def list_courses():
    return await course_service.list_courses()


@router.get("/{course_id}")
async def get_course(course_id: str):
    course = await course_service.get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
