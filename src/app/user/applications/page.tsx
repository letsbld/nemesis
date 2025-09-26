// app/applications/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react"; // npm install lucide-react

interface App {
  id: number;
  name: string;
  logo?: string; // optional logo path
  initial?: string; // fallback initial if no logo
}

const initialApps: App[] = [
  { id: 1, name: "AWS Clod", initial: "A" },
  { id: 2, name: "Chrome", initial: "C" },
  { id: 3, name: "Firefox", initial: "F" },
  { id: 4, name: "Notion", logo: "/notion.png" },
  { id: 5, name: "Motrix", initial: "M" },
];

export default function ApplicationsPage() {
  const [apps] = useState<App[]>(initialApps);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const displayedApps =
    activeTab === "all"
      ? apps
      : apps.filter((app) => favorites.includes(app.id));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Tabs */}
      <div className="flex gap-6 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2 font-medium ${
            activeTab === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Applications ({apps.length})
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`pb-2 font-medium ${
            activeTab === "favorites"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Favorites ({favorites.length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayedApps.map((app) => (
          <div
            key={app.id}
            className="relative border rounded-lg bg-white shadow-sm p-4 flex flex-col items-center justify-center text-center hover:shadow-md"
          >
            {/* Favorite Star */}
            <button
              onClick={() => toggleFavorite(app.id)}
              className="absolute top-2 right-2"
            >
              <Star
                size={20}
                className={`${
                  favorites.includes(app.id)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>

            {/* Logo or Initial */}
            {app.logo ? (
              <Image
                src={app.logo}
                alt={app.name}
                width={60}
                height={60}
                className="object-contain"
              />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-600 text-white text-lg font-bold">
                {app.initial}
              </div>
            )}

            {/* Name */}
            <p className="mt-2 text-sm font-medium">{app.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
