from sqlalchemy import Column, Integer, Float, String, DateTime, Date, Enum
from sqlalchemy.sql import func
from database import Base
import enum


class ExerciseCategory(str, enum.Enum):
    WEIGHTS = "weights"
    CARDIO = "cardio"
    WALKING = "walking"
    STRETCHING = "stretching"


class DailyEntry(Base):
    __tablename__ = "daily_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True, nullable=False)
    weight_kg = Column(Float, nullable=True)
    energy_level = Column(Integer, nullable=True)  # 1-5 scale
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True, nullable=False)
    time = Column(DateTime, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True, nullable=False)
    category = Column(String, nullable=False)  # weights, cardio, walking, stretching
    description = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
