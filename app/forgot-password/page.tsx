"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "../../src/lib/supabase/client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../src/components/ui/form";
import { Input } from "../../src/components/ui/input";
import { Button } from "../../src/components/ui/button";
import { useToast } from "../../src/hooks/use-toast";
import Loader from "../../src/components/shared/Loader";

const ForgotPasswordValidation = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof ForgotPasswordValidation>>({
    resolver: zodResolver(ForgotPasswordValidation),
    defaultValues: {
      email: "",
    },
  });

  const handleForgotPassword = async (values: z.infer<typeof ForgotPasswordValidation>) => {
    setIsLoading(true);
    try {
      const email = values.email.toLowerCase().trim();
      
      // Check if user exists first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        toast({
          title: "Account not found",
          description: "No account exists with this email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Send password reset email with magic link
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Reset link sent! 📧",
        description: "Check your email and click the link to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Error sending reset link",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex">
        <section className="flex flex-1 justify-center items-center flex-col py-10 px-4">
          <div className="sm:w-420 flex-center flex-col text-center">
            <Image
              src="/assets/images/shadow_logo.png"
              alt="logo"
              width={270}
              height={36}
            />
            <div className="mt-8 p-6 bg-dark-3 rounded-xl">
              <h2 className="h3-bold md:h2-bold text-green-500 mb-4">
                ✅ Email Sent!
              </h2>
              <p className="text-light-2 mb-4">
                We've sent a password reset link to your email.
              </p>
              <p className="text-light-3 text-sm">
                Click the link in your email to set a new password. The link will expire in 1 hour.
              </p>
            </div>
            <Link href="/sign-in" className="text-primary-500 mt-6 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </section>
        <div className="hidden xl:block h-screen w-1/2 bg-no-repeat bg-cover bg-center bg-[url('/assets/images/side-img.svg')]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <section className="flex flex-1 justify-center items-center flex-col py-10 px-4">
        <Form {...form}>
          <div className="sm:w-420 flex-center flex-col">
            <Image
              src="/assets/images/shadow_logo.png"
              alt="logo"
              width={270}
              height={36}
            />

            <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
              Forgot Password?
            </h2>
            <p className="text-light-3 small-medium md:base-regular mt-2 text-center">
              Enter your email and we'll send you a link to reset your password
            </p>

            <form
              onSubmit={form.handleSubmit(handleForgotPassword)}
              className="flex flex-col gap-5 w-full mt-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">Email</FormLabel>
                    <FormControl>
                      <Input type="email" className="shad-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="shad-button_primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader />
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <p className="text-small-regular text-light-2 text-center mt-4">
              Remember your password?
              <Link
                href="/sign-in"
                className="text-primary-500 text-small-semibold ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Form>
      </section>

      <div className="hidden xl:block h-screen w-1/2 bg-no-repeat bg-cover bg-center bg-[url('/assets/images/side-img.svg')]" />
    </div>
  );
};

export default ForgotPasswordPage;
