"use client";

import { useEffect, useState, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useUserContext } from '../context/SupabaseAuthContext';
import { useUserActivity } from '../hooks/useUserActivity';
import Topbar from '../components/shared/Topbar';
import LeftSidebar from '../components/shared/LeftSidebar';
import Bottombar from '../components/shared/Bottombar';
import Loader from '../components/shared/Loader';

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

// Check if user needs onboarding (new user with incomplete profile)
function useOnboardingCheck() {
  const { user, isAuthenticated } = useUserContext();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once per session and when authenticated
    if (!isAuthenticated || !user || hasChecked.current) return;
    
    // Check if we're already on the update-profile page (avoid redirect loop)
    if (window.location.pathname.includes('/update-profile')) {
      hasChecked.current = true;
      return;
    }

    // Check if onboarding was already completed or skipped
    const onboardingKey = `shadow_onboarding_${user.id}`;
    const onboardingStatus = localStorage.getItem(onboardingKey);
    
    if (onboardingStatus === 'completed' || onboardingStatus === 'skipped') {
      hasChecked.current = true;
      return;
    }

    // Check if profile is incomplete (no bio AND no image)
    const hasIncompletProfile = !user.bio && !user.image_url;
    
    if (hasIncompletProfile) {
      // Mark as checked so we don't keep redirecting
      hasChecked.current = true;
      // Redirect to onboarding
      window.location.href = `/update-profile/${user.id}?onboarding=true`;
    } else {
      // Profile is complete, mark onboarding as done
      localStorage.setItem(onboardingKey, 'completed');
      hasChecked.current = true;
    }
  }, [isAuthenticated, user]);
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
  
  // Check if new user needs onboarding
  useOnboardingCheck();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || isLoading) {
    return (
      <div className="flex-center w-full h-screen bg-dark-1">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/sign-in';
    return null;
  }

  return (
    <BrowserRouter>
      <div className="w-full md:flex bg-dark-1">
        {isDesktop && <LeftSidebar />}
        <section className="flex flex-1 h-full w-full bg-dark-1">
          {children}
        </section>
        <Topbar />
        <Bottombar />
      </div>
    </BrowserRouter>
  );
};

export default ClientLayoutWrapper;
