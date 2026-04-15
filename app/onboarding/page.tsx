"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Map, FileText, PenTool, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import FloatingChatbot from "@/app/components/FloatingChatbot";
import { Internship } from "@/app/api/internships/route";

type UserProfile = {
  name: string;
  email: string;
  role?: string;
  skills?: string[];
};

interface RoadmapItem {
  skill: string;
  steps: string[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");

  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [match, setMatch] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // 🔐 Auth check
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status]);

  // 📦 Fetch data
  useEffect(() => {
    if (!session) return;

    fetch("/api/user/profile")
      .then(res => res.json())
      .then(data => setUserProfile(data.user));

    fetch("/api/internships")
      .then(res => res.json())
      .then(data => setInternships(data.jobs));
  }, [session]);

  // 🚀 MAIN FUNCTION (FIXED)
  const handleAnalyze = async () => {
    if (!userProfile) return alert("Profile loading...");
    if (!selectedJobId) return alert("Select a job first");

    setLoading(true);

    try {
      const job = internships.find(j => j._id === selectedJobId);
      if (!job) return;

      const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
      const required = job.skillsRequired || [];

      const missing = required.filter(
        s => !userSkills.includes(s.toLowerCase())
      );

      // ✅ MATCH %
      const matchPercent = Math.round(
        ((required.length - missing.length) / required.length) * 100
      );

      setMissingSkills(missing);
      setMatch(matchPercent);

      // 🚀 AUTO ROADMAP
      const roadmapResult: RoadmapItem[] = [];

      for (let skill of missing) {
        const res = await fetch("/api/ai/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill }),
        });

        const data = await res.json();

        roadmapResult.push({
          skill,
          steps: data.roadmap
            .split("\n")
            .map((s: string) => s.trim())
            .filter((s: string) => s),
        });
      }

      setRoadmap(roadmapResult);

    } catch (err) {
      console.error(err);
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p className="text-white text-center mt-20">Loading...</p>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-pink-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 pt-24">

        {/* HEADER */}
        <h1 className="text-5xl font-extrabold mb-2">
          Welcome back, {session.user?.name?.split(" ")[0]}
        </h1>

        <p className="text-gray-300 mb-10">
          Analyze your skills and generate smart roadmaps.
        </p>

        {/* TOP CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[Brain, Map, FileText, PenTool].map((Icon, i) => (
            <div key={i} className="p-6 bg-white/5 rounded-xl">
              <Icon className="text-pink-400" />
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* SKILL GAP */}
          <div className="bg-white/5 p-6 rounded-xl">
            <h2 className="flex gap-2 mb-4">
              <Brain /> Skill Gap
            </h2>

            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full p-2 mb-4 bg-black/50"
            >
              <option value="">Select job</option>
              {internships.map(j => (
                <option key={j._id} value={j._id}>
                  {j.title} @ {j.company}
                </option>
              ))}
            </select>

            <button
              onClick={handleAnalyze}
              className="bg-purple-600 px-4 py-2 rounded"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>

            {/* RESULT */}
            {missingSkills.length > 0 && (
              <div className="mt-4">

                <p className="text-green-400 font-bold">
                  Match: {match}%
                </p>

                <p className="mt-2 text-red-400">Missing Skills:</p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {missingSkills.map(s => (
                    <span key={s} className="bg-pink-500/20 px-3 py-1 rounded">
                      {s}
                    </span>
                  ))}
                </div>

              </div>
            )}
          </div>

          {/* ROADMAP */}
          <div className="bg-white/5 p-6 rounded-xl">
            <h2 className="flex gap-2 mb-4">
              <Map /> Roadmap
            </h2>

            {roadmap.length === 0 ? (
              <p>No roadmap yet</p>
            ) : (
              roadmap.map((r, i) => (
                <div key={i} className="mb-4">
                  <h3 className="text-cyan-300">{r.skill}</h3>

                  <ul>
                    {r.steps.map((step, j) => (
                      <li key={j} className="flex gap-2">
                        <ChevronRight /> {step}
                      </li>
                    ))}
                  </ul>

                </div>
              ))
            )}
          </div>

        </div>

      </main>

      <FloatingChatbot />
    </div>
  );
}