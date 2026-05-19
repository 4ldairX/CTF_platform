"""Academy courses — managed by instructors (and admins).

Roles:
- list/get courses (publicados): cualquier autenticado
- create/update/delete course: instructor o admin
- module CRUD: instructor o admin
"""

import re
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_user, require_instructor_or_above
from app.db.session import get_db
from app.models.course import Course, CourseModule
from app.models.user import User
from app.schemas.course import (
    CourseCreateRequest,
    CourseDetailOut,
    CourseOut,
    CourseUpdateRequest,
    ModuleCreateRequest,
    ModuleOut,
    ModuleUpdateRequest,
)

router = APIRouter(prefix="/courses", tags=["courses"])


def _slugify(text: str) -> str:
    base = re.sub(r"[^a-z0-9-]+", "-", text.lower()).strip("-")
    return base[:280] or "course"


def _course_out(c: Course) -> CourseOut:
    return CourseOut(
        id=c.id,
        title=c.title,
        slug=c.slug,
        summary=c.summary,
        description=c.description,
        level=c.level,
        duration_hours=c.duration_hours,
        cover_url=c.cover_url,
        is_published=c.is_published,
        author_username=c.author.username if c.author else None,
        modules_count=len(c.modules) if c.modules else 0,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


def _module_out(m: CourseModule) -> ModuleOut:
    return ModuleOut(
        id=m.id,
        title=m.title,
        content=m.content,
        order=m.order,
        duration_minutes=m.duration_minutes,
        created_at=m.created_at,
        updated_at=m.updated_at,
    )


async def _course_or_404(db: AsyncSession, course_id: uuid.UUID) -> Course:
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.author), selectinload(Course.modules))
        .where(Course.id == course_id)
    )
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return c


@router.get("/", response_model=List[CourseOut])
async def list_courses(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    can_see_drafts = user.role.value in ("admin", "instructor")
    stmt = (
        select(Course)
        .options(selectinload(Course.author), selectinload(Course.modules))
        .order_by(Course.created_at.desc())
    )
    if not can_see_drafts:
        stmt = stmt.where(Course.is_published == True)  # noqa: E712
    result = await db.execute(stmt)
    return [_course_out(c) for c in result.scalars().all()]


@router.get("/{course_id}", response_model=CourseDetailOut)
async def get_course(
    course_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    course = await _course_or_404(db, course_id)
    if not course.is_published and user.role.value not in ("admin", "instructor"):
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseDetailOut(
        **_course_out(course).model_dump(),
        modules=[_module_out(m) for m in course.modules],
    )


@router.post("/", response_model=CourseDetailOut, status_code=status.HTTP_201_CREATED)
async def create_course(
    data: CourseCreateRequest,
    user: User = Depends(require_instructor_or_above),
    db: AsyncSession = Depends(get_db),
):
    slug = _slugify(data.slug or data.title)
    existing = await db.execute(select(Course).where(Course.slug == slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Slug already in use")

    course = Course(
        title=data.title,
        slug=slug,
        summary=data.summary,
        description=data.description,
        level=data.level,
        duration_hours=data.duration_hours,
        cover_url=data.cover_url,
        is_published=data.is_published,
        author_id=user.id,
    )
    db.add(course)
    await db.flush()
    refreshed = await _course_or_404(db, course.id)
    return CourseDetailOut(
        **_course_out(refreshed).model_dump(),
        modules=[_module_out(m) for m in refreshed.modules],
    )


@router.put("/{course_id}", response_model=CourseDetailOut)
async def update_course(
    course_id: uuid.UUID,
    data: CourseUpdateRequest,
    _: User = Depends(require_instructor_or_above),
    db: AsyncSession = Depends(get_db),
):
    course = await _course_or_404(db, course_id)
    if data.title is not None:
        course.title = data.title
    if data.summary is not None:
        course.summary = data.summary
    if data.description is not None:
        course.description = data.description
    if data.level is not None:
        course.level = data.level
    if data.duration_hours is not None:
        course.duration_hours = data.duration_hours
    if data.cover_url is not None:
        course.cover_url = data.cover_url
    if data.is_published is not None:
        course.is_published = data.is_published
    await db.flush()
    refreshed = await _course_or_404(db, course.id)
    return CourseDetailOut(
        **_course_out(refreshed).model_dump(),
        modules=[_module_out(m) for m in refreshed.modules],
    )


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: uuid.UUID,
    _: User = Depends(require_instructor_or_above),
    db: AsyncSession = Depends(get_db),
):
    course = await _course_or_404(db, course_id)
    await db.delete(course)


@router.post(
    "/{course_id}/modules",
    response_model=ModuleOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_module(
    course_id: uuid.UUID,
    data: ModuleCreateRequest,
    _: User = Depends(require_instructor_or_above),
    db: AsyncSession = Depends(get_db),
):
    course = await _course_or_404(db, course_id)
    module = CourseModule(
        course_id=course.id,
        title=data.title,
        content=data.content,
        order=data.order or (len(course.modules) + 1),
        duration_minutes=data.duration_minutes,
    )
    db.add(module)
    await db.flush()
    await db.refresh(module)
    return _module_out(module)


@router.put("/{course_id}/modules/{module_id}", response_model=ModuleOut)
async def update_module(
    course_id: uuid.UUID,
    module_id: uuid.UUID,
    data: ModuleUpdateRequest,
    _: User = Depends(require_instructor_or_above),
    db: AsyncSession = Depends(get_db),
):
    module = await db.get(CourseModule, module_id)
    if not module or module.course_id != course_id:
        raise HTTPException(status_code=404, detail="Module not found")
    if data.title is not None:
        module.title = data.title
    if data.content is not None:
        module.content = data.content
    if data.order is not None:
        module.order = data.order
    if data.duration_minutes is not None:
        module.duration_minutes = data.duration_minutes
    await db.flush()
    await db.refresh(module)
    return _module_out(module)


@router.delete(
    "/{course_id}/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_module(
    course_id: uuid.UUID,
    module_id: uuid.UUID,
    _: User = Depends(require_instructor_or_above),
    db: AsyncSession = Depends(get_db),
):
    module = await db.get(CourseModule, module_id)
    if not module or module.course_id != course_id:
        raise HTTPException(status_code=404, detail="Module not found")
    await db.delete(module)
