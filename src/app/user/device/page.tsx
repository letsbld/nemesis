"use client"

import { useEffect, useState } from "react";
import { Commet } from 'react-loading-indicators';
import { apiFetch } from '@/lib/apiFetch';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch('/device');
        setLoading(true);
        setError(null);
      
      } catch (err) {
        setError("Failed to fetch device settings.");
      }
      finally {
        setLoading(false);
     }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Commet color="#3b82f6" size="small" />
      </div>
    );
  }
  return (
    <div>Device Settings Page - Coming Soon!</div>
  )
}