"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DriverMap = dynamic(() => import("../../components/DriverMap"), { ssr: false });

export default function DriverPage() {
  const [online, setOnline] = useState(false);
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [rideHistory, setRideHistory] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [msg, setMsg] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [etaMin, setETA] = useState(0);
  const [currentNotification, setCurrentNotification] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const pushNotification = (message) => {
    setCurrentNotification({ message });
    setTimeout(() => setCurrentNotification(null), 3000);
  };


  const fetchAvailable = useCallback(async () => {
    if (!online || activeRide || !token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load rides");
      const now = new Date().getTime();
      const validRides = json.filter(
        (r) => now - new Date(r.requested_at).getTime() < 10 * 60 * 1000
      );
      setRides(validRides);
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  }, [token, online, activeRide]);

  useEffect(() => {
    if (!online || activeRide) return;
    fetchAvailable();
    const interval = setInterval(fetchAvailable, 5000);
    return () => clearInterval(interval);
  }, [online, activeRide, fetchAvailable]);


  useEffect(() => {
    if (!activeRide || !online || !("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setDriverPosition(coords);
        try {
          await fetch(`${BACKEND_URL}/api/rides/${activeRide.id}/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ lat: coords[0], lng: coords[1] }),
          });
        } catch (e) {}
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeRide, online, token]);

  const acceptRide = async (ride_id) => {
    if (!token) return setMsg({ type: "error", text: "Login first." });
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ride_id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Accept failed");
      setActiveRide(json.ride);
      setRides([]);
      pushNotification("Ride accepted!");
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };
  const completeRide = async () => {
    if (!activeRide || !token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ride_id: activeRide.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Complete failed");
      pushNotification("Ride completed!");
      setActiveRide(null);
      setDriverPosition(null);
      fetchAvailable();
      fetchRideHistory();
      fetchRatings();
    } catch (e) {
      setMsg({ type: "error", text: e.message });
    }
  };

  const fetchRideHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/history`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) setRideHistory(json);
    } catch (e) {}
  }, [token]);

  const fetchRatings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/drivers/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setRatings(json);
    } catch (e) {}
  }, [token]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) setProfile(json.user);
    } catch (e) {}
  }, [token]);

  const fetchPayments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) setPayments(json);
    } catch (e) {}
  }, [token]);

  useEffect(() => {
    fetchRideHistory();
    fetchRatings();
    fetchProfile();
    fetchPayments();
  }, [fetchRideHistory, fetchRatings, fetchProfile, fetchPayments]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {}
      <aside className="w-64 bg-gray-800 text-white shadow-md flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">Driver Panel</div>
        <nav className="flex flex-col mt-4 space-y-2 flex-1">
          {["dashboard", "history", "ratings", "profile", "payments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`text-left px-4 py-2 rounded hover:bg-gray-700 ${selectedTab === tab ? "bg-gray-700 font-semibold" : ""}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setOnline((v) => !v)}
            className={`mt-6 px-4 py-2 rounded border ${
              online ? "bg-green-100 text-gray-800 border-green-300" : "bg-gray-50 text-gray-800 border-gray-200"
            }`}
          >
            {online ? "🟢 Online" : "⚪️ Go Online"}
          </button>
        </nav>
        <div className="mt-auto p-4 border-t border-gray-700">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/auth/login";
            }}
            className="w-full px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6">
        {}
        <div className="flex-1 space-y-4">
          {}
          {currentNotification && <div className="p-3 rounded shadow bg-yellow-50 border mb-2">{currentNotification.message}</div>}

          {}
          {msg && (
            <div className={`mb-4 rounded-lg px-4 py-2 text-sm ${msg.type === "success" ? "bg-green-100 border border-green-300" : "bg-red-100 border border-red-300"}`}>
              {msg.text}
            </div>
          )}

          {}
          {selectedTab === "dashboard" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Available Rides</h2>
              {rides.length === 0 ? (
                <p>No rides available</p>
              ) : (
                rides.map((r) => (
                  <div key={r.id} className="border p-3 rounded mb-2 bg-white shadow">
                    <p>
                      <strong>From:</strong> {r.pickup} → <strong>To:</strong> {r.dropoff}
                    </p>
                    <p>
                      <strong>Distance:</strong> {r.distance_km} km | <strong>Fare:</strong> ₹{r.fare}
                    </p>
                    <button
                      onClick={() => acceptRide(r.id)}
                      className="mt-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Accept Ride
                    </button>
                  </div>
                ))
              )}

              {activeRide && (
                <div className="mt-4 p-4 border rounded bg-white shadow">
                  <h3 className="font-semibold mb-2">Active Ride</h3>
                  <p>
                    <strong>From:</strong> {activeRide.pickup} → <strong>To:</strong> {activeRide.dropoff}
                  </p>
                  <p>
                    <strong>Distance:</strong> {activeRide.distance_km} km | <strong>Fare:</strong> ₹{activeRide.fare}
                  </p>
                  <button
                    onClick={completeRide}
                    className="mt-2 px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Complete Ride
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedTab === "history" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Ride History</h2>
              {rideHistory.map((r) => (
                <div key={r.id} className="border p-3 rounded mb-2 bg-white shadow">
                  <p>
                    <strong>From:</strong> {r.pickup} → <strong>To:</strong> {r.dropoff}
                  </p>
                  <p>
                    <strong>Fare:</strong> ₹{r.fare} | <strong>Date:</strong> {new Date(r.requested_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {selectedTab === "ratings" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Ratings</h2>
              {ratings.map((r, i) => (
                <div key={i} className="border p-3 rounded mb-2 bg-white shadow">
                  <p>
                    <strong>Ride ID:</strong> {r.ride_id} | <strong>Rating:</strong> {r.rating} ⭐
                  </p>
                  <p>{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {selectedTab === "profile" && profile && (
            <div className="border p-4 rounded bg-white shadow space-y-2">
              <h2 className="text-2xl font-bold mb-2">Profile</h2>
              <p>
                <strong>Name:</strong> {profile.name}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Phone:</strong> {profile.phone}
              </p>
            </div>
          )}

          {selectedTab === "payments" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Payments</h2>
              {payments.map((p, i) => (
                <div key={i} className="border p-3 rounded mb-2 bg-white shadow">
                  <p>
                    <strong>Ride ID:</strong> {p.ride_id} | <strong>Amount:</strong> ₹{p.amount} |{" "}
                    <strong>Status:</strong> {p.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {}
        <div className="w-96 h-96 rounded-2xl overflow-hidden shadow-lg">
          <DriverMap rides={rides} activeRide={activeRide} driverPosition={driverPosition} />
        </div>
      </main>
    </div>
  );
}
