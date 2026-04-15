"use client";

import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error natively to our new analytics/tracker
    console.error("Global Catch:", error);
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "global_error", details: error.message }),
    }).catch(() => {});
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-[#0b0416] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-3xl backdrop-blur-xl shadow-2xl max-w-lg w-full">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <h1 className="text-3xl font-bold text-red-400 mb-4">Criticial Application Error</h1>
            <p className="text-gray-300 mb-8 leading-relaxed">
              We encountered an unexpected technical issue. Our system has securely logged the event, and we apologize for the interruption.
            </p>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => reset()}
                className="px-6 py-3 bg-red-600/30 text-white rounded-xl hover:bg-red-600/50 transition font-semibold"
                aria-label="Attempt Recovery"
              >
                Try Again
              </button>
              <Link 
                href="/"
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition font-semibold flex items-center gap-2"
                aria-label="Return Home"
              >
                <Home className="w-4 h-4" /> Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
