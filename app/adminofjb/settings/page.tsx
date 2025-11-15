'use client';

import { useEffect, useState } from 'react';

interface PlatformSettings {
  maintenanceMode: boolean;
  allowEmployeeRegistrations: boolean;
  allowEmployerRegistrations: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/adminofjb/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        setError('Failed to fetch settings');
      }
    } catch (err) {
      setError('An error occurred while fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/adminofjb/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to update settings');
      }
    } catch (err) {
      setError('An error occurred while updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof PlatformSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FEE715] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white/5 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-red-400 mb-6 text-lg">{error}</p>
          <button
            onClick={fetchSettings}
            className="px-6 py-3 bg-[#FEE715] text-[#101820] rounded-lg font-semibold hover:bg-[#FEE715]/90 transition-all transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FEE715]/10 via-transparent to-transparent rounded-2xl blur-xl" />
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FEE715] to-[#FEE715]/70 flex items-center justify-center shadow-lg">
              <span className="text-3xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">Platform Settings</h1>
              <p className="text-gray-400">Configure platform-wide settings and controls</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-4 flex items-center gap-3 animate-slideDown">
          <span className="text-2xl">✅</span>
          <p className="text-green-400 font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {/* Platform Status */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🚦</span>
          <h2 className="text-2xl font-bold text-white">Platform Status</h2>
        </div>

        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔧</span>
                  <h3 className="text-lg font-bold text-white">Maintenance Mode</h3>
                </div>
                <p className="text-sm text-gray-400">
                  When enabled, the platform will display a maintenance message to all users
                  except admins. Use this when performing updates or maintenance.
                </p>
                {settings?.maintenanceMode && (
                  <div className="mt-3 flex items-center gap-2 text-yellow-400">
                    <span>⚠️</span>
                    <span className="text-sm font-semibold">
                      Platform is currently in maintenance mode
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleToggle('maintenanceMode')}
                className={`ml-6 relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                  settings?.maintenanceMode ? 'bg-[#FEE715]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                    settings?.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Status Summary */}
          {settings?.maintenanceMode && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <span className="text-xl">💡</span>
                <p className="text-sm font-semibold">
                  Reminder: Platform is in maintenance mode. Regular users cannot access the
                  site.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Controls */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#FEE715]/30 transition-all">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📝</span>
          <h2 className="text-2xl font-bold text-white">Registration Controls</h2>
        </div>

        <div className="space-y-6">
          {/* Employee Registrations */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">👤</span>
                  <h3 className="text-lg font-bold text-white">
                    Employee Applications
                  </h3>
                </div>
                <p className="text-sm text-gray-400">
                  Control whether job seekers can submit new applications. When disabled,
                  the application form will not be accessible.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      settings?.allowEmployeeRegistrations ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      settings?.allowEmployeeRegistrations
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {settings?.allowEmployeeRegistrations
                      ? 'Applications are open'
                      : 'Applications are closed'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('allowEmployeeRegistrations')}
                className={`ml-6 relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                  settings?.allowEmployeeRegistrations ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                    settings?.allowEmployeeRegistrations
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Employer Registrations */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-[#FEE715]/30 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏢</span>
                  <h3 className="text-lg font-bold text-white">Employer Registrations</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Control whether new employers can create accounts. When disabled, the
                  employer registration form will not be accessible.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      settings?.allowEmployerRegistrations ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      settings?.allowEmployerRegistrations
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {settings?.allowEmployerRegistrations
                      ? 'Registrations are open'
                      : 'Registrations are closed'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('allowEmployerRegistrations')}
                className={`ml-6 relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                  settings?.allowEmployerRegistrations ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                    settings?.allowEmployerRegistrations
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={fetchSettings}
          disabled={saving}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition-all border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-[#FEE715] hover:bg-[#FEE715]/90 text-[#101820] rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg shadow-[#FEE715]/20"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex gap-4">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-lg font-bold text-blue-400 mb-2">Important Notes</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Changes to platform settings take effect immediately after saving.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Maintenance mode does not affect admin access - you can always access the
                  admin panel.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  Disabling registrations will hide registration forms but won't affect
                  existing users.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>
                  All setting changes are logged in the audit trail for security purposes.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
