"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IngredientsList from "@/components/IngredientsList";
import RecipeDisplay from "@/components/RecipeDisplay";
import { generateRecipe, getPantry, saveRecipe, generateRecipeImage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ChefPage() {
  const [ingredients, setIngredients] = useState([]);
  const [diet, setDiet] = useState("None");
  const [recipe, setRecipe] = useState("");
  const [imageB64, setImageB64] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [pantryItems, setPantryItems] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const router = useRouter();
  const { token, user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (token) {
      getPantry(token).then(data => setPantryItems(data)).catch(console.error);
    }
  }, [token]);

  const addIngredient = (e) => {
    e.preventDefault();
    const value = inputRef.current?.value?.trim();
    if (!value) return;
    if (ingredients.some((i) => i.toLowerCase() === value.toLowerCase())) return;
    setIngredients((prev) => [...prev, value]);
    inputRef.current.value = "";
    inputRef.current.focus();
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetRecipe = async () => {
    setError("");
    setLoading(true);
    setRecipe("");
    setImageB64("");
    try {
      const promptIngredients = diet !== "None" ? [...ingredients, `Dietary Preference: ${diet}`] : ingredients;
      const data = await generateRecipe(token, promptIngredients);
      setRecipe(data.recipe);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    try {
      const titleMatch = recipe.match(/# (.*)/);
      const title = titleMatch ? titleMatch[1] : "Delicious Dish";
      const data = await generateRecipeImage(token, "A professional food photography shot of: " + title);
      setImageB64(data.image_b64);
    } catch (e) {
      setError(e.message);
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSaveRecipe = async () => {
    setSavingRecipe(true);
    try {
      const titleMatch = recipe.match(/# (.*)/);
      const title = titleMatch ? titleMatch[1] : "My Recipe";
      await saveRecipe(token, title, recipe, imageB64 || null);
      alert("Recipe saved successfully!");
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingRecipe(false);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <Navbar />
      <main className="flex-grow flex flex-col md:flex-row max-w-[1280px] w-full mx-auto px-4 md:px-10 py-8 gap-6">
        
        {/* Left Panel: Input Area */}
        <aside className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">System Ready</span>
            </div>
            
            <div>
              <label className="block font-label-sm text-label-sm text-secondary mb-2 uppercase">Ingredients</label>
              <form onSubmit={addIngredient} className="flex gap-2 mb-3">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-grow bg-surface-container-lowest border border-outline-variant rounded-DEFAULT px-3 py-2 font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/10 transition-all"
                  placeholder="e.g. Miso, Tofu..."
                />
                <button
                  type="submit"
                  className="bg-btn-primary text-on-btn-primary px-4 py-2 rounded-DEFAULT font-label-sm text-label-sm uppercase tracking-wider hover:border-b-2 hover:border-primary-container transition-all active:scale-95 cursor-pointer"
                >
                  Add
                </button>
              </form>
              <IngredientsList ingredients={ingredients} onRemove={removeIngredient} />
            </div>

            {pantryItems.length > 0 && (
              <>
                <div className="w-full h-px bg-outline-variant"></div>
                <button
                  onClick={() => {
                    const newIngs = pantryItems.map(p => p.name).filter(n => !ingredients.some(i => i.toLowerCase() === n.toLowerCase()));
                    setIngredients([...ingredients, ...newIngs]);
                  }}
                  className="w-full bg-transparent border border-outline-variant text-on-background px-4 py-2 rounded-DEFAULT font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  Load from Pantry ({pantryItems.length})
                </button>
              </>
            )}

            <div className="w-full h-px bg-outline-variant"></div>
            
            <div>
              <label className="block font-label-sm text-label-sm text-secondary mb-2 uppercase">Dietary Preferences</label>
              <select 
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT px-3 py-2 font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/10 appearance-none cursor-pointer"
              >
                <option>None</option>
                <option>Vegan</option>
                <option>Vegetarian</option>
                <option>Gluten-Free</option>
                <option>Keto</option>
              </select>
            </div>
            
            <button
              onClick={handleGetRecipe}
              disabled={ingredients.length < 4 || loading}
              className="w-full bg-btn-primary text-on-btn-primary px-4 py-3 rounded-DEFAULT font-label-sm text-label-sm uppercase tracking-wider hover:border-b-2 hover:border-primary-container transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              {loading ? "Generating..." : "Generate Recipe"}
            </button>
            
            {ingredients.length > 0 && ingredients.length < 4 && (
              <p className="font-label-sm text-label-sm text-outline text-center -mt-2">Add {4 - ingredients.length} more ingredient{4 - ingredients.length > 1 ? "s" : ""}</p>
            )}
          </div>
        </aside>

        {/* Right Panel: Recipe Display */}
        <section className="w-full md:w-2/3 flex flex-col">
          {error && (
            <div className="bg-error-container border border-error/20 rounded-DEFAULT p-3 mb-4 text-on-error-container font-body-md text-body-md">
              {error}
            </div>
          )}

          {loading && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT flex flex-col items-center justify-center py-20 gap-4 h-full">
              <div className="w-10 h-10 border-2 border-outline-variant border-t-primary rounded-full animate-spin"></div>
              <p className="font-body-md text-body-md text-secondary">Our AI chef is crafting your recipe...</p>
            </div>
          )}

          {!recipe && !loading && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT flex flex-col items-center justify-center py-20 gap-4 text-center h-full">
              <span className="material-symbols-outlined text-outline text-[48px]">restaurant_menu</span>
              <p className="font-body-lg text-body-lg text-secondary max-w-sm">Add at least 4 ingredients and hit Generate to see your recipe here.</p>
            </div>
          )}

          {recipe && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT flex flex-col h-full overflow-hidden">
              {/* Recipe Header / Image */}
              {imageB64 && (
                <div className="relative w-full h-64 bg-surface-container-high border-b border-outline-variant group">
                  <img src={imageB64} alt="Generated dish" className="w-full h-full object-cover" />
                  <button 
                    onClick={handleGenerateImage}
                    disabled={generatingImage}
                    className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur border border-outline-variant text-on-surface px-3 py-1.5 rounded-DEFAULT font-label-sm text-label-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 hover:bg-surface-container-lowest disabled:opacity-40 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span> 
                    {generatingImage ? "Generating..." : "Regenerate Image"}
                  </button>
                </div>
              )}

              <div className="p-8 flex flex-col gap-8 h-full">
                {/* Title & Actions inside RecipeDisplay? Let's keep them here or modify RecipeDisplay. */}
                {/* For now, we'll just show RecipeDisplay, and add the generate image button if we don't have an image yet. */}
                
                <div className="flex justify-between items-start">
                  {/* Let RecipeDisplay handle the title and markdown. But we'll add our custom buttons below it or inside it. */}
                </div>

                <div className="flex-grow">
                  <RecipeDisplay recipe={recipe} />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant mt-auto">
                  {!imageB64 && (
                    <button
                      onClick={handleGenerateImage}
                      disabled={generatingImage}
                      className="bg-transparent border border-outline-variant text-on-background px-4 py-2 rounded-DEFAULT font-label-sm text-label-sm uppercase tracking-wider hover:bg-surface-container-low transition-colors flex items-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[16px]">{generatingImage ? "hourglass_empty" : "image"}</span>
                      {generatingImage ? "Generating..." : "Generate Image"}
                    </button>
                  )}
                  <button
                    onClick={handleSaveRecipe}
                    disabled={savingRecipe}
                    className="bg-btn-primary text-on-btn-primary px-4 py-2 rounded-DEFAULT font-label-sm text-label-sm uppercase tracking-wider hover:border-b-2 hover:border-primary-container transition-all flex items-center gap-2 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px]">bookmark</span>
                    {savingRecipe ? "Saving..." : "Save Recipe"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
