"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPantry, addPantryItem, removePantryItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState("");
  const [loadingItems, setLoadingItems] = useState(true);
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
      fetchPantry();
    }
  }, [token]);

  async function fetchPantry() {
    try {
      const data = await getPantry(token);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingItems(false);
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      const added = await addPantryItem(token, newItem.trim());
      setItems([added, ...items]);
      setNewItem("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await removePantryItem(token, id);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <Navbar />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col gap-12">
        {/* Page Header & Global Actions */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-display md:text-display font-semibold tracking-tight text-on-background">Inventory Management</h1>
            <p className="font-body-lg text-body-lg text-secondary max-w-2xl">Monitor and manage your operational pantry levels. Updates sync in real-time across your workstations.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-sm">search</span>
              <input
                className="w-full h-10 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded-DEFAULT focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-outline-variant"
                placeholder="Search ingredients, tags..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Add Item Form as part of actions */}
            <form onSubmit={handleAddItem} className="flex gap-2 w-full md:w-auto">
              <input
                type="text"
                className="flex-grow h-10 px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded-DEFAULT focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-outline-variant"
                placeholder="Add new item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
              <button 
                type="submit"
                className="h-10 px-4 bg-btn-primary text-on-btn-primary font-label-sm text-label-sm rounded-DEFAULT flex items-center gap-2 hover:border-b-2 hover:border-primary-container transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Item
              </button>
            </form>
          </div>
        </section>

        {error && (
          <div className="bg-error-container border border-error/20 rounded-DEFAULT p-3 text-on-error-container font-body-md text-body-md">
            {error}
          </div>
        )}

        {/* Inventory List */}
        {loadingItems ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-outline-variant border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-variant bg-surface-bright flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">kitchen</span>
                  Pantry Items
                </h2>
                <span className="font-mono-label text-mono-label text-secondary bg-surface-container-high px-2 py-1 rounded-DEFAULT border border-outline-variant">
                  {filteredItems.length} Items
                </span>
              </div>
              
              {filteredItems.length === 0 ? (
                <div className="px-6 py-12 text-center text-secondary font-body-lg text-body-lg">
                  {items.length === 0 ? "Your pantry is empty. Add some items above!" : "No matching items found."}
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-variant">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="inventory-row bg-surface-container-lowest hover:bg-surface-bright transition-colors group">
                          <td className="py-3 px-6 w-[70%]">
                            <span className="font-medium text-on-background">{item.name}</span>
                          </td>
                          <td className="py-3 px-6 w-[30%] text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 text-secondary hover:text-error hover:bg-error-container rounded-DEFAULT transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
