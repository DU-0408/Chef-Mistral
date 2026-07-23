"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow flex flex-col">
        {/* ─── Hero Section ─────────────────────────────────────── */}
        <section className="relative w-full py-24 md:py-32 px-4 md:px-10 overflow-hidden border-b border-outline-variant bg-surface-container-lowest" id="hero">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
          <div className="max-w-[1280px] mx-auto flex flex-col items-start gap-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-outline-variant bg-surface font-mono-label text-mono-label text-secondary">
              <span className="w-2 h-2 rounded-full bg-primary-fixed-dim"></span> System v2.4 Active
            </div>
            
            <h1 className="font-display text-display text-on-background max-w-3xl leading-tight">
              AI that cooks with <br className="hidden md:block" /> what you have.
            </h1>
            
            <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
              Input your available ingredients. Our deterministic model processes dietary constraints, flavor profiles, and preparation time to generate precise, actionable culinary instructions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href={user ? "/chef" : "/register"}
                className="bg-btn-primary text-on-btn-primary font-label-sm text-label-sm uppercase px-6 py-3 rounded hover:border-b-2 hover:border-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Get Started <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <Link
                href="#features"
                className="bg-transparent border border-outline-variant text-on-background font-label-sm text-label-sm uppercase px-6 py-3 rounded hover:bg-surface-bright transition-all active:scale-95 flex items-center justify-center"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* ─── How It Works Section ───────────────────────────── */}
        <section className="w-full py-24 px-4 md:px-10 bg-surface border-b border-outline-variant" id="features">
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">Processing Pipeline</h2>
              <p className="font-body-md text-body-md text-secondary">Three stages from raw inventory to final execution.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-outline-variant bg-surface-container-lowest rounded-DEFAULT">
              {/* Step 1 */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-outline-variant relative">
                <div className="absolute top-4 right-4 font-mono-label text-mono-label text-surface-dim">01</div>
                <div className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded-DEFAULT bg-surface mb-6">
                  <span className="material-symbols-outlined text-on-surface-variant">inventory_2</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background mb-3">Input Vector</h3>
                <p className="font-body-md text-body-md text-secondary">
                  Scan or manually log current pantry and refrigerator inventory. The system maps raw materials to flavor compounds.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-outline-variant relative bg-surface-bright">
                <div className="absolute top-4 right-4 font-mono-label text-mono-label text-surface-dim">02</div>
                <div className="w-12 h-12 flex items-center justify-center border border-primary-container bg-surface mb-6 relative">
                  <div className="absolute inset-0 bg-primary-container opacity-10 rounded-DEFAULT"></div>
                  <span className="material-symbols-outlined text-primary-fixed-dim">memory</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background mb-3">Model Inference</h3>
                <p className="font-body-md text-body-md text-secondary">
                  Cross-referencing constraints (time, diet) with chemical compatibility matrices to generate novel permutations.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="p-8 relative">
                <div className="absolute top-4 right-4 font-mono-label text-mono-label text-surface-dim">03</div>
                <div className="w-12 h-12 flex items-center justify-center border border-outline-variant rounded-DEFAULT bg-surface mb-6">
                  <span className="material-symbols-outlined text-on-surface-variant">restaurant_menu</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background mb-3">Output Protocol</h3>
                <p className="font-body-md text-body-md text-secondary">
                  Structured procedural instructions delivered with precise timing, temperature logic, and plating schematics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── System Features Section ────────────────────────── */}
        <section className="w-full py-24 px-4 md:px-10 bg-surface-container-lowest">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex justify-between items-end mb-12 border-b border-outline-variant pb-6">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-background mb-2">Core Modules</h2>
                <p className="font-body-md text-body-md text-secondary">Component capabilities of the Chef Qwen engine.</p>
              </div>
            </div>
            
            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-min">
              {/* Feature 1: Large */}
              <div className="md:col-span-2 md:row-span-2 border border-outline-variant bg-surface rounded-DEFAULT flex flex-col overflow-hidden clinical-shadow">
                <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                  <h4 className="font-headline-md text-headline-md text-on-background">Pantry Sync API</h4>
                  <span className="material-symbols-outlined text-secondary">sync</span>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <p className="font-body-md text-body-md text-secondary mb-6 max-w-md">
                    Real-time inventory tracking connected directly to your smart appliances or digital grocery lists. Ensures the model never hallucinates ingredients you don't possess.
                  </p>
                  <div className="mt-auto h-48 border border-outline-variant bg-surface-container-lowest relative overflow-hidden flex items-center justify-center">
                    <div className="font-mono-label text-mono-label text-surface-dim opacity-50">Data Visualization Layer Offline</div>
                    {/* Decorative grid lines */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
                  </div>
                </div>
              </div>
              
              {/* Feature 2: Small */}
              <div className="md:col-span-1 border border-outline-variant bg-surface-container-lowest rounded-DEFAULT p-6 flex flex-col justify-between clinical-shadow hover:bg-surface-bright transition-colors">
                <div className="w-10 h-10 border border-outline-variant rounded-DEFAULT flex items-center justify-center mb-4 bg-surface">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">tune</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-background mb-2 text-[18px]">Dietary Parameters</h4>
                  <p className="font-body-md text-body-md text-secondary text-[13px]">Strict constraint solving for vegan, keto, allergies, and caloric targets.</p>
                </div>
              </div>
              
              {/* Feature 3: Small */}
              <div className="md:col-span-1 border border-outline-variant bg-surface-container-lowest rounded-DEFAULT p-6 flex flex-col justify-between clinical-shadow hover:bg-surface-bright transition-colors">
                <div className="w-10 h-10 border border-outline-variant rounded-DEFAULT flex items-center justify-center mb-4 bg-surface">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">science</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-background mb-2 text-[18px]">Flavor Profiling</h4>
                  <p className="font-body-md text-body-md text-secondary text-[13px]">Chemical compatibility analysis for unconventional but mathematically sound pairings.</p>
                </div>
              </div>
              
              {/* Feature 4: Wide */}
              <div className="md:col-span-2 border border-outline-variant bg-surface-container-lowest rounded-DEFAULT p-6 flex items-center gap-6 clinical-shadow">
                <div className="w-16 h-16 border border-outline-variant rounded-DEFAULT flex-shrink-0 flex items-center justify-center bg-surface">
                  <span className="material-symbols-outlined text-on-surface-variant text-[28px]">folder_special</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-background mb-2 text-[18px]">Recipe Vault</h4>
                  <p className="font-body-md text-body-md text-secondary text-[13px]">Immutable storage of successful generations with personal modification tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
