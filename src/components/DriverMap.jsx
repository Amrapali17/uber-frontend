"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

export default function DriverMap({ driverCoords, pickupCoords, dropoffCoords, setDistanceKm, setETA }) {
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("driver-map", {
        center: driverCoords || pickupCoords || [20, 77],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !pickupCoords || !dropoffCoords) return;

    // Remove old route
    if (routingControlRef.current) routingControlRef.current.remove();

    routingControlRef.current = L.Routing.control({
      waypoints: [L.latLng(driverCoords || pickupCoords), L.latLng(pickupCoords), L.latLng(dropoffCoords)],
      router: L.Routing.openrouteservice(ORS_API_KEY),
      lineOptions: { styles: [{ color: "#2563EB", weight: 5 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    })
      .on("routesfound", (e) => {
        const route = e.routes[0];
        const distanceInKm = route.summary.totalDistance / 1000;
        const durationInMin = route.summary.totalTime / 60;
        setDistanceKm(distanceInKm);
        setETA(Math.round(durationInMin));
      })
      .addTo(mapRef.current);
  }, [driverCoords, pickupCoords, dropoffCoords, setDistanceKm, setETA]);

  return <div id="driver-map" className="w-full h-64 rounded-xl shadow my-4" />;
}
