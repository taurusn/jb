'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components';

export default function ViewDocumentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fileUrl = searchParams.get('file');
  const candidateName = searchParams.get('name') || 'Candidate';

  useEffect(() => {
    if (!fileUrl) {
      setError('No file specified');
      setLoading(false);
    } else {
      // Validate file access by making a HEAD request
      fetch(`/api/files/view?file=${encodeURIComponent(fileUrl)}`, {
        method: 'HEAD',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('File not accessible');
          }
          setLoading(false);
        })
        .catch(() => {
          setError('File not found or access denied');
          setLoading(false);
        });
    }
  }, [fileUrl]);

  const handleBack = () => {
    router.back();
  };

  const handleDownload = () => {
    if (fileUrl) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = `/api/files/view?file=${encodeURIComponent(fileUrl)}`;
      link.download = `${candidateName.replace(/\s+/g, '_')}_Resume`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-light">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <svg className="w-16 h-16 text-accent-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-xl font-semibold text-brand-light mb-2">Document Not Available</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={handleBack} variant="primary">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="bg-dark-400 border-b border-dark-300 px-2 sm:px-4 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-sm sm:text-lg font-semibold text-brand-light truncate">
            {candidateName}'s Resume
          </h1>
          
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
          >
            <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </header>

      {/* Document Viewer */}
      <div className="flex-1 p-1 sm:p-4">
        <div className="w-full h-full">
          <div className="bg-white rounded-none sm:rounded-lg shadow-2xl overflow-hidden h-full" style={{ height: 'calc(100vh - 60px)' }}>
            {fileUrl && (
              <iframe
                src={`/api/files/view?file=${encodeURIComponent(fileUrl)}`}
                className="w-full h-full border-0"
                title={`${candidateName}'s Resume`}
                onLoad={() => setLoading(false)}
                onError={() => setError('Failed to load document')}
                style={{
                  transform: 'scale(1)',
                  transformOrigin: 'top left',
                  minHeight: '100%'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}