"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-white">

        <Link href="/" className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          InternMatch
        </Link>

        <div className="hidden md:flex gap-8 items-center text-sm text-gray-300">
          <Link href="/internships" className="hover:text-white">Internships</Link>
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>

          {session ? (
            <button onClick={() => signOut()} className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20">
              Logout
            </button>
          ) : (
            <Link href="/login" className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
              Login
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}