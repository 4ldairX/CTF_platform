from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# This file intentionally re-exports Base.
# Alembic's env.py imports all models explicitly; this module stays minimal
# to avoid circular imports (each model imports Base from here).
