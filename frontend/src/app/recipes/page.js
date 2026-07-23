"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecipeDisplay from "@/components/RecipeDisplay";
import { getRecipes, deleteRecipe, toggleFavoriteRecipe } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [loadingItems, setLoadingItems] = useState(true);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const { token, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (token) {
      fetchRecipes();
    }
  }, [token]);

  async function fetchRecipes() {
    try {
      const data = await getRecipes(token);
      setRecipes(data);
      if (data.length > 0) {
        setViewingRecipe(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingItems(false);
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteRecipe(token, id);
      setRecipes(recipes.filter((r) => r.id !== id));
      if (viewingRecipe?.id === id) setViewingRecipe(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleFavorite = async (id, currentStatus) => {
    try {
      await toggleFavoriteRecipe(token, id, !currentStatus);
      const updatedRecipes = recipes.map((r) => r.id === id ? { ...r, is_favorite: !currentStatus } : r);
      setRecipes(updatedRecipes);
      if (viewingRecipe?.id === id) setViewingRecipe({ ...viewingRecipe, is_favorite: !currentStatus });
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <Navbar />
      
      {error && (
        <div className="bg-error-container border-b border-error/20 p-3 text-on-error-container text-body-md text-center">
          {error}
        </div>
      )}

      <main className="flex-grow flex flex-col md:flex-row max-w-[1280px] mx-auto w-full">
        {/* Sidebar: Saved Recipes */}
        <aside className="w-full md:w-80 border-r border-outline-variant bg-surface-bright flex flex-col md:h-[calc(100vh-4rem)] md:sticky top-16 z-10">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <h2 className="font-headline-md text-headline-md text-on-surface">Library</h2>
            <button 
              onClick={() => router.push('/chef')}
              className="bg-btn-primary text-on-btn-primary hover:border-b-2 hover:border-primary-container px-4 py-2 rounded-DEFAULT font-label-sm text-label-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> New Recipe
            </button>
          </div>
          
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-DEFAULT font-body-md text-body-md text-on-background focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/10 transition-all placeholder:text-outline-variant" 
                placeholder="Search recipes..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow p-6 flex flex-col gap-1">
            {loadingItems ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-10 text-secondary font-body-md">
                No recipes found.
              </div>
            ) : (
              filteredRecipes.map((recipe) => {
                const isActive = viewingRecipe?.id === recipe.id;
                return (
                  <div 
                    key={recipe.id}
                    onClick={() => setViewingRecipe(recipe)}
                    className={`p-4 rounded-DEFAULT cursor-pointer flex flex-col gap-2 relative transition-colors ${
                      isActive 
                        ? "bg-surface-container-lowest border-2 border-primary-container" 
                        : "bg-surface-container-lowest border border-outline-variant hover:bg-surface"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className={`font-body-lg text-body-lg pr-8 ${isActive ? "text-on-surface font-medium" : "text-on-surface"}`}>
                        {recipe.title}
                      </h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(recipe.id, recipe.is_favorite); }}
                        className={`absolute right-4 top-4 transition-colors cursor-pointer ${recipe.is_favorite ? "text-primary hover:text-primary-container" : "text-secondary hover:text-primary"}`}
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: recipe.is_favorite ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-secondary font-label-sm text-label-sm">
                      <span>Added {new Date(recipe.created_at).toLocaleDateString()}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(recipe.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-error"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Detail Panel */}
        <article className="flex-grow flex flex-col overflow-y-auto bg-surface-container-lowest md:h-[calc(100vh-4rem)]">
          {viewingRecipe ? (
            <>
              {/* Hero Image / Header area */}
              {viewingRecipe.image_url && (
                <div className="w-full h-64 md:h-80 relative border-b border-outline-variant">
                  <img src={viewingRecipe.image_url} alt={viewingRecipe.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        <h1 className="font-display text-display text-on-primary mb-2">{viewingRecipe.title}</h1>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleToggleFavorite(viewingRecipe.id, viewingRecipe.is_favorite)}
                          className="w-10 h-10 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center hover:bg-surface-bright transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: viewingRecipe.is_favorite ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* If no image, fallback header */}
              {!viewingRecipe.image_url && (
                <div className="w-full relative border-b border-outline-variant bg-surface p-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h1 className="font-display text-display text-on-background mb-2">{viewingRecipe.title}</h1>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleFavorite(viewingRecipe.id, viewingRecipe.is_favorite)}
                        className="w-10 h-10 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center hover:bg-surface-bright transition-colors cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: viewingRecipe.is_favorite ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 max-w-4xl mx-auto w-full">
                <RecipeDisplay recipe={viewingRecipe.content} />
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center py-20 gap-4 text-center">
              <span className="material-symbols-outlined text-outline text-[48px]">article</span>
              <p className="font-body-lg text-body-lg text-secondary">Select a recipe to view details</p>
            </div>
          )}
        </article>
      </main>
      
      {/* Footer can be kept although it might be pushed down by the full-height panels. */}
      <Footer />
    </div>
  );
}
