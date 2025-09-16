"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="w-screen min-h-screen flex flex-col">

      {}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <h1 className="text-3xl md:text-4xl font-extrabold text-[#0a1f44]">Drivio</h1>

        <nav className="flex gap-4">
          <button onClick={() => setShowAbout(true)} className="font-bold text-gray-700 hover:text-black transition">
            About
          </button>
          <button onClick={() => setShowContact(true)} className="font-bold text-gray-700 hover:text-black transition">
            Contact
          </button>
          <Link href="/login" className="font-bold text-gray-700 hover:text-black transition">
            Login
          </Link>
        </nav>
      </header>

      <div className="pt-20 flex-1">

        {}
        <section
          className="relative w-full h-[80vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden"
          style={{
            backgroundImage: "url('/images/map.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-[#0a1f44] opacity-60"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white">Your Ride, Anytime</h1>
            <p className="text-lg md:text-xl mb-8 font-semibold text-white max-w-2xl mx-auto">
              Book rides instantly, track them live, and travel safely. Designed for riders and drivers alike.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link href="/signup" className="px-8 py-4 bg-white text-[#0a1f44] rounded-lg hover:bg-gray-200 transition transform hover:scale-105">
                Get Started
              </Link>
              <Link href="/login" className="px-8 py-4 border border-white text-white rounded-lg hover:bg-white hover:text-[#0a1f44] transition transform hover:scale-105">
                Login
              </Link>
            </div>
          </div>
        </section>

        {}
        <section className="py-12 bg-[#f5faff] text-[#0a1f44] text-center">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-4xl font-bold">500+</h3>
              <p className="mt-2 font-semibold">Rides Completed</p>
            </div>
            <div className="p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-4xl font-bold">120+</h3>
              <p className="mt-2 font-semibold">Active Drivers</p>
            </div>
            <div className="p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="text-4xl font-bold">98%</h3>
              <p className="mt-2 font-semibold">Rider Satisfaction</p>
            </div>
          </div>
        </section>

        {}
        <section className="px-4 py-12 bg-white text-gray-900">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#0a1f44]">Why Choose Drivio?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">🚗 Safe Rides</h3>
              <p className="font-semibold">Your safety is our priority with vetted drivers and real-time tracking.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">⚡ Fast Booking</h3>
              <p className="font-semibold">Quick booking with just a few taps — no more waiting around.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">💳 Easy Payments</h3>
              <p className="font-semibold">Multiple payment options for a smooth experience every time.</p>
            </div>
          </div>
        </section>

        {}
        <section className="mt-12 text-center bg-white py-12">
  <h2 className="text-2xl font-bold mb-8 text-[#0a1f44]">Getting Started is Easy</h2>
  <div className="flex flex-col md:flex-row max-w-4xl mx-auto gap-4">
    <div className="flex-1 bg-white p-6 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105">
      <div className="text-3xl mb-3 font-bold text-black">1️⃣</div>
      <p className="font-bold text-black">Sign up as a Rider or Driver</p>
    </div>
    <div className="flex-1 bg-white p-6 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105">
      <div className="text-3xl mb-3 font-bold text-black">2️⃣</div>
      <p className="font-bold text-black">Book or accept rides</p>
    </div>
    <div className="flex-1 bg-white p-6 rounded-xl shadow hover:shadow-lg transition transform hover:scale-105">
      <div className="text-3xl mb-3 font-bold text-black">3️⃣</div>
      <p className="font-bold text-black">Track rides and make payments easily</p>
    </div>
  </div>
</section>


        {}
        <section className="py-12 bg-[#f0f4ff] text-[#0a1f44] text-center">
          <h2 className="text-3xl font-bold mb-8">What Riders Say</h2>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:scale-105">
              <p>"Fast and reliable rides every time! Highly recommend Drivio."</p>
              <p className="mt-2 font-semibold">- Priya S.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:scale-105">
              <p>"The driver was very professional and the ride was smooth."</p>
              <p className="mt-2 font-semibold">- Raj K.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition transform hover:scale-105">
              <p>"Payment options are very convenient and the app is easy to use."</p>
              <p className="mt-2 font-semibold">- Anjali M.</p>
            </div>
          </div>
        </section>

      </div>

      {}
      <footer className="w-full text-center text-gray-500 text-sm py-6 border-t border-gray-200">
        © 2025 Drivio. All rights reserved.
      </footer>

      {}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50 transition-opacity duration-500">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-4 relative transform transition-transform duration-500 animate-slideDown">
            <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 text-gray-700">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
            <p className="text-gray-800 text-sm">
              Welcome to Drivio! By using our service, you agree to: <br />
              - Follow local regulations and road safety rules. <br />
              - Respect drivers and riders at all times. <br />
              - Ensure timely and responsible use of the platform. <br />
              - Payments are processed securely; refunds and cancellations are handled per our policy. <br />
              - Personal data is protected as per our privacy policy. <br />
              - Ratings and feedback may influence service quality. <br />
              - Drivers must maintain valid licenses and insurance. <br />
              - Riders should provide accurate pick-up and drop-off locations. <br />
              Thank you for choosing Drivio!
            </p>
          </div>
        </div>
      )}

      {}
      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50 transition-opacity duration-500">
          <div className="bg-white rounded-lg p-6 max-w-lg mx-4 relative transform transition-transform duration-500 animate-slideDown">
            <button onClick={() => setShowContact(false)} className="absolute top-4 right-4 text-gray-700">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-800 mb-4">
              Email: support@drivio.com <br />
              Phone: +91 98765 43210 <br />
              Address: 45 Koregaon Park, Pune, Maharashtra, India
            </p>
            <form className="flex flex-col gap-3">
              <input type="text" placeholder="Your Name" className="border border-gray-300 rounded px-3 py-2" />
              <input type="email" placeholder="Your Email" className="border border-gray-300 rounded px-3 py-2" />
              <textarea placeholder="Your Message" className="border border-gray-300 rounded px-3 py-2"></textarea>
              <button type="submit" className="bg-[#0a1f44] text-white px-4 py-2 rounded hover:bg-black transition">
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
