"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

export default function RiderMap({ pickupCoords, dropoffCoords, driverCoords, setDistanceKm }) {
  const mapRef = useRef(null);
  const routeRef = useRef(null);
  const driverMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("riderMap", { zoomControl: true, attributionControl: false }).setView([20, 78], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !pickupCoords || !dropoffCoords) return;

    // Remove existing route if any
    if (routeRef.current) mapRef.current.removeControl(routeRef.current);

    // Draw route
    routeRef.current = L.Routing.control({
      waypoints: [L.latLng(pickupCoords[0], pickupCoords[1]), L.latLng(dropoffCoords[0], dropoffCoords[1])],
      lineOptions: { styles: [{ color: "blue", weight: 4 }] },
      createMarker: (i, wp) => {
        const icon = L.divIcon({ className: "custom-marker", html: i === 0 ? "📍" : "🏁", iconSize: [25, 25] });
        return L.marker(wp.latLng, { icon });
      },
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
    }).addTo(mapRef.current);

    mapRef.current.fitBounds([pickupCoords, dropoffCoords], { padding: [50, 50] });

    // Distance calculation
    const latDiff = dropoffCoords[0] - pickupCoords[0];
    const lonDiff = dropoffCoords[1] - pickupCoords[1];
    const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // approx km
    setDistanceKm(distance.toFixed(1));
  }, [pickupCoords, dropoffCoords, setDistanceKm]);

  useEffect(() => {
    if (!mapRef.current || !driverCoords) return;

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker(driverCoords, {
        icon: L.divIcon({ className: "driver-marker", html: "🚗", iconSize: [25, 25] }),
      }).addTo(mapRef.current);
    } else {
      driverMarkerRef.current.setLatLng(driverCoords);
    }
  }, [driverCoords]);

  return <div id="riderMap" className="w-full h-full rounded-xl shadow-md" style={{ minHeight: "400px" }} />;
}
