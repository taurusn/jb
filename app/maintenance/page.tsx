'use client';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="glass rounded-2xl p-8 md:p-12 text-center">
          {/* Maintenance Icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-brand-yellow to-brand-yellow/70 flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-brand-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-light mb-4">
            Under Maintenance
          </h1>

          {/* Message */}
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            We're currently performing scheduled maintenance to improve your experience.
          </p>

          {/* Additional Info */}
          <div className="bg-dark-400/50 rounded-lg p-6 border border-dark-300">
            <p className="text-gray-400 mb-2">
              The platform will be back online shortly.
            </p>
            <p className="text-gray-400">
              Thank you for your patience.
            </p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-brand-yellow text-brand-dark rounded-lg font-semibold hover:bg-brand-yellow/90 transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
