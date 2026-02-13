import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getWeightTrends, getEnergyTrends, getExerciseSummary } from '../api';

const TIME_RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 365, label: '1 year' },
];

const CATEGORY_COLORS = {
  weights: '#9333ea',
  cardio: '#dc2626',
  walking: '#16a34a',
  stretching: '#ca8a04',
};

function Trends() {
  const [days, setDays] = useState(30);
  const [weightData, setWeightData] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, [days]);

  async function loadTrends() {
    setLoading(true);
    try {
      const [weights, energy, exercises] = await Promise.all([
        getWeightTrends(days).catch(() => []),
        getEnergyTrends(days).catch(() => []),
        getExerciseSummary(days).catch(() => []),
      ]);

      setWeightData(
        weights.map((w) => ({
          ...w,
          dateStr: format(parseISO(w.date), 'MMM d'),
        }))
      );

      setEnergyData(
        energy.map((e) => ({
          ...e,
          dateStr: format(parseISO(e.date), 'MMM d'),
        }))
      );

      setExerciseData(exercises);
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate weight stats
  const weightStats = weightData.length > 0 ? {
    current: weightData[weightData.length - 1].weight_kg,
    start: weightData[0].weight_kg,
    change: (weightData[weightData.length - 1].weight_kg - weightData[0].weight_kg).toFixed(1),
    min: Math.min(...weightData.map((w) => w.weight_kg)),
    max: Math.max(...weightData.map((w) => w.weight_kg)),
  } : null;

  // Calculate energy stats
  const energyStats = energyData.length > 0 ? {
    average: (energyData.reduce((sum, e) => sum + e.energy_level, 0) / energyData.length).toFixed(1),
  } : null;

  // Calculate total exercise time
  const totalExerciseMinutes = exerciseData.reduce((sum, e) => sum + (e.total_minutes || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading trends...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Trends</h1>
        <div className="flex gap-2">
          {TIME_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDays(value)}
              className={`px-3 py-1 rounded-lg text-sm ${
                days === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Weight Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-2">Weight</h2>
        {weightStats && (
          <div className="flex gap-6 mb-4 text-sm">
            <div>
              <span className="text-gray-400">Current:</span>{' '}
              <span className="text-white font-medium">{weightStats.current} kg</span>
            </div>
            <div>
              <span className="text-gray-400">Change:</span>{' '}
              <span
                className={`font-medium ${
                  parseFloat(weightStats.change) < 0
                    ? 'text-green-400'
                    : parseFloat(weightStats.change) > 0
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              >
                {parseFloat(weightStats.change) > 0 ? '+' : ''}
                {weightStats.change} kg
              </span>
            </div>
            <div>
              <span className="text-gray-400">Range:</span>{' '}
              <span className="text-white font-medium">
                {weightStats.min} - {weightStats.max} kg
              </span>
            </div>
          </div>
        )}
        {weightData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="dateStr"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Line
                type="monotone"
                dataKey="weight_kg"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 py-8 text-center">No weight data recorded</p>
        )}
      </div>

      {/* Energy Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-2">Energy Level</h2>
        {energyStats && (
          <div className="mb-4 text-sm">
            <span className="text-gray-400">Average:</span>{' '}
            <span className="text-white font-medium">{energyStats.average} / 5</span>
          </div>
        )}
        {energyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="dateStr"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Bar
                dataKey="energy_level"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 py-8 text-center">No energy data recorded</p>
        )}
      </div>

      {/* Exercise Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-2">Exercise Summary</h2>
        {totalExerciseMinutes > 0 && (
          <div className="mb-4 text-sm">
            <span className="text-gray-400">Total time:</span>{' '}
            <span className="text-white font-medium">
              {Math.floor(totalExerciseMinutes / 60)}h {totalExerciseMinutes % 60}m
            </span>
          </div>
        )}
        {exerciseData.length > 0 ? (
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={200} className="md:w-1/2">
              <PieChart>
                <Pie
                  data={exerciseData}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, count }) => `${category}: ${count}`}
                >
                  {exerciseData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={CATEGORY_COLORS[entry.category] || '#6b7280'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {exerciseData.map((exercise) => (
                <div
                  key={exercise.category}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[exercise.category] || '#6b7280',
                      }}
                    />
                    <span className="text-gray-200 capitalize">
                      {exercise.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {exercise.count} session{exercise.count !== 1 ? 's' : ''}
                    </div>
                    {exercise.total_minutes > 0 && (
                      <div className="text-gray-400 text-sm">
                        {exercise.total_minutes} minutes
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 py-8 text-center">No exercise data recorded</p>
        )}
      </div>
    </div>
  );
}

export default Trends;
