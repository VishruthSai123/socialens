"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/SupabaseAuthContext";
import { useSignOutAccount, useCheckAdminAccess } from "@/lib/react-query/queriesAndMutations";
import NotificationBell from "@/components/shared/NotificationBell";

const Topbar = () => {
  const router = useRouter();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const { data: isAdmin } = useCheckAdminAccess();

  useEffect(() => {
    if (isSuccess) router.push("/sign-in");
  }, [isSuccess, router]);

  return (
    <section className="topbar">
      <div className="flex-between py-3 px-4">
        <Link href="/" className="flex gap-2 items-center">
          <img
            src="/assets/images/shadow_logo.png"
            alt="logo"
            width={120}
            height={300}
            className="md:w-[140px]"
          />
        </Link>

        <div className="flex gap-2 items-center">
          <NotificationBell />
          
          {/* Admin Button - only show if user has admin access */}
          {isAdmin && (
            <Link href="/admin">
              <Button
                className="shad-button_ghost p-2"
                title="Admin Dashboard"
              >
                <img 
                  src="/assets/icons/filter.svg" 
                  alt="admin" 
                  width={20}
                  height={20}
                  className="md:w-[22px] md:h-[22px]"
                />
              </Button>
            </Link>
          )}
          
          <Button
            className="shad-button_ghost p-2"
            onClick={() => signOut()}>
            <img src="/assets/icons/logout.svg" alt="logout" width={20} height={20} className="md:w-[22px] md:h-[22px]" />
          </Button>
          <Link href={`/profile/${user?.id}`} className="flex-center">
            <img
              src={user?.image_url || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 md:h-9 md:w-9 rounded-full object-cover"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
