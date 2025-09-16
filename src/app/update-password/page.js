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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, number, role } },
    });
    if (error) setErrorMsg(error.message);
    else router.push("/login");
  }


  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMsg(error.message);
  }

  return (
    <div>
      <form onSubmit={handleSignup}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
        <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Phone Number" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="rider">Rider</option>
          <option value="driver">Driver</option>
        </select>
        <button type="submit">Sign Up</button>
      </form>
      <button onClick={handleGoogleSignup}>Sign Up with Google</button>
      {errorMsg && <p>{errorMsg}</p>}
    </div>
  );
}
