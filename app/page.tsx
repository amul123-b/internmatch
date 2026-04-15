import Link from "next/link";
import Navbar from "./components/Navbar";
import BackgroundGlow from "./components/BackgroundGlow";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white overflow-hidden">
      
      {/* Background Glow */}
      <BackgroundGlow />

      {/* Navbar */}
      <Navbar />

      {/* Main Content (stacked vertically) */}
      <main className="relative z-10 flex flex-col">

        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
            InternMatch
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-xl">
            Your AI-powered gateway to the best internships — discover, match, and apply effortlessly.
          </p>

       <Link
  href="/signup"
  className="mt-10 px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform shadow-lg inline-block"
>
  Get Started
</Link>
        </section>

        {/* FEATURES SECTION */}
        <section className="min-h-screen flex items-center py-24 px-6 bg-black/20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto text-center w-full">
            
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Why Choose InternMatch
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <h3 className="text-xl font-semibold mb-3">AI Matching</h3>
                <p className="text-gray-300">
                  Our AI analyzes your skills and matches you with the best internships.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
                <p className="text-gray-300">
                  Get personalized internship suggestions tailored to your career goals.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <h3 className="text-xl font-semibold mb-3">Easy Apply</h3>
                <p className="text-gray-300">
                  Apply to multiple internships with one profile and one click.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}