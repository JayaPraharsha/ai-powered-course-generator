from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import PyObjectId


class CourseGenerateRequest(BaseModel):
    topic: str
    level: str | None = None
    goals: str | None = None
    study_time: str | None = None


class LessonStub(BaseModel):
    id: str
    title: str
    is_enriched: bool = False


class ModuleOutline(BaseModel):
    id: str
    title: str
    lessons: list[LessonStub] = Field(default_factory=list)


class Course(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: PyObjectId | None = Field(default=None, alias="_id")
    title: str
    description: str
    tags: list[str] = Field(default_factory=list)
    level: str | None = None
    goals: str | None = None
    study_time: str | None = None
    modules: list[ModuleOutline] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
