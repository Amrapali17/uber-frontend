"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '../../../lib/supabaseClient';


export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("rider");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSignup(e) {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });

    if (authError) {
      setErrorMsg(authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setErrorMsg("Signup failed: no user ID returned");
      return;
    }

    const { error: dbError } = await supabase
      .from("users")
      .insert([{ id: userId, name, email, phone: number, role }]);

    if (dbError) {
      setErrorMsg(dbError.message);
      return;
    }

    router.push("/login");
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { prompt: "select_account" },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setErrorMsg(error.message);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-6">
      <div className="w-full max-w-md bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">
          Create your Drivio Account
        </h1>

        {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white placeholder-gray-400"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white placeholder-gray-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white placeholder-gray-400"
          />

          {/* Toggle Button for Rider/Driver */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => setRole("rider")}
              className={`px-6 py-2 rounded-lg font-bold transition ${
                role === "rider"
                  ? "bg-[#0a1f44] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Rider
            </button>
            <button
              type="button"
              onClick={() => setRole("driver")}
              className={`px-6 py-2 rounded-lg font-bold transition ${
                role === "driver"
                  ? "bg-[#0a1f44] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Driver
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleGoogleSignup}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
}
