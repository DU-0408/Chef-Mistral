"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getMe } from "@/lib/api";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithToken } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Handle Google OAuth callback: ?token=xxx&google=true
  useEffect(() => {
    const token = searchParams.get("token");
    const isGoogle = searchParams.get("google");
    if (token && isGoogle) {
      // Validate token by fetching user info, then store it
      getMe(token)
        .then((userData) => {
          loginWithToken(token, userData);
          router.push("/chef");
        })
        .catch(() => {
          setError("Google authentication failed. Please try again.");
        });
    }
  }, [searchParams, loginWithToken, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const success = await login(email, password);
    if (success) {
      router.push("/chef");
    } else {
      setError("Invalid credentials");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-none overflow-hidden relative">
          {/* Header / Brand */}
          <div className="p-8 pb-6 text-center border-b border-surface-container-low">
            <h1 className="font-headline-lg text-headline-lg text-on-background">Chef Qwen</h1>
            <p className="font-body-md text-body-md text-secondary mt-2">Access your culinary workspace.</p>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-outline-variant bg-surface-bright">
            <div className="flex-1 py-4 text-center border-b-2 border-primary-container text-on-surface font-label-sm text-label-sm transition-colors hover:bg-surface-container-low cursor-default">SIGN IN</div>
            <Link href="/register" className="flex-1 py-4 text-center border-b-2 border-transparent text-secondary font-label-sm text-label-sm transition-colors hover:bg-surface-container-low">SIGN UP</Link>
          </div>
          
          {/* Form Area */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container text-body-md rounded font-body-md border border-error/20">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="email">Email Address</label>
                <div className="relative focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container/20 border border-outline-variant bg-surface-container-lowest transition-colors">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary" style={{ fontVariationSettings: "'FILL' 0" }}>mail</span>
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-transparent border-none text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-surface-dim" 
                    id="email" 
                    name="email" 
                    placeholder="chef@example.com" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="password">Password</label>
                  <a className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer">Forgot password?</a>
                </div>
                <div className="relative focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container/20 border border-outline-variant bg-surface-container-lowest transition-colors">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary" style={{ fontVariationSettings: "'FILL' 0" }}>lock</span>
                  <input 
                    className="w-full pl-10 pr-10 py-3 bg-transparent border-none text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-surface-dim" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              
              <button 
                className="w-full bg-btn-primary text-on-btn-primary py-3 font-label-sm text-label-sm uppercase tracking-wider transition-all hover:border-b-2 hover:border-primary-container active:scale-95" 
                type="submit"
              >
                Sign In
              </button>
            </form>
            
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-surface-container-lowest text-secondary font-label-sm text-label-sm uppercase">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-transparent border border-outline-variant py-3 text-on-surface font-label-sm text-label-sm uppercase transition-colors hover:bg-surface-container-low active:scale-95 cursor-pointer"
                >
                  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21528 6.86 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
                    <path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z" fill="#34A853"></path>
                  </svg>
                  Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
