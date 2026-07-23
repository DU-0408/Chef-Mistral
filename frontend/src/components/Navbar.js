"use client";

/**
 * Navbar component — Stitch light theme sticky top navigation.
 * Shows nav links + avatar when authenticated, CTA buttons when not.
 */

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-surface-container-lowest sticky top-0 w-full border-b border-outline-variant z-50">
      <div className="flex justify-between items-center h-16 px-4 md:px-10 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-on-background tracking-tight">
            Chef Qwen
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/pantry" 
              className={`font-body-md text-body-md transition-colors cursor-pointer active:scale-95 transition-transform py-5 ${
                pathname === "/pantry" 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              Pantry
            </Link>
            <Link 
              href="/recipes" 
              className={`font-body-md text-body-md transition-colors cursor-pointer active:scale-95 transition-transform py-5 ${
                pathname === "/recipes" 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              My Recipes
            </Link>
            <Link 
              href="/chef" 
              className={`font-body-md text-body-md transition-colors cursor-pointer active:scale-95 transition-transform py-5 ${
                pathname === "/chef" 
                  ? "text-primary border-b-2 border-primary pb-1" 
                  : "text-secondary hover:text-primary"
              }`}
            >
              Chef
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="text-secondary hover:text-primary transition-colors cursor-pointer active:scale-95 transition-transform flex items-center justify-center"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>
          
          <button className="text-secondary hover:text-primary transition-colors cursor-pointer active:scale-95 transition-transform hidden sm:flex items-center justify-center">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/profile"
                className="text-secondary hover:text-primary transition-colors cursor-pointer active:scale-95 transition-transform hidden sm:flex items-center justify-center"
              >
                <span className="material-symbols-outlined">settings</span>
              </Link>
              <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant cursor-pointer" onClick={() => router.push('/profile')}>
                <div className="w-full h-full flex items-center justify-center bg-primary-container text-on-primary-container font-label-sm text-label-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-1.5 rounded-DEFAULT font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-highest transition-colors active:scale-95 ml-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="bg-transparent border border-outline-variant text-on-background px-4 py-2 rounded-DEFAULT font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-low transition-colors active:scale-95"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-primary-container text-on-primary-container px-4 py-2 rounded-DEFAULT font-label-sm text-label-sm uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
