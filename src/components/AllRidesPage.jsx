"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AllRidesPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function fetchRides() {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/my-rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRides(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRides();
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)] p-4 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-4">All My Rides</h1>

      {loading && <div>Loading…</div>}
      {!loading && rides.length === 0 && <div>No rides found.</div>}

      <div className="space-y-4">
        {rides.map(r => (
          <div key={r.id} className="p-4 border rounded-lg bg-white">
            <div><strong>Pickup:</strong> {r.pickup_location}</div>
            <div><strong>Dropoff:</strong> {r.dropoff_location}</div>
            <div><strong>Status:</strong> {r.status}</div>
            {r.status === "cancelled" && <div><strong>Reason:</strong> {r.cancelled_reason}</div>}
            <div><strong>Fare:</strong> ₹{r.fare}</div>
            {r.driver && (
              <div className="mt-2 p-2 border rounded-lg bg-gray-100">
                <div><strong>Driver:</strong> {r.driver.name}</div>
                <div><strong>Phone:</strong> {r.driver.phone}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
