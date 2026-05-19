from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    admin,
    admin_events,
    ai,
    auth,
    challenges,
    courses,
    events,
    leaderboard,
    moderator_events,
    teams,
)

app = FastAPI(
    title="CyberQuest API",
    version="1.0.0",
    description="CTF cybersecurity training platform API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(admin_events.router)
app.include_router(moderator_events.router)
app.include_router(auth.router)
app.include_router(challenges.router)
app.include_router(teams.router)
app.include_router(events.router)
app.include_router(leaderboard.router)
app.include_router(ai.router)
app.include_router(courses.router)


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "env": settings.ENV}
