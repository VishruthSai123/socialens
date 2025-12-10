"use client";

import { useSearchParams } from "next/navigation";
import { use } from "react";
import AppLayout from "../../components/AppLayout";
import UpdateProfileWrapper from "../../../src/_root/pages/UpdateProfileWrapper";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default function UpdateProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  
  return (
    <AppLayout>
      <UpdateProfileWrapper params={resolvedParams} isOnboarding={isOnboarding} />
    </AppLayout>
  );
}
