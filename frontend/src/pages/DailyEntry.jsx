import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  getDailyOverview,
  updateEntry,
  createMeal,
  deleteMeal,
  createExercise,
  deleteExercise,
} from '../api';

const ENERGY_LEVELS = [
  { level: 1, emoji: '(exhausted)', label: 'Exhausted', color: 'border-red-500 bg-red-500/20' },
  { level: 2, emoji: '(tired)', label: 'Low', color: 'border-orange-500 bg-orange-500/20' },
  { level: 3, emoji: '(neutral)', label: 'Okay', color: 'border-yellow-500 bg-yellow-500/20' },
  { level: 4, emoji: '(happy)', label: 'Good', color: 'border-green-500 bg-green-500/20' },
  { level: 5, emoji: '(energetic)', label: 'Great', color: 'border-emerald-500 bg-emerald-500/20' },
];

const SLEEP_QUALITY_LEVELS = [
  { level: 1, label: 'Terrible', color: 'border-red-500 bg-red-500/20' },
  { level: 2, label: 'Poor', color: 'border-orange-500 bg-orange-500/20' },
  { level: 3, label: 'Fair', color: 'border-yellow-500 bg-yellow-500/20' },
  { level: 4, label: 'Good', color: 'border-green-500 bg-green-500/20' },
  { level: 5, label: 'Great', color: 'border-emerald-500 bg-emerald-500/20' },
];

const EXERCISE_CATEGORIES = [
  { id: 'weights', label: 'Weights', color: 'bg-purple-600' },
  { id: 'cardio', label: 'Cardio', color: 'bg-red-600' },
  { id: 'walking', label: 'Walking', color: 'bg-green-600' },
  { id: 'stretching', label: 'Stretching', color: 'bg-yellow-600' },
];

