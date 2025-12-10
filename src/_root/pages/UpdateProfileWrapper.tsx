"use client";

import React, { useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Textarea, Input, Button } from "@/components/ui";

import { ProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/SupabaseAuthContext";
import { useGetUserById, useUpdateUser, useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import ProfileUploader from "@/components/shared/ProfileUploader";

type UpdateProfileWrapperProps = {
  params: { id: string };
  isOnboarding?: boolean;
};

const UpdateProfileWrapper = ({ params, isOnboarding = false }: UpdateProfileWrapperProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const { id } = params;
  const { user, setUser } = useUserContext();
  
  // Queries
  const { data: currentUser } = useGetUserById(id || "");
  const { refetch: refetchCurrentUser } = useGetCurrentUser();
  const { mutateAsync: updateUser, isPending: isLoadingUpdate } = useUpdateUser();

  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: "",
      username: "",
      email: "",
      bio: "",
    },
  });

  // Update form when currentUser data loads
  useEffect(() => {
    if (currentUser) {
      form.reset({
        file: [],
        name: currentUser.name || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser, form]);

  if (!currentUser) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  // Handle Update Profile
  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    try {
      const updateData: any = {
        userId: currentUser.id,
        name: value.name,
        username: currentUser.username, 
        email: currentUser.email,
        bio: value.bio,
        file: value.file,
        imageUrl: currentUser.image_url,
      };

      const updatedUser = await updateUser(updateData);

      if (!updatedUser) {
        toast({
          title: "Update user failed. Please try again.",
        });
        return;
      }

      // Update user context with proper null handling
      if (user) {
        setUser({
          ...user,
          name: updatedUser.name,
          bio: updatedUser.bio,
          image_url: updatedUser.image_url,
        });
      }

      await refetchCurrentUser();
      
      // Mark onboarding as completed
      if (isOnboarding && currentUser?.id) {
        localStorage.setItem(`shadow_onboarding_${currentUser.id}`, 'completed');
      }
      
      toast({
        title: isOnboarding ? "Welcome to Shadow!" : "Profile updated successfully!",
      });
      
      router.push(isOnboarding ? '/' : `/profile/${id}`);
    } catch (error) {
      console.log({ error });
      toast({
        title: "Update user failed. Please try again.",
      });
    }
  };

  const handleSkip = () => {
    // Mark onboarding as skipped so we don't redirect back
    if (isOnboarding && currentUser?.id) {
      localStorage.setItem(`shadow_onboarding_${currentUser.id}`, 'skipped');
    }
    router.push('/');
  };

  return (
    <div className="flex flex-1">
      <div className="common-container pb-32 md:pb-12">
        {/* Header Section - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full max-w-5xl">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src="/assets/icons/edit.svg"
              width={28}
              height={28}
              alt="edit"
              className="invert-white flex-shrink-0 sm:w-9 sm:h-9"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-left truncate">
                {isOnboarding ? "Complete Your Profile" : "Edit Profile"}
              </h2>
              {isOnboarding && (
                <p className="text-light-3 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  Add a photo and bio to help others find you
                </p>
              )}
            </div>
          </div>
          {isOnboarding && (
            <Button
              type="button"
              onClick={handleSkip}
              variant="ghost"
              className="text-light-3 hover:text-light-1 text-sm self-start sm:self-center mt-1 sm:mt-0 -ml-1 sm:ml-0"
            >
              Skip for now →
            </Button>
          )}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={currentUser.image_url}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <div className="flex gap-4 items-center justify-end pt-6 pb-4">
              {isOnboarding ? (
                <>
                  <Button
                    type="button"
                    className="shad-button_dark_4"
                    onClick={handleSkip}
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="submit"
                    className="shad-button_primary whitespace-nowrap"
                    disabled={isLoadingUpdate}
                  >
                    {isLoadingUpdate && <Loader />}
                    Save & Continue
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    className="shad-button_dark_4"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="shad-button_primary whitespace-nowrap"
                    disabled={isLoadingUpdate}
                  >
                    {isLoadingUpdate && <Loader />}
                    Update Profile
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfileWrapper;
