"use client";

import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useUserContext } from '../context/SupabaseAuthContext';
import { useUserActivity } from '../hooks/useUserActivity';
import Topbar from '../components/shared/Topbar';
import LeftSidebar from '../components/shared/LeftSidebar';
import Bottombar from '../components/shared/Bottombar';

// Hook to detect if we're on desktop
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkIsDesktop();
    
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return isDesktop;
}

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

const ClientLayoutWrapper = ({ children }: ClientLayoutWrapperProps) => {
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, isLoading } = useUserContext();
  const isDesktop = useIsDesktop();
  
  // Track user activity when authenticated
  useUserActivity();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = '/sign-in';
    return null;
  }

  return (
    <BrowserRouter>
      <div className="w-full md:flex">
        {isDesktop && <LeftSidebar />}
        <section className="flex flex-1 h-full">
          {children}
        </section>
        <Topbar />
        <Bottombar />
      </div>
    </BrowserRouter>
  );
};

export default ClientLayoutWrapper;
