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
            width={100}
            height={250}
            className="md:w-[130px]"
          />
        </Link>

        <div className="flex gap-1.5 md:gap-2 items-center">
          <NotificationBell />
          
          {/* Admin Button - only show if user has admin access */}
          {isAdmin && (
            <Link href="/admin">
              <Button
                className="shad-button_ghost p-1.5 md:p-2"
                title="Admin Dashboard"
              >
                <img 
                  src="/assets/icons/filter.svg" 
                  alt="admin" 
                  width={16}
                  height={16}
                  className="md:w-[18px] md:h-[18px]"
                />
              </Button>
            </Link>
          )}
          
          <Button
            className="shad-button_ghost p-1.5 md:p-2"
            onClick={() => signOut()}>
            <img src="/assets/icons/logout.svg" alt="logout" width={16} height={16} className="md:w-[18px] md:h-[18px]" />
          </Button>
          <Link href={`/profile/${user?.id}`} className="flex-center">
            <img
              src={user?.image_url || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-6 w-6 md:h-7 md:w-7 rounded-full object-cover"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
