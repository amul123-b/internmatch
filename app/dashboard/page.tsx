"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Map, FileText, PenTool, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import FloatingChatbot from "@/app/components/FloatingChatbot";
type Internship = {
  _id: string;
  title: string;
  company: string;
  skillsRequired?: string[];
};

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
  const [match, setMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 AI OUTPUT STATES
  const [resumeText, setResumeText] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // 🔐 AUTH CHECK
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // 📦 FETCH DATA
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        const profileRes = await fetch("/api/user/profile");
        const profileData = await profileRes.json();
        setUserProfile(profileData.user);

        const jobRes = await fetch("/api/internships");
        const jobData = await jobRes.json();
        setInternships(jobData.jobs);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [session]);

  // 🚀 SKILL ANALYSIS
  const handleAnalyze = async () => {
    if (!userProfile) return alert("Profile loading...");
    if (!selectedJobId) return alert("Select a job first");

    setLoading(true);
    setRoadmap([]);
    setMissingSkills([]);
    setMatch(null);

    try {
      const job = internships.find(j => j._id === selectedJobId);
      if (!job) throw new Error("Job not found");

      const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
      const required = job.skillsRequired || [];

      const missing = required.filter(
        s => !userSkills.includes(s.toLowerCase())
      );

      const matchPercent = Math.max(
        0,
        Math.round(((required.length - missing.length) / required.length) * 100)
      );

      setMissingSkills(missing);
      setMatch(matchPercent);

      const roadmapResult: RoadmapItem[] = [];

      for (let skill of missing) {
        try {
          const res = await fetch("/api/ai/roadmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skill }),
          });

          const data = await res.json();

          roadmapResult.push({
            skill,
            steps: data.roadmap
              ?.split("\n")
              .map((s: string) => s.trim())
              .filter((s: string) => s),
          });
        } catch {
          roadmapResult.push({
            skill,
            steps: ["Learn basics", "Practice projects", "Apply in real tasks"],
          });
        }
      }

      setRoadmap(roadmapResult);

    } catch (err) {
      console.error(err);
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 RESUME BUILDER
  const handleResume = async () => {
    if (!userProfile) return;

    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userProfile.name,
          role: userProfile.role || "Software Developer",
          skills: userProfile.skills || [],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.resume) {
        setResumeText("❌ Resume generation failed.");
        return;
      }

      setResumeText(data.resume);

    } catch (err) {
      console.error(err);
      setResumeText("❌ Resume generation error.");
    }
  };

  // 🔥 COVER LETTER
  const handleCoverLetter = async () => {
    if (!userProfile) return;

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userProfile.name,
          role: userProfile.role || "Software Intern",
          company: "Target Company",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.letter) {
        setCoverLetter("❌ Cover letter generation failed.");
        return;
      }

      setCoverLetter(data.letter);

    } catch (err) {
      console.error(err);
      setCoverLetter("❌ Cover letter error.");
    }
  };

  if (status === "loading") {
    return <p className="text-white text-center mt-20">Loading...</p>;
  }

  if (!session) return null;

  const features = [
    { title: "Skill Gap Analyzer", icon: Brain, action: handleAnalyze },
    { title: "Roadmap Generator", icon: Map, action: handleAnalyze },
    { title: "Resume Builder", icon: FileText, action: handleResume },
    { title: "Cover Letter Generator", icon: PenTool, action: handleCoverLetter },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-pink-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 pt-24">

        <h1 className="text-5xl font-extrabold mb-2">
          Welcome back, {session.user?.name?.split(" ")[0] || "User"}
        </h1>

        <p className="text-gray-300 mb-10">
          Analyze your skills and generate smart roadmaps.
        </p>

        {/* TOP CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {features.map((f, i) => {
            const Icon = f.icon;

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                onClick={f.action}
                className="p-6 bg-white/5 rounded-xl text-center cursor-pointer hover:bg-white/10 transition"
              >
                <Icon className="mx-auto mb-3 text-pink-400" />
                <p className="text-white text-sm font-semibold">
                  {f.title}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* RESULTS */}
        {resumeText && (
          <div className="bg-white/5 p-6 rounded-xl mb-6">
            <h2 className="mb-3 text-cyan-300">Generated Resume</h2>
            <pre className="whitespace-pre-wrap">{resumeText}</pre>
          </div>
        )}

        {coverLetter && (
          <div className="bg-white/5 p-6 rounded-xl mb-6">
            <h2 className="mb-3 text-cyan-300">Cover Letter</h2>
            <pre className="whitespace-pre-wrap">{coverLetter}</pre>
          </div>
        )}

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

            {match !== null && (
              <div className="mt-4">
                <p className="text-green-400 font-bold">
                  Match: {match}%
                </p>
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