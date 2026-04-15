"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔥 THIS FIXES GOOGLE REDIRECT LOOP
  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      if ((session.user as any)?.isOnboarded) {
        router.push("/internships");
      } else {
        router.push("/onboarding");
      }
    }
  }, [session, status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0033] via-[#2d0b4e] to-[#4a0d67]">
      
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
      >
        <h1 className="text-3xl font-bold text-center text-white">
          Welcome Back
        </h1>

        {error && <p className="text-red-400">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          autoComplete="new-email"
          className="w-full mt-4 p-3 rounded bg-black/40 text-white"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          className="w-full mt-3 p-3 rounded bg-black/40 text-white"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full mt-4 p-3 bg-purple-500 rounded">
          Login
        </button>

        <div className="text-center my-4 text-gray-400">OR</div>

        {/* 🔥 IMPORTANT: NO callbackUrl */}
        <button
          type="button"
          onClick={() => signIn("google")}
          className="w-full p-3 bg-white/10 rounded mb-2"
        >
          Google
        </button>

        <button
          type="button"
          onClick={() => signIn("linkedin")}
          className="w-full p-3 bg-white/10 rounded"
        >
          LinkedIn
        </button>
      </form>
    </div>
  );
}