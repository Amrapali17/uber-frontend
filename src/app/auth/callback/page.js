"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // Get the session after redirect
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error.message);
      } else {
        // Redirect based on user metadata role
        const role = session?.user?.user_metadata?.role || "rider";
        router.push(`/${role}`);
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <p>Processing login, please wait...</p>
    </div>
  );
}
