import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DailyEntry from './pages/DailyEntry';
import Trends from './pages/Trends';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">*</span>
              <span className="text-xl font-bold text-white">Health Tracker</span>
            </div>
            <div className="flex space-x-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : 'nav-link'
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/entry"
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : 'nav-link'
                }
              >
                Log
              </NavLink>
              <NavLink
                to="/trends"
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : 'nav-link'
                }
              >
                Trends
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : 'nav-link'
                }
              >
                Settings
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/entry" element={<DailyEntry />} />
          <Route path="/entry/:date" element={<DailyEntry />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
