from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List


# Daily Entry schemas
class DailyEntryBase(BaseModel):
    date: date
    weight_kg: Optional[float] = None
    energy_level: Optional[int] = None  # 1-5
    notes: Optional[str] = None


class DailyEntryCreate(DailyEntryBase):
    pass


class DailyEntryUpdate(BaseModel):
    weight_kg: Optional[float] = None
    energy_level: Optional[int] = None
    notes: Optional[str] = None


class DailyEntryResponse(DailyEntryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Meal schemas
class MealBase(BaseModel):
    date: date
    time: datetime
    description: str


class MealCreate(MealBase):
    pass


class MealUpdate(BaseModel):
    time: Optional[datetime] = None
    description: Optional[str] = None


class MealResponse(MealBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Exercise schemas
class ExerciseBase(BaseModel):
    date: date
    category: str  # weights, cardio, walking, stretching
    description: str
    duration_minutes: Optional[int] = None


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None


class ExerciseResponse(ExerciseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Combined daily view
class DailyOverview(BaseModel):
    date: date
    entry: Optional[DailyEntryResponse] = None
    meals: List[MealResponse] = []
    exercises: List[ExerciseResponse] = []
    fasting_hours: Optional[float] = None
    is_currently_fasting: bool = False  # True if no meals eaten today yet
    last_meal_time: Optional[datetime] = None  # When the previous meal was eaten


# Trends
class WeightTrend(BaseModel):
    date: date
    weight_kg: float


class EnergyTrend(BaseModel):
    date: date
    energy_level: int


class ExerciseSummary(BaseModel):
    category: str
    total_minutes: int
    count: int
