"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleForgotPassword(e) {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("Check your email for reset instructions.");
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-6">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl border border-gray-700">
        <h1 className="text-2xl font-semibold mb-6 text-white text-center">
          Reset Password
        </h1>

        {message && <p className="text-green-400 text-sm mb-4 text-center">{message}</p>}
        {errorMsg && <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>}

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <input
            type="email"
            className="w-full border border-gray-600 p-3 rounded-lg text-white bg-gray-700 placeholder-gray-400"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
