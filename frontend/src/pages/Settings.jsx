import { useState, useEffect } from 'react';
import { getServerUrl, setServerUrl, testConnection, getApiBase } from '../api';

function Settings() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, testing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    setUrl(getServerUrl());
  }, []);

  async function handleTest() {
    setStatus('testing');
    setMessage('Testing connection...');

    const isConnected = await testConnection(url);

    if (isConnected) {
      setStatus('success');
      setMessage('Connection successful!');
    } else {
      setStatus('error');
      setMessage('Could not connect to server. Check the URL and try again.');
    }
  }

  function handleSave() {
    setServerUrl(url);
    setStatus('success');
    setMessage('Settings saved! The app will now use this server.');
  }

  function handleReset() {
    setUrl('');
    setServerUrl('');
    setStatus('idle');
    setMessage('Reset to default (relative URLs).');
  }

  const currentApiBase = getApiBase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure your Health Tracker</p>
      </div>

      {/* Server Configuration */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Server Connection</h2>

        <div className="space-y-4">
          <div>
            <label className="label">Server URL</label>
            <input
              type="url"
              placeholder="https://your-server.com:8080"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setStatus('idle');
                setMessage('');
              }}
              className="input"
            />
            <p className="text-gray-500 text-sm mt-1">
              Leave empty to use relative URLs (when accessing the app directly from the server)
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400 text-sm">
              <span className="text-gray-300 font-medium">Current API endpoint:</span>{' '}
              <code className="text-blue-400">{currentApiBase}</code>
            </p>
          </div>

          {/* Status message */}
          {message && (
            <div
              className={`rounded-lg p-3 ${
                status === 'success'
                  ? 'bg-green-600/20 border border-green-500/30 text-green-300'
                  : status === 'error'
                  ? 'bg-red-600/20 border border-red-500/30 text-red-300'
                  : 'bg-blue-600/20 border border-blue-500/30 text-blue-300'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleTest}
              disabled={status === 'testing'}
              className="btn-secondary"
            >
              {status === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            <button onClick={handleSave} className="btn-primary">
              Save Settings
            </button>
            <button onClick={handleReset} className="btn-secondary">
              Reset to Default
            </button>
          </div>
        </div>
      </div>

      {/* PWA Installation Help */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Install as App</h2>
        <div className="space-y-3 text-gray-300">
          <p>To install this app on your device:</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>
              <span className="text-gray-300">On iPhone/iPad:</span> Tap the Share button, then "Add to Home Screen"
            </li>
            <li>
              <span className="text-gray-300">On Android:</span> Tap the menu (three dots), then "Install app" or "Add to Home screen"
            </li>
            <li>
              <span className="text-gray-300">On Desktop:</span> Look for the install icon in your browser's address bar
            </li>
          </ol>
          <p className="text-gray-500 text-sm mt-4">
            After installing, configure the server URL above to connect to your self-hosted instance.
          </p>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">About</h2>
        <div className="text-gray-400 space-y-2">
          <p>Health Tracker - Personal health and fitness tracking</p>
          <p className="text-sm">
            Track your meals, exercise, weight, and energy levels. All data is stored on your own server.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
