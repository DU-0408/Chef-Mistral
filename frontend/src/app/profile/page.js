"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMe, updateProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingItems, setLoadingItems] = useState(true);

  const router = useRouter();
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  async function fetchProfile() {
    try {
      const data = await getMe(token);
      setUsername(data.username || "");
      setEmail(data.email || "");
      setDietaryRestrictions(data.dietary_restrictions || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingItems(false);
    }
  }

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await updateProfile(token, dietaryRestrictions);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <Navbar />
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Side Navigation (Settings Categories) */}
        <aside className="md:col-span-3 mb-8 md:mb-0">
          <div className="md:sticky md:top-24">
            <h2 className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4">Account Settings</h2>
            <ul className="space-y-1 font-body-md text-body-md">
              <li>
                <a className="block px-3 py-2 bg-surface-bright border-l-2 border-primary-container text-on-background font-medium cursor-pointer">
                  Profile &amp; Identity
                </a>
              </li>
              <li>
                <a className="block px-3 py-2 text-secondary hover:bg-surface-bright hover:text-on-background transition-colors border-l-2 border-transparent cursor-pointer">
                  Preferences
                </a>
              </li>
              <li>
                <a className="block px-3 py-2 text-secondary hover:bg-surface-bright hover:text-on-background transition-colors border-l-2 border-transparent cursor-pointer">
                  Notifications
                </a>
              </li>
              <li>
                <a className="block px-3 py-2 text-secondary hover:bg-surface-bright hover:text-on-background transition-colors border-l-2 border-transparent cursor-pointer">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* Settings Content */}
        <div className="md:col-span-9 space-y-8">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-2">Profile &amp; Identity</h1>
            <p className="font-body-lg text-body-lg text-secondary">Manage your public persona and core account details.</p>
          </div>

          {loadingItems ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-2 border-outline-variant border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-error-container border border-error/20 p-4 text-on-error-container text-body-md rounded-DEFAULT">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-primary-container/30 border border-primary/30 p-4 text-primary text-body-md rounded-DEFAULT font-medium">
                  {success}
                </div>
              )}

              {/* Profile Section */}
              <section className="bg-surface-container-lowest border border-outline-variant p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Avatar Placeholder */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high flex items-center justify-center relative group cursor-pointer">
                      <span className="text-[48px] text-secondary font-medium">
                        {username ? username.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || "U"}
                      </span>
                      <div className="absolute inset-0 bg-on-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-on-primary">photo_camera</span>
                      </div>
                    </div>
                    <button className="font-label-sm text-label-sm border border-outline-variant bg-transparent text-on-background hover:bg-surface-bright px-4 py-2 uppercase tracking-wide transition-colors rounded-DEFAULT cursor-pointer">
                      Change Avatar
                    </button>
                  </div>
                  
                  {/* Core Details Form */}
                  <div className="flex-grow w-full space-y-6">
                    <div>
                      <label className="block font-label-sm text-label-sm text-secondary uppercase mb-2" htmlFor="displayName">Username</label>
                      <input 
                        id="displayName" 
                        type="text" 
                        className="w-full p-3 font-body-md text-body-md border border-outline-variant bg-surface-container-lowest text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/10 transition-all rounded-DEFAULT" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        readOnly // Backend might not support updating this yet
                      />
                      <p className="mt-1 font-mono-label text-mono-label text-secondary">This is how you will appear to other users.</p>
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-secondary uppercase mb-2" htmlFor="email">Email Address</label>
                      <div className="flex relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-secondary text-[20px]">mail</span>
                        <input 
                          id="email" 
                          type="email" 
                          className="w-full p-3 pl-10 font-body-md text-body-md border border-outline-variant bg-surface-variant text-on-surface focus:outline-none rounded-DEFAULT opacity-70" 
                          value={user?.email || ""}
                          readOnly 
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                      <span className="font-label-sm text-label-sm text-primary uppercase">Account Active &amp; Verified</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Dietary Preferences Section */}
              <section className="bg-surface-container-lowest border border-outline-variant p-6 md:p-8">
                <div className="border-b border-surface-variant pb-4 mb-6">
                  <h3 className="font-headline-md text-headline-md text-on-background">Dietary Preferences</h3>
                  <p className="font-body-md text-body-md text-secondary mt-1">Specify permanent restrictions or preferences. These will be applied to all generated recipes.</p>
                </div>
                <div className="space-y-4">
                  <label className="block font-label-sm text-label-sm text-secondary uppercase mb-2" htmlFor="dietaryNotes">Permanent Restrictions &amp; Notes</label>
                  <textarea 
                    id="dietaryNotes" 
                    className="w-full p-3 font-body-md text-body-md border border-outline-variant bg-surface-container-lowest text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/10 transition-all rounded-DEFAULT" 
                    placeholder="e.g., No Peanuts, Vegan, Gluten-Free..." 
                    rows="4"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                  ></textarea>
                </div>
              </section>

              {/* Security Section */}
              <section className="bg-surface-container-lowest border border-outline-variant p-6 md:p-8 opacity-60">
                <div className="border-b border-surface-variant pb-4 mb-6">
                  <h3 className="font-headline-md text-headline-md text-on-background">Security</h3>
                  <p className="font-body-md text-body-md text-secondary mt-1">Manage your password and account lifecycle. (Coming Soon)</p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                      <label className="block font-label-sm text-label-sm text-secondary uppercase mb-2">Current Password</label>
                      <input className="w-full p-3 font-body-md text-body-md border border-outline-variant bg-surface-container-lowest text-on-background rounded-DEFAULT" placeholder="••••••••" type="password" disabled />
                    </div>
                    <div>
                      <label className="block font-label-sm text-label-sm text-secondary uppercase mb-2">New Password</label>
                      <input className="w-full p-3 font-body-md text-body-md border border-outline-variant bg-surface-container-lowest text-on-background rounded-DEFAULT" placeholder="••••••••" type="password" disabled />
                    </div>
                  </div>
                  <button disabled className="font-label-sm text-label-sm border border-outline-variant bg-transparent text-on-background px-4 py-2 uppercase tracking-wide rounded-DEFAULT">Update Password</button>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-error p-6 md:p-8">
                <div className="border-b border-error/20 pb-4 mb-6">
                  <h3 className="font-headline-md text-headline-md text-error">Danger Zone</h3>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="font-body-md text-body-md text-on-background font-medium">Delete Account</p>
                    <p className="font-body-md text-body-md text-secondary mt-1">Permanently remove your account and all associated recipe data. This action cannot be undone.</p>
                  </div>
                  <button className="font-label-sm text-label-sm border border-error bg-transparent text-error hover:bg-error-container px-6 py-3 uppercase tracking-wide whitespace-nowrap transition-colors rounded-DEFAULT cursor-pointer">Delete Account</button>
                </div>
              </section>

              {/* Global Action Bar */}
              <div className="flex justify-end gap-4 pt-4 pb-12 border-t border-outline-variant mt-8">
                <button 
                  onClick={() => router.push('/')}
                  className="font-label-sm text-label-sm border border-outline-variant bg-transparent text-on-background hover:bg-surface-bright px-6 py-3 uppercase tracking-wide transition-colors rounded-DEFAULT cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  className="font-label-sm text-label-sm bg-btn-primary text-on-btn-primary px-8 py-3 uppercase tracking-wide flex items-center gap-2 hover:opacity-90 transition-opacity rounded-DEFAULT cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
