"""Pydantic schemas for Academy courses."""

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ModuleOut(BaseModel):
    id: uuid.UUID
    title: str
    content: str
    order: int
    duration_minutes: int
    created_at: datetime
    updated_at: datetime


class ModuleCreateRequest(BaseModel):
    title: str = Field(..., max_length=255)
    content: str = ""
    order: int = 0
    duration_minutes: int = 0


class ModuleUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None
    duration_minutes: Optional[int] = None


class CourseOut(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    summary: str
    description: str
    level: str
    duration_hours: int
    cover_url: Optional[str]
    is_published: bool
    author_username: Optional[str] = None
    modules_count: int = 0
    created_at: datetime
    updated_at: datetime


class CourseDetailOut(CourseOut):
    modules: List[ModuleOut]


class CourseCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    slug: Optional[str] = None
    summary: str = ""
    description: str = ""
    level: str = "basico"  # basico | intermedio | avanzado
    duration_hours: int = 0
    cover_url: Optional[str] = None
    is_published: bool = False


class CourseUpdateRequest(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    duration_hours: Optional[int] = None
    cover_url: Optional[str] = None
    is_published: Optional[bool] = None
