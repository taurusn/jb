'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

// Default loading component
const DefaultLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-dark">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-brand-yellow border-t-transparent mb-4"></div>
      <p className="text-brand-light font-medium">Verifying authentication...</p>
    </div>
  </div>
);

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = '/login',
  loadingComponent,
}) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication by making a request to a protected endpoint
        // or by checking if a valid token exists
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  // Show loading state
  if (isLoading || isAuthenticated === null) {
    return loadingComponent || <DefaultLoader />;
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Show protected content if authenticated
  return <>{children}</>;
};

export default AuthGuard;