import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  console.log('Callback route params:', { code, type, error, error_description });

  // Handle errors from Supabase
  if (error) {
    console.error('Supabase auth error:', { error, error_description });
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    console.log('Processing authentication code...');
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!authError && data?.user) {
      console.log('Authentication successful for user:', data.user.email);
      
      // Check if this is a password recovery flow
      if (type === 'recovery') {
        console.log('Password recovery flow detected, redirecting to update-password');
        return NextResponse.redirect(`${origin}/update-password`);
      }
      
      // Regular authentication/signup confirmation - redirect to home
      console.log('Redirecting to home page...');
      return NextResponse.redirect(`${origin}/`);
    } else {
      console.error('Authentication error:', authError);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(authError?.message || 'Authentication failed')}`);
    }
  }

  console.log('No valid authentication code found, redirecting to error page');
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=Invalid authentication link`);
}
