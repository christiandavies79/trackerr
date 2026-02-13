import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays, parseISO } from 'date-fns';
import { getDailyOverview, getWeightTrends } from '../api';

const ENERGY_EMOJIS = ['', '😴', '😔', '😐', '🙂', '⚡'];
const ENERGY_LABELS = ['', 'Exhausted', 'Low', 'Okay', 'Good', 'Great'];
const SLEEP_QUALITY_LABELS = ['', 'Terrible', 'Poor', 'Fair', 'Good', 'Great'];
const SLEEP_QUALITY_EMOJIS = ['', '😫', '😴', '😐', '😊', '🌟'];

function Dashboard() {
  const [todayData, setTodayData] = useState(null);
  const [recentWeights, setRecentWeights] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    async function loadData() {
      try {
        const [overview, weights] = await Promise.all([
          getDailyOverview(today).catch(() => null),
          getWeightTrends(7).catch(() => []),
        ]);
        setTodayData(overview);
        setRecentWeights(weights);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [today]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const latestWeight = recentWeights.length > 0
    ? recentWeights[recentWeights.length - 1].weight_kg
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Today's Overview</h1>
          <p className="text-gray-400">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/entry" className="btn-primary">
          + Log Entry
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight Card */}
        <div className="card">
          <div className="text-gray-400 text-sm mb-1">Weight</div>
          <div className="text-3xl font-bold text-white">
            {todayData?.entry?.weight_kg
              ? `${todayData.entry.weight_kg} kg`
              : latestWeight
                ? `${latestWeight} kg`
                : '-- kg'}
          </div>
          {latestWeight && !todayData?.entry?.weight_kg && (
            <div className="text-gray-500 text-sm mt-1">Last recorded</div>
          )}
        </div>

        {/* Energy Card */}
        <div className="card">
          <div className="text-gray-400 text-sm mb-1">Energy Level</div>
          <div className="text-3xl font-bold text-white">
            {todayData?.entry?.energy_level
              ? `${ENERGY_EMOJIS[todayData.entry.energy_level]} ${ENERGY_LABELS[todayData.entry.energy_level]}`
              : '-- Not logged'}
          </div>
        </div>

        {/* Sleep Card */}
        <div className="card">
          <div className="text-gray-400 text-sm mb-1">Sleep</div>
          <div className="text-3xl font-bold text-white">
            {todayData?.entry?.sleep_hours
              ? `${todayData.entry.sleep_hours}h`
              : '-- hrs'}
          </div>
          <div className="text-gray-500 text-sm mt-1">
            {todayData?.entry?.sleep_quality
              ? `${SLEEP_QUALITY_EMOJIS[todayData.entry.sleep_quality]} ${SLEEP_QUALITY_LABELS[todayData.entry.sleep_quality]}`
              : 'Not logged'}
          </div>
        </div>

        {/* Fasting Card */}
        <div className="card">
          <div className="text-gray-400 text-sm mb-1">
            {todayData?.is_currently_fasting ? 'Current Fast' : 'Fasted'}
          </div>
          <div className="text-3xl font-bold text-white">
            {todayData?.fasting_hours
              ? `${todayData.fasting_hours}h`
              : '-- hrs'}
          </div>
          <div className="text-gray-500 text-sm mt-1">
            {todayData?.is_currently_fasting
              ? 'Still fasting...'
              : todayData?.meals?.length > 0
                ? `Broke fast at ${format(parseISO(todayData.meals[0].time), 'HH:mm')}`
                : 'No meals logged'}
          </div>
        </div>
      </div>

      {/* Today's Meals */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Today's Meals</h2>
          <Link to="/entry" className="text-blue-400 hover:text-blue-300 text-sm">
            Add meal
          </Link>
        </div>
        {todayData?.meals?.length > 0 ? (
          <div className="space-y-3">
            {todayData.meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-start space-x-4 bg-gray-700/50 rounded-lg p-3"
              >
                <div className="text-blue-400 font-mono text-sm whitespace-nowrap">
                  {format(parseISO(meal.time), 'HH:mm')}
                </div>
                <div className="text-gray-200">{meal.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No meals logged today</p>
        )}
      </div>

      {/* Today's Exercise */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Today's Exercise</h2>
          <Link to="/entry" className="text-blue-400 hover:text-blue-300 text-sm">
            Add exercise
          </Link>
        </div>
        {todayData?.exercises?.length > 0 ? (
          <div className="space-y-3">
            {todayData.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-start space-x-4 bg-gray-700/50 rounded-lg p-3"
              >
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
                <div className="flex-1 text-gray-200">{exercise.description}</div>
                {exercise.duration_minutes && (
                  <div className="text-gray-400 text-sm">
                    {exercise.duration_minutes} min
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No exercise logged today</p>
        )}
      </div>

      {/* Notes */}
      {todayData?.entry?.notes && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
          <p className="text-gray-300">{todayData.entry.notes}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
