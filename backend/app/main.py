from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import date, datetime, timedelta
from typing import List, Optional
import os

from .database import engine, get_db, Base
from .models import DailyEntry, Meal, Exercise
from .schemas import (
    DailyEntryCreate, DailyEntryUpdate, DailyEntryResponse,
    MealCreate, MealUpdate, MealResponse,
    ExerciseCreate, ExerciseUpdate, ExerciseResponse,
    DailyOverview, WeightTrend, EnergyTrend, ExerciseSummary
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Health Tracker API", version="1.0.0")

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Daily Entry Endpoints ============

@app.get("/api/entries", response_model=List[DailyEntryResponse])
def get_entries(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DailyEntry)
    if start_date:
        query = query.filter(DailyEntry.date >= start_date)
    if end_date:
        query = query.filter(DailyEntry.date <= end_date)
    return query.order_by(DailyEntry.date.desc()).all()


@app.get("/api/entries/{entry_date}", response_model=DailyEntryResponse)
def get_entry(entry_date: date, db: Session = Depends(get_db)):
    entry = db.query(DailyEntry).filter(DailyEntry.date == entry_date).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@app.post("/api/entries", response_model=DailyEntryResponse)
def create_entry(entry: DailyEntryCreate, db: Session = Depends(get_db)):
    existing = db.query(DailyEntry).filter(DailyEntry.date == entry.date).first()
    if existing:
        raise HTTPException(status_code=400, detail="Entry for this date already exists")

    db_entry = DailyEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


@app.put("/api/entries/{entry_date}", response_model=DailyEntryResponse)
def update_entry(entry_date: date, entry: DailyEntryUpdate, db: Session = Depends(get_db)):
    db_entry = db.query(DailyEntry).filter(DailyEntry.date == entry_date).first()
    if not db_entry:
        # Create new entry if doesn't exist
        db_entry = DailyEntry(date=entry_date, **entry.model_dump(exclude_unset=True))
        db.add(db_entry)
    else:
        for key, value in entry.model_dump(exclude_unset=True).items():
            setattr(db_entry, key, value)

    db.commit()
    db.refresh(db_entry)
    return db_entry


@app.delete("/api/entries/{entry_date}")
def delete_entry(entry_date: date, db: Session = Depends(get_db)):
    entry = db.query(DailyEntry).filter(DailyEntry.date == entry_date).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}


# ============ Meal Endpoints ============

@app.get("/api/meals", response_model=List[MealResponse])
def get_meals(
    meal_date: Optional[date] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Meal)
    if meal_date:
        query = query.filter(Meal.date == meal_date)
    if start_date:
        query = query.filter(Meal.date >= start_date)
    if end_date:
        query = query.filter(Meal.date <= end_date)
    return query.order_by(Meal.time.asc()).all()


@app.post("/api/meals", response_model=MealResponse)
def create_meal(meal: MealCreate, db: Session = Depends(get_db)):
    db_meal = Meal(**meal.model_dump())
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal


@app.put("/api/meals/{meal_id}", response_model=MealResponse)
def update_meal(meal_id: int, meal: MealUpdate, db: Session = Depends(get_db)):
    db_meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    for key, value in meal.model_dump(exclude_unset=True).items():
        setattr(db_meal, key, value)

    db.commit()
    db.refresh(db_meal)
    return db_meal


@app.delete("/api/meals/{meal_id}")
def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return {"message": "Meal deleted"}


# ============ Exercise Endpoints ============

@app.get("/api/exercises", response_model=List[ExerciseResponse])
def get_exercises(
    exercise_date: Optional[date] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Exercise)
    if exercise_date:
        query = query.filter(Exercise.date == exercise_date)
    if start_date:
        query = query.filter(Exercise.date >= start_date)
    if end_date:
        query = query.filter(Exercise.date <= end_date)
    if category:
        query = query.filter(Exercise.category == category)
    return query.order_by(Exercise.date.desc()).all()


@app.post("/api/exercises", response_model=ExerciseResponse)
def create_exercise(exercise: ExerciseCreate, db: Session = Depends(get_db)):
    db_exercise = Exercise(**exercise.model_dump())
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise


@app.put("/api/exercises/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(exercise_id: int, exercise: ExerciseUpdate, db: Session = Depends(get_db)):
    db_exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not db_exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    for key, value in exercise.model_dump(exclude_unset=True).items():
        setattr(db_exercise, key, value)

    db.commit()
    db.refresh(db_exercise)
    return db_exercise


@app.delete("/api/exercises/{exercise_id}")
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    db.delete(exercise)
    db.commit()
    return {"message": "Exercise deleted"}


# ============ Overview & Trends ============

@app.get("/api/daily/{overview_date}", response_model=DailyOverview)
def get_daily_overview(overview_date: date, db: Session = Depends(get_db)):
    entry = db.query(DailyEntry).filter(DailyEntry.date == overview_date).first()
    meals = db.query(Meal).filter(Meal.date == overview_date).order_by(Meal.time.asc()).all()
    exercises = db.query(Exercise).filter(Exercise.date == overview_date).all()

    # Calculate fasting hours
    fasting_hours = None
    if len(meals) >= 2:
        first_meal = meals[0].time
        last_meal = meals[-1].time
        eating_window = (last_meal - first_meal).total_seconds() / 3600
        fasting_hours = round(24 - eating_window, 1)

    return DailyOverview(
        date=overview_date,
        entry=entry,
        meals=meals,
        exercises=exercises,
        fasting_hours=fasting_hours
    )


@app.get("/api/trends/weight", response_model=List[WeightTrend])
def get_weight_trends(
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    entries = db.query(DailyEntry).filter(
        and_(
            DailyEntry.date >= start_date,
            DailyEntry.weight_kg.isnot(None)
        )
    ).order_by(DailyEntry.date.asc()).all()

    return [WeightTrend(date=e.date, weight_kg=e.weight_kg) for e in entries]


@app.get("/api/trends/energy", response_model=List[EnergyTrend])
def get_energy_trends(
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    entries = db.query(DailyEntry).filter(
        and_(
            DailyEntry.date >= start_date,
            DailyEntry.energy_level.isnot(None)
        )
    ).order_by(DailyEntry.date.asc()).all()

    return [EnergyTrend(date=e.date, energy_level=e.energy_level) for e in entries]


@app.get("/api/trends/exercise", response_model=List[ExerciseSummary])
def get_exercise_summary(
    days: int = Query(default=30, ge=7, le=365),
    db: Session = Depends(get_db)
):
    start_date = date.today() - timedelta(days=days)
    results = db.query(
        Exercise.category,
        func.sum(Exercise.duration_minutes).label("total_minutes"),
        func.count(Exercise.id).label("count")
    ).filter(
        Exercise.date >= start_date
    ).group_by(Exercise.category).all()

    return [
        ExerciseSummary(
            category=r.category,
            total_minutes=r.total_minutes or 0,
            count=r.count
        )
        for r in results
    ]


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}
