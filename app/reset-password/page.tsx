'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '../../src/components/shared/Loader';

// This page redirects to forgot-password
// The actual password update happens via /update-password after clicking the magic link
export default function ResetPassword() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/forgot-password');
  }, [router]);

  return (
    <div className="flex-center w-full h-screen bg-dark-1">
      <Loader />
    </div>
  );
}
