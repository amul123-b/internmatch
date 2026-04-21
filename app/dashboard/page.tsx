"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Map, FileText, PenTool } from "lucide-react";
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

type Application = {
  jobTitle: string;
  company: string;
  status: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");

  // NEW STATES (IMPORTANT)
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // AUTH
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // FETCH
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const profile = await fetch("/api/user/profile").then(r => r.json());
      const jobs = await fetch("/api/internships").then(r => r.json());
      const apps = await fetch("/api/applications").then(r => r.json());

      setUserProfile(profile.user);
      setInternships(jobs.jobs);
      setApplications(apps.applications || []);
    };

    fetchData();
  }, [session]);

  // 🔥 REAL ANALYZE
  const handleAnalyze = async () => {
    if (!selectedJobId) return alert("Select a job first 😭");

    const job = internships.find(j => j._id === selectedJobId);
    if (!job) return;

    setLoading(true);

    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          skills: job.skillsRequired || []
        })
      });

      const data = await res.json();
      setResult(data);
      alert("Analysis Done ✅");

    } catch (err) {
      alert("Analysis failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 REAL RESUME
  const handleResume = async () => {
    if (!userProfile) return;

    setLoading(true);

    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: userProfile.name,
          role: userProfile.role,
          skills: userProfile.skills
        })
      });

      const data = await res.json();
      setResult(data.resume);
      alert("Resume Ready 📄");

    } catch {
      alert("Resume failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 REAL COVER LETTER
  const handleCoverLetter = async () => {
    if (!userProfile) return;

    const job = internships.find(j => j._id === selectedJobId);

    setLoading(true);

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: userProfile.name,
          role: job?.title || "Software Intern",
          company: job?.company || "Company"
        })
      });

      const data = await res.json();
      setResult(data.letter);
      alert("Cover Letter Ready 💌");

    } catch {
      alert("Cover letter failed ❌");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#2b0a4d] to-[#4b006e] text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-16 pt-28">

        <div className="mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-300 via-pink-400 to-purple-500 text-transparent bg-clip-text">
            Welcome back, {session.user?.name?.split(" ")[0]} ✨
          </h1>

          <p className="text-gray-300 mt-3 text-lg">
            Build your future with AI-powered tools 🚀
          </p>
        </div>

        <div className="mb-10">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-black/60 border border-purple-500 px-5 py-3 rounded-xl backdrop-blur-md"
          >
            <option value="">Select Internship 💼</option>
            {internships.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} - {job.company}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={f.action}
                className="cursor-pointer p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-purple-500/20 text-center 
                hover:shadow-[0_0_40px_#a855f7] transition duration-300"
              >
                <Icon className="mx-auto mb-4 text-purple-400" size={30} />
                <p className="text-sm font-semibold">{f.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* RESULT DISPLAY */}
        {result && (
          <div className="mt-10 bg-black/40 p-6 rounded-xl border border-purple-500">
            <pre className="whitespace-pre-wrap text-sm">
              {typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

      </main>

      <FloatingChatbot />
    </div>
  );
}