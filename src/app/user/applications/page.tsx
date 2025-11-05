"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Search } from "lucide-react"; // npm install lucide-react

interface App {
  id: number;
  name: string;
  logo?: string; // optional logo path
  initial?: string; // fallback initial if no logo
}

const initialApps: App[] = [
    { id: 1, name: "AWS Cloud", initial: "A" },
    { id: 2, name: "Google Chrome", initial: "C" },
    { id: 3, name: "Mozilla Firefox", initial: "F" },
    { id: 4, name: "Notion", initial: "N" },
    { id: 5, name: "Motrix", initial: "M" },
    { id: 6, name: "Visual Studio Code", initial: "V" },
    { id: 7, name: "Figma", initial: "F" },
    { id: 8, name: "Slack", initial: "S" },
];

export default function ApplicationsPage() {
  const [apps] = useState<App[]>(initialApps);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  // ✅ NEW: State to hold the search query
  const [searchTerm, setSearchTerm] = useState("");

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // ✅ UPDATED: Filtering logic now includes the search term
  const displayedApps = apps
    .filter((app) => {
      // First, filter based on the active tab
      if (activeTab === "favorites") {
        return favorites.includes(app.id);
      }
      return true; // 'all' tab shows everything
    })
    .filter((app) => {
      // Then, filter the result by the search term
      if (searchTerm.trim() === "") {
        return true; // No search term, show all
      }
      return app.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Applications</h1>

        {/* ✅ NEW: Search Bar */}
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search applications..."
            className="w-full pl-10 pr-4 py-2 dark:text-gray-600 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "all"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Applications ({apps.length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "favorites"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Favorites ({favorites.length})
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedApps.map((app) => (
            <div
              key={app.id}
              className="relative border rounded-lg bg-white px-5 py-10 flex flex-col items-center justify-center text-center transition-shadow duration-300 hover:shadow-lg group"
            >
              {/* Favorite Star */}
              <button
                onClick={() => toggleFavorite(app.id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={`Favorite ${app.name}`}
              >
                <Star
                  size={20}
                  className={`transition-colors ${
                    favorites.includes(app.id)
                      ? "fill-yellow-400 text-yellow-500"
                      : "text-gray-300 group-hover:text-gray-400"
                  }`}
                />
              </button>

              {/* Logo or Initial */}
              <div className="w-16 h-16 flex items-center justify-center mb-3">
                 {app.logo ? (
                    <Image
                        src={app.logo}
                        alt={`${app.name} logo`}
                        width={100}
                        height={100}
                        className="object-contain"
                        // Add a placeholder for local images
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/64x64/E2E8F0/A0AEC0?text=?')}
                    />
                ) : (
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                        {app.initial}
                    </div>
                )}
              </div>

              {/* Name */}
              <p className="text-sm font-semibold text-gray-700">{app.name}</p>
            </div>
          ))}
        </div>
        
        {/* Empty State for Search */}
        {displayedApps.length === 0 && searchTerm && (
            <div className="text-center py-16">
                <h3 className="text-lg font-semibold text-gray-700">No applications found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search term.</p>
            </div>
        )}
      </div>
    </div>
  );
}
