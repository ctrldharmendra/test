// components/GoogleSignInButton.jsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function GoogleSignInButton() {
  const buttonRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Google sign-in failed");
        return;
      }

      if (data.isNewUser) {
        // NAYA user — complete-profile page pe bhejo, saath me pending token
        sessionStorage.setItem("pendingSignupToken", data.pendingSignupToken);
        sessionStorage.setItem("googlePrefill", JSON.stringify(data.prefill));
        router.push("/signup/google");
      } else {
        // EXISTING user — seedha login ho gaya
        toast.success("Logged in successfully");
        router.push("/explore"); // ya jo bhi aapka home route hai
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Something went wrong");
    }
  };

  return <div ref={buttonRef} />;
}