import Link from "next/link";
import { Button } from "../ui/button";
import { useIsFollowing, useFollowUser, useUnfollowUser } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/SupabaseAuthContext";

type UserCardProps = {
  user: any; // TODO: Add proper Supabase user type
};

const UserCard = ({ user }: UserCardProps) => {
  const { user: currentUser } = useUserContext();
  const { data: isCurrentlyFollowing, isLoading: isFollowingLoading } = useIsFollowing(user.id);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  
  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation();
    
    if (isCurrentlyFollowing) {
      unfollowMutation.mutate(user.id);
    } else {
      followMutation.mutate(user.id);
    };
  };

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <Link 
      href={`/profile/${user.id}`} 
      className="group relative overflow-hidden bg-gradient-to-b from-dark-3 to-dark-2 border border-dark-4 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1"
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex flex-col items-center gap-3 md:gap-4">
        {/* Profile Image with ring */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full opacity-0 group-hover:opacity-75 blur transition-all duration-300" />
          <img
            src={user.image_url || "/assets/icons/profile-placeholder.svg"}
            alt={user.name}
            className="relative w-12 h-12 md:w-16 md:h-16 rounded-full object-cover ring-2 ring-dark-4 group-hover:ring-primary-500/50 transition-all duration-300"
          />
          {/* Online indicator placeholder */}
          <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-dark-2" />
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center gap-0.5 md:gap-1 text-center w-full">
          <p className="font-semibold text-light-1 text-sm md:text-base line-clamp-1 group-hover:text-white transition-colors">
            {user.name}
          </p>
          <p className="text-xs md:text-sm text-light-3 line-clamp-1">
            @{user.username}
          </p>
        </div>

        {/* Follow Button */}
        {!isOwnProfile && (
          <Button 
            type="button" 
            size="sm" 
            className={`w-full mt-1 rounded-lg md:rounded-xl font-medium text-xs md:text-sm py-2 transition-all duration-300 ${
              isCurrentlyFollowing 
                ? "bg-dark-4 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 border border-transparent text-light-2" 
                : "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            }`}
            onClick={handleFollowToggle}
            disabled={followMutation.isPending || unfollowMutation.isPending || isFollowingLoading}
          >
            {followMutation.isPending || unfollowMutation.isPending 
              ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading
                </span>
              )
              : isCurrentlyFollowing 
                ? "Following" 
                : "Follow"
            }
          </Button>
        )}

        {isOwnProfile && (
          <span className="text-xs text-primary-500 font-medium bg-primary-500/10 px-3 py-1 rounded-full">
            You
          </span>
        )}
      </div>
    </Link>
  );
};

export default UserCard;
