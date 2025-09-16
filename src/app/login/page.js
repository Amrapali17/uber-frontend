"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from '../../../lib/supabaseClient';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setErrorMsg(authError.message);
      return;
    }

    if (!authData.session) {
      setErrorMsg("Login failed");
      return;
    }

    localStorage.setItem("token", authData.session.access_token);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (userError) {
      setErrorMsg(userError.message);
      return;
    }

    const role = userData?.role || "rider";
    router.push(`/${role}`);
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMsg(error.message);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-6">
      <div className="w-full max-w-md bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-md">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 text-center">
          Welcome Back
        </h1>

        {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white placeholder-gray-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 bg-white placeholder-gray-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Login with Google
          </button>
          <a
            href="/forgot-password"
            className="text-blue-600 hover:underline text-sm block"
          >
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}