function DailyEntry() {
  const { date: paramDate } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(
    paramDate || format(new Date(), 'yyyy-MM-dd')
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [weight, setWeight] = useState('');
  const [energyLevel, setEnergyLevel] = useState(null);
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState(null);
  const [notes, setNotes] = useState('');
  const [meals, setMeals] = useState([]);
  const [exercises, setExercises] = useState([]);

  // New entry forms
  const [newMealTime, setNewMealTime] = useState(format(new Date(), 'HH:mm'));
  const [newMealDesc, setNewMealDesc] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('weights');
  const [newExerciseDesc, setNewExerciseDesc] = useState('');
  const [newExerciseDuration, setNewExerciseDuration] = useState('');

  useEffect(() => {
    loadDayData();
  }, [selectedDate]);

  async function loadDayData() {
    setLoading(true);
    try {
      const data = await getDailyOverview(selectedDate);
      if (data.entry) {
        setWeight(data.entry.weight_kg?.toString() || '');
        setEnergyLevel(data.entry.energy_level);
        setSleepHours(data.entry.sleep_hours?.toString() || '');
        setSleepQuality(data.entry.sleep_quality);
        setNotes(data.entry.notes || '');
      } else {
        setWeight('');
        setEnergyLevel(null);
        setSleepHours('');
        setSleepQuality(null);
        setNotes('');
      }
      setMeals(data.meals || []);
      setExercises(data.exercises || []);
    } catch (error) {
      console.error('Failed to load day data:', error);
      setWeight('');
      setEnergyLevel(null);
      setSleepHours('');
      setSleepQuality(null);
      setNotes('');
      setMeals([]);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveEntry() {
    setSaving(true);
    try {
      await updateEntry(selectedDate, {
        weight_kg: weight ? parseFloat(weight) : null,
        energy_level: energyLevel,
        sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
        sleep_quality: sleepQuality,
        notes: notes || null,
      });
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setSaving(false);
    }
  }

  async function addMeal() {
    if (!newMealDesc.trim()) return;

    try {
      const mealDateTime = `${selectedDate}T${newMealTime}:00`;
      await createMeal({
        date: selectedDate,
        time: mealDateTime,
        description: newMealDesc.trim(),
      });
      setNewMealDesc('');
      loadDayData();
    } catch (error) {
      console.error('Failed to add meal:', error);
    }
  }

  async function removeMeal(id) {
    try {
      await deleteMeal(id);
      loadDayData();
    } catch (error) {
      console.error('Failed to delete meal:', error);
    }
  }

  async function addExercise() {
    if (!newExerciseDesc.trim()) return;

    try {
      await createExercise({
        date: selectedDate,
        category: newExerciseCategory,
        description: newExerciseDesc.trim(),
        duration_minutes: newExerciseDuration ? parseInt(newExerciseDuration) : null,
      });
      setNewExerciseDesc('');
      setNewExerciseDuration('');
      loadDayData();
    } catch (error) {
      console.error('Failed to add exercise:', error);
    }
  }

  async function removeExercise(id) {
    try {
      await deleteExercise(id);
      loadDayData();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Log Entry</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input w-auto"
        />
      </div>

      {/* Weight */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Weight</h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            step="0.1"
            placeholder="Enter weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={saveEntry}
            className="input w-40"
          />
          <span className="text-gray-400">kg</span>
        </div>
      </div>

      {/* Energy Level */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Energy Level</h2>
        <div className="flex flex-wrap gap-3">
          {ENERGY_LEVELS.map(({ level, emoji, label, color }) => (
            <button
              key={level}
              onClick={() => {
                setEnergyLevel(level);
                setTimeout(saveEntry, 0);
              }}
              className={`energy-btn ${
                energyLevel === level
                  ? color
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              title={label}
            >
              <span className="text-xs">{level}</span>
            </button>
          ))}
        </div>
        {energyLevel && (
          <p className="text-gray-400 mt-2">
            {ENERGY_LEVELS.find((e) => e.level === energyLevel)?.label}
          </p>
        )}
      </div>

      {/* Sleep */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Sleep (night before)</h2>
        <div className="space-y-4">
          <div>
            <label className="label block mb-2">Hours of Sleep</label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="Hours"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                onBlur={saveEntry}
                className="input w-40"
              />
              <span className="text-gray-400">hours</span>
            </div>
          </div>
          <div>
            <label className="label block mb-2">How refreshed do you feel?</label>
            <div className="flex flex-wrap gap-3">
              {SLEEP_QUALITY_LEVELS.map(({ level, label, color }) => (
                <button
                  key={level}
                  onClick={() => {
                    setSleepQuality(level);
                    setTimeout(saveEntry, 0);
                  }}
                  className={`energy-btn ${
                    sleepQuality === level
                      ? color
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  title={label}
                >
                  <span className="text-xs">{level}</span>
                </button>
              ))}
            </div>
            {sleepQuality && (
              <p className="text-gray-400 mt-2">
                {SLEEP_QUALITY_LEVELS.find((s) => s.level === sleepQuality)?.label}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Meals</h2>

        {/* Existing meals */}
        {meals.length > 0 && (
          <div className="space-y-2 mb-4">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-blue-400 font-mono text-sm">
                    {format(parseISO(meal.time), 'HH:mm')}
                  </span>
                  <span className="text-gray-200">{meal.description}</span>
                </div>
                <button
                  onClick={() => removeMeal(meal.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Fasting info */}
        {meals.length >= 2 && (
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 mb-4">
            <p className="text-blue-300 text-sm">
              Eating window: {format(parseISO(meals[0].time), 'HH:mm')} -{' '}
              {format(parseISO(meals[meals.length - 1].time), 'HH:mm')}
              {' | '}
              Fasting: ~
              {Math.round(
                24 -
                  (parseISO(meals[meals.length - 1].time) -
                    parseISO(meals[0].time)) /
                    (1000 * 60 * 60)
              )}
              h
            </p>
          </div>
        )}

        {/* Add new meal */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="time"
            value={newMealTime}
            onChange={(e) => setNewMealTime(e.target.value)}
            className="input w-32"
          />
          <input
            type="text"
            placeholder="What did you eat?"
            value={newMealDesc}
            onChange={(e) => setNewMealDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMeal()}
            className="input flex-1"
          />
          <button onClick={addMeal} className="btn-primary whitespace-nowrap">
            Add Meal
          </button>
        </div>
      </div>

      {/* Exercise */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Exercise</h2>

        {/* Existing exercises */}
        {exercises.length > 0 && (
          <div className="space-y-2 mb-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
              >
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      exercise.category === 'weights'
                        ? 'bg-purple-600/30 text-purple-300'
                        : exercise.category === 'cardio'
                        ? 'bg-red-600/30 text-red-300'
                        : exercise.category === 'walking'
                        ? 'bg-green-600/30 text-green-300'
                        : 'bg-yellow-600/30 text-yellow-300'
                    }`}
                  >
                    {exercise.category}
                  </span>
                  <span className="text-gray-200">{exercise.description}</span>
                  {exercise.duration_minutes && (
                    <span className="text-gray-400 text-sm">
                      ({exercise.duration_minutes} min)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new exercise */}
        <div className="space-y-3">
          {/* Category selector */}
          <div className="flex flex-wrap gap-2">
            {EXERCISE_CATEGORIES.map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => setNewExerciseCategory(id)}
                className={`category-chip ${
                  newExerciseCategory === id
                    ? `${color} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Describe your exercise"
              value={newExerciseDesc}
              onChange={(e) => setNewExerciseDesc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExercise()}
              className="input flex-1"
            />
            <input
              type="number"
              placeholder="Duration (min)"
              value={newExerciseDuration}
              onChange={(e) => setNewExerciseDuration(e.target.value)}
              className="input w-32"
            />
            <button onClick={addExercise} className="btn-primary whitespace-nowrap">
              Add Exercise
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
        <textarea
          placeholder="Any notes for today?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveEntry}
          className="input min-h-[100px] resize-y"
        />
      </div>

      {/* Save indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-gray-300 px-4 py-2 rounded-lg shadow-lg">
          Saving...
        </div>
      )}
    </div>
  );
}

export default DailyEntry;
