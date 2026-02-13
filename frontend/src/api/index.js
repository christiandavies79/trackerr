const STORAGE_KEY = 'health-tracker-server-url';

// Get the configured server URL, or empty string for relative URLs
export function getServerUrl() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setServerUrl(url) {
  if (url) {
    // Normalize: remove trailing slash
    const normalized = url.replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY, normalized);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getApiBase() {
  const serverUrl = getServerUrl();
  return serverUrl ? `${serverUrl}/api` : '/api';
}

async function fetchAPI(endpoint, options = {}) {
  const apiBase = getApiBase();

  const response = await fetch(`${apiBase}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'API request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Test connection to server
export async function testConnection(serverUrl) {
  const apiBase = serverUrl ? `${serverUrl}/api` : '/api';
  try {
    const response = await fetch(`${apiBase}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Daily Entries
export const getEntries = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  return fetchAPI(`/entries?${params}`);
};

export const getEntry = (date) => fetchAPI(`/entries/${date}`);

export const createEntry = (data) =>
  fetchAPI('/entries', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateEntry = (date, data) =>
  fetchAPI(`/entries/${date}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteEntry = (date) =>
  fetchAPI(`/entries/${date}`, { method: 'DELETE' });

// Meals
export const getMeals = (date) => {
  const params = new URLSearchParams();
  if (date) params.append('meal_date', date);
  return fetchAPI(`/meals?${params}`);
};

export const createMeal = (data) =>
  fetchAPI('/meals', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateMeal = (id, data) =>
  fetchAPI(`/meals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteMeal = (id) =>
  fetchAPI(`/meals/${id}`, { method: 'DELETE' });

// Exercises
export const getExercises = (date, category) => {
  const params = new URLSearchParams();
  if (date) params.append('exercise_date', date);
  if (category) params.append('category', category);
  return fetchAPI(`/exercises?${params}`);
};

export const createExercise = (data) =>
  fetchAPI('/exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateExercise = (id, data) =>
  fetchAPI(`/exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteExercise = (id) =>
  fetchAPI(`/exercises/${id}`, { method: 'DELETE' });

// Daily Overview
export const getDailyOverview = (date) => fetchAPI(`/daily/${date}`);

// Trends
export const getWeightTrends = (days = 30) =>
  fetchAPI(`/trends/weight?days=${days}`);

export const getEnergyTrends = (days = 30) =>
  fetchAPI(`/trends/energy?days=${days}`);

export const getExerciseSummary = (days = 30) =>
  fetchAPI(`/trends/exercise?days=${days}`);

export const getSleepTrends = (days = 30) =>
  fetchAPI(`/trends/sleep?days=${days}`);
