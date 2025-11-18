'use client';

import { useEffect, useState } from 'react';

interface PlatformSettings {
  id: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean; // Employer registrations
  allowNewApplications: boolean; // Employee applications
  platformName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  updatedAt: string;
  updatedBy: string | null;
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
        method: 'PATCH',
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
          <div className="w-16 h-16 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-light text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass rounded-xl p-8 max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-300 mb-6 text-lg">{error}</p>
          <button
            onClick={fetchSettings}
            className="px-6 py-3 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all"
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
        <div className="absolute inset-0 bg-gradient-to-r from-brand-yellow/10 via-transparent to-transparent rounded-xl blur-xl" />
        <div className="relative glass rounded-xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-yellow to-brand-yellow/70 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-brand-light mb-1">Platform Settings</h1>
              <p className="text-gray-400">Configure platform-wide settings and controls</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="glass rounded-xl p-4 flex items-center gap-3 animate-slideDown border-brand-yellow/30">
          <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-brand-light font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p className="text-gray-300 font-semibold">{error}</p>
        </div>
      )}

      {/* Platform Status */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-display font-bold text-brand-light">Platform Status</h2>
        </div>

        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-lg font-display font-bold text-brand-light">Maintenance Mode</h3>
                </div>
                <p className="text-sm text-gray-400">
                  When enabled, the platform will display a maintenance message to all users
                  except admins. Use this when performing updates or maintenance.
                </p>
                {settings?.maintenanceMode && (
                  <div className="mt-3 flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm font-semibold">
                      Platform is currently in maintenance mode
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleToggle('maintenanceMode')}
                className={`ml-6 relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                  settings?.maintenanceMode ? 'bg-brand-yellow' : 'bg-gray-600'
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
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-display font-bold text-brand-light">Registration Controls</h2>
        </div>

        <div className="space-y-6">
          {/* Employee Registrations */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-display font-bold text-brand-light">
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
                      settings?.allowNewApplications ? 'bg-brand-yellow' : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-300">
                    {settings?.allowNewApplications
                      ? 'Applications are open'
                      : 'Applications are closed'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('allowNewApplications')}
                className={`ml-6 relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                  settings?.allowNewApplications ? 'bg-brand-yellow' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                    settings?.allowNewApplications
                      ? 'translate-x-7'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Employer Registrations */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-display font-bold text-brand-light">Employer Registrations</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Control whether new employers can create accounts. When disabled, the
                  employer registration form will not be accessible.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      settings?.allowNewRegistrations ? 'bg-brand-yellow' : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-300">
                    {settings?.allowNewRegistrations
                      ? 'Registrations are open'
                      : 'Registrations are closed'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('allowNewRegistrations')}
                className={`ml-6 relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                  settings?.allowNewRegistrations ? 'bg-brand-yellow' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                    settings?.allowNewRegistrations
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
          className="px-8 py-3 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-dark rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg shadow-brand-yellow/20"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Info Box */}
      <div className="glass rounded-xl p-6">
        <div className="flex gap-4">
          <svg className="w-6 h-6 text-brand-yellow flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-display font-bold text-brand-light mb-2">Important Notes</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-brand-yellow mt-1">•</span>
                <span>
                  Changes to platform settings take effect immediately after saving.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-yellow mt-1">•</span>
                <span>
                  Maintenance mode does not affect admin access - you can always access the
                  admin panel.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-yellow mt-1">•</span>
                <span>
                  Disabling registrations will hide registration forms but won't affect
                  existing users.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-yellow mt-1">•</span>
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
