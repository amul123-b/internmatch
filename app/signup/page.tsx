"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      // ✅ LOGIN AFTER SIGNUP
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        alert("Signup done. Please login manually.");
        router.push("/login");
        return;
      }

      // ✅ WAIT FOR SESSION (IMPORTANT FIX)
      const session = await getSession();

      if ((session?.user as any)?.isOnboarded) {
        router.push("/internships");
      } else {
        router.push("/onboarding");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white">

      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">

        <h1 className="text-3xl font-bold text-center mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="off"   // 🔥 FIX autofill bug
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40"
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password"  // 🔥 FIX autofill bug
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40"
          />

          <button className="w-full py-3 bg-purple-600 rounded-xl">
            Sign Up
          </button>
        </form>

        {/* OAuth */}
        <div className="mt-6 space-y-3">

          <button
            onClick={() =>
              signIn("google", { callbackUrl: "/post-login" })
            }
            className="w-full py-3 bg-white/10 rounded-xl"
          >
            Continue with Google
          </button>

          <button
            onClick={() =>
              signIn("linkedin", { callbackUrl: "/post-login" })
            }
            className="w-full py-3 bg-white/10 rounded-xl"
          >
            Continue with LinkedIn
          </button>

        </div>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}