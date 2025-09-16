"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  MapPin,
  Navigation,
  Car,
  ArrowRight,
  Loader2,
  X,
  Home as HomeIcon,
  List,
  User,
  CreditCard,
  LogOut,
  Bell,
} from "lucide-react";

const RiderMap = dynamic(() => import("../../components/RiderMap"), { ssr: false });

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || "";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

const RIDE_OPTIONS = [
  { id: "driviox", name: "DrivioX", desc: "Affordable, up to 4 seats", multiplier: 1.0 },
  { id: "comfort", name: "Drivio Comfort", desc: "Newer cars with extra legroom", multiplier: 1.25 },
  { id: "xl", name: "DrivioXL", desc: "SUVs, up to 6 seats", multiplier: 1.5 },
];

const CANCEL_REASONS = ["Change of plans", "Driver too far", "Price too high", "Incorrect pickup location", "Other"];

const SAMPLE_DRIVERS = [
  { name: "John Doe", age: 32, number: "+91 9876543210", car: "Toyota Innova 2019", plate: "MH12AB1234" },
  { name: "Alice Smith", age: 28, number: "+91 9123456789", car: "Honda City 2020", plate: "MH14XY5678" },
  { name: "Bob Johnson", age: 35, number: "+91 9988776655", car: "Suzuki Swift 2018", plate: "MH11CD4321" },
  { name: "Emma Brown", age: 30, number: "+91 9876501234", car: "Hyundai Creta 2021", plate: "MH16EF8765" },
  { name: "David Lee", age: 40, number: "+91 9998887776", car: "Mahindra XUV 2019", plate: "MH18GH3456" },
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function PaymentForm({ rideId, amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: rideId, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment creation failed");

      const clientSecret = data.clientSecret;
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (error) throw error;

      await fetch(`${BACKEND_URL}/api/payments/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_intent_id: paymentIntent.id }),
      });

      onSuccess(paymentIntent);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement className="p-3 border rounded-xl" />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
      >
        {loading ? "Processing…" : `Pay ₹${amount}`}
      </button>
    </form>
  );
}

export default function RiderPage() {
  const router = useRouter();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);

  const [selected, setSelected] = useState("driviox");
  const [distanceKm, setDistanceKm] = useState(0);
  const [rideInfo, setRideInfo] = useState(null);
  const [serverMsg, setServerMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const [cancelModal, setCancelModal] = useState(false);
  const [promoModal, setPromoModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [rideHistory, setRideHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [activePanel, setActivePanel] = useState("home");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const chosen = RIDE_OPTIONS.find((o) => o.id === selected) || RIDE_OPTIONS[0];
  const estimate = Math.max(
    50,
    Math.round(distanceKm * 15 * chosen.multiplier * (1 - discount / 100))
  );

  const debouncedPickup = useDebounce(pickup, 600);
  const debouncedDropoff = useDebounce(dropoff, 600);

  // Fetch coordinates
  useEffect(() => {
    async function fetchCoordsAndDistance() {
      if (!debouncedPickup || !debouncedDropoff) return;
      try {
        const pickRes = await fetch(
          `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(
            debouncedPickup
          )}&size=1`
        );
        const pickData = await pickRes.json();
        const pickCoords = pickData.features?.[0]?.geometry?.coordinates;
        if (!pickCoords) return;

        const dropRes = await fetch(
          `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(
            debouncedDropoff
          )}&size=1`
        );
        const dropData = await dropRes.json();
        const dropCoords = dropData.features?.[0]?.geometry?.coordinates;
        if (!dropCoords) return;

        setPickupCoords([pickCoords[1], pickCoords[0]]);
        setDropoffCoords([dropCoords[1], dropCoords[0]]);

        // Distance calculation using ORS Directions
        const routeRes = await fetch(
          "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
          {
            method: "POST",
            headers: { "Authorization": ORS_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ coordinates: [[pickCoords[0], pickCoords[1]], [dropCoords[0], dropCoords[1]]] }),
          }
        );
        const routeData = await routeRes.json();
        if (routeData.features?.[0]?.properties?.summary?.distance)
          setDistanceKm((routeData.features[0].properties.summary.distance / 1000).toFixed(1));
      } catch (e) {
        console.error(e);
      }
    }
    fetchCoordsAndDistance();
  }, [debouncedPickup, debouncedDropoff]);

  // Fetch profile/history/payments/notifications
  const fetchRideHistory = useCallback(async () => {
    if (!token) return;
    let userId = null;
    try { userId = JSON.parse(atob(token.split(".")[1])).sub; } catch { return; }
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => []);
      if (Array.isArray(data)) setRideHistory(data.filter(r => r.rider?.id === userId));
    } catch (e) { console.error(e); }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (data.user) setProfile(data.user);
    } catch (e) { console.error(e); }
  }, [token]);

  const fetchPayments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setPayments(data);
    } catch {}
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setNotifications(data);
    } catch {}
  }, [token]);

  useEffect(() => {
    if (activePanel === "history") fetchRideHistory();
    if (activePanel === "profile") fetchProfile();
    if (activePanel === "payments") fetchPayments();
    if (activePanel === "notifications") fetchNotifications();
  }, [activePanel, fetchRideHistory, fetchProfile, fetchPayments, fetchNotifications]);

  // ------------------- Ride Handling -------------------
  const requestRide = async () => {
    if (!pickup || !dropoff) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/rides/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          pickup_location: pickup,
          dropoff_location: dropoff,
          ride_type: selected,
          distance_km: distanceKm,
          fare: estimate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request ride");

      const driver = SAMPLE_DRIVERS[Math.floor(Math.random() * SAMPLE_DRIVERS.length)];
      setRideInfo({ ...data, driver });
      setDriverCoords([pickupCoords[0] + 0.001, pickupCoords[1] + 0.001]);

      setServerMsg({ type: "success", text: "Ride requested successfully!" });

      // Auto ride progression
setTimeout(() => setRideInfo((prev) => ({ ...prev, status: "accepted" })), 5000);       // accepted after 5s
setTimeout(() => {
  setRideInfo((prev) => ({ ...prev, status: "in-progress" }));                          // in-progress after 10s
  setTimeout(() => {                                                                     // auto complete after 15s from start
    setRideInfo((prev) => ({ ...prev, status: "completed" }));
    setPaymentModal(true);                                                               // open payment modal immediately
  }, 5000);
}, 10000);

    } catch (e) {
      setServerMsg({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async (reason) => {
    if (!rideInfo) return;
    try {
      await fetch(`${BACKEND_URL}/api/rides/${rideInfo.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      setRideInfo(null);
      setCancelModal(false);
      setServerMsg({ type: "success", text: "Ride cancelled." });
    } catch (e) {
      setServerMsg({ type: "error", text: e.message });
    }
  };

  const applyPromo = async () => {
    if (!promoCode) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/promos/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid promo code");
      setDiscount(data.discount);
      setPromoModal(false);
      setServerMsg({ type: "success", text: `Promo applied! ${data.discount}% off` });
    } catch (e) {
      setServerMsg({ type: "error", text: e.message });
    }
  };

  // ------------------- JSX -------------------
  return (
    <div className="flex h-screen w-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 font-bold text-xl">Drivio Rider</div>
        <button className={`flex items-center gap-2 p-3 hover:bg-gray-700 ${activePanel === "home" ? "bg-gray-700" : ""}`} onClick={() => setActivePanel("home")}><HomeIcon className="h-5 w-5" /> Dashboard</button>
        <button className={`flex items-center gap-2 p-3 hover:bg-gray-700 ${activePanel === "history" ? "bg-gray-700" : ""}`} onClick={() => setActivePanel("history")}><List className="h-5 w-5" /> History</button>
        <button className={`flex items-center gap-2 p-3 hover:bg-gray-700 ${activePanel === "profile" ? "bg-gray-700" : ""}`} onClick={() => setActivePanel("profile")}><User className="h-5 w-5" /> Profile</button>
        <button className={`flex items-center gap-2 p-3 hover:bg-gray-700 ${activePanel === "payments" ? "bg-gray-700" : ""}`} onClick={() => setActivePanel("payments")}><CreditCard className="h-5 w-5" /> Payments</button>
        <button className={`flex items-center gap-2 p-3 hover:bg-gray-700 ${activePanel === "notifications" ? "bg-gray-700" : ""}`} onClick={() => setActivePanel("notifications")}><Bell className="h-5 w-5" /> Notifications</button>
        <button className="flex items-center gap-2 p-3 mt-auto hover:bg-gray-700" onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}><LogOut className="h-5 w-5" /> Logout</button>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-4">
        {serverMsg && <div className={`p-3 rounded-xl mb-4 ${serverMsg.type === "success" ? "bg-green-600" : "bg-red-600"} text-white`}><div className="flex justify-between">{serverMsg.text} <X className="h-4 w-4 cursor-pointer" onClick={() => setServerMsg(null)} /></div></div>}

        {activePanel === "home" && (
          <div className="flex gap-4">
            {/* Left Panel */}
            <div className="flex flex-col w-96 bg-gray-50 p-6 gap-3 rounded-xl shadow-md">
              <input type="text" placeholder="Pickup location" className="p-3 border rounded-xl" value={pickup} onChange={(e) => setPickup(e.target.value)} />
              <input type="text" placeholder="Dropoff location" className="p-3 border rounded-xl" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />

              {distanceKm > 0 && (
                <div className="p-3 border rounded-xl bg-gray-100">
                  <div><strong>Distance:</strong> {distanceKm} km</div>
                  <div><strong>Fare:</strong> ₹{estimate}</div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {RIDE_OPTIONS.map((opt) => (
                  <button key={opt.id} className={`p-3 rounded-xl text-left border ${selected === opt.id ? "border-blue-600" : "border-gray-300"}`} onClick={() => setSelected(opt.id)}>
                    <div className="font-bold">{opt.name}</div>
                    <div className="text-sm">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <input type="text" placeholder="Promo code" className="flex-1 p-2 border rounded-xl" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                <button className="bg-blue-600 text-white p-2 rounded-xl" onClick={applyPromo}>Apply</button>
              </div>

              <button disabled={loading || !pickupCoords || !dropoffCoords} onClick={requestRide} className="mt-3 bg-gray-900 text-white py-3 rounded-xl hover:bg-black flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Request Ride
              </button>

              {rideInfo && (
                <div className="mt-4 p-3 bg-gray-200 rounded-xl">
                  <div><strong>Status:</strong> {rideInfo.status}</div>
                  {rideInfo.driver && (
                    <div className="mt-2">
                      <div><strong>Driver Name:</strong> {rideInfo.driver.name}</div>
                      <div><strong>Age:</strong> {rideInfo.driver.age}</div>
                      <div><strong>Contact:</strong> {rideInfo.driver.number}</div>
                      <div><strong>Car:</strong> {rideInfo.driver.car}</div>
                      <div><strong>Plate:</strong> {rideInfo.driver.plate}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

                       {/* Map Panel */}
                       <div className="flex-1 rounded-xl shadow-md overflow-hidden">
              <RiderMap
                pickupCoords={pickupCoords}
                dropoffCoords={dropoffCoords}
                driverCoords={driverCoords}
                setDistanceKm={setDistanceKm}
              />
            </div>
          </div>
        )}

        {/* Payment Section */}
        {rideInfo && rideInfo.status === "completed" && (
          <div className="mt-2 p-3 bg-gray-100 rounded-xl flex flex-col gap-2">
            <div className="text-gray-700 font-semibold">
              Pay ₹{estimate} for your ride
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`flex-1 p-2 rounded-xl border ${
                  paymentMethod === "cash" ? "border-blue-600" : "border-gray-300"
                }`}
              >
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod("upi")}
                className={`flex-1 p-2 rounded-xl border ${
                  paymentMethod === "upi" ? "border-blue-600" : "border-gray-300"
                }`}
              >
                UPI
              </button>
              <button
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 p-2 rounded-xl border ${
                  paymentMethod === "card" ? "border-blue-600" : "border-gray-300"
                }`}
              >
                Card
              </button>
            </div>

            {paymentMethod === "card" && (
              <Elements stripe={stripePromise}>
                <PaymentForm
                  rideId={rideInfo.id}
                  amount={estimate}
                  onSuccess={() => {
                    setRideInfo(null);
                    setServerMsg({ type: "success", text: "Ride complete & paid!" });
                  }}
                  onError={(msg) =>
                    setServerMsg({ type: "error", text: msg })
                  }
                />
              </Elements>
            )}

            {(paymentMethod === "cash" || paymentMethod === "upi") && (
              <button
                onClick={() => {
                  setRideInfo(null);
                  setServerMsg({ type: "success", text: "Ride complete & paid!" });
                }}
                className="w-full bg-green-600 text-white p-3 rounded-xl mt-2"
              >
                Pay Now
              </button>
            )}
          </div>
        )}
      </div> {/* closes flex-1 main panel */}
    </div> 
  );
}
