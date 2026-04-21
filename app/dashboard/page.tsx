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

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // AUTH
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // FETCH DATA
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

  // 🔥 ANALYZE (ROADMAP)
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

    } catch {
      alert("Analysis failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 RESUME
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

  // 🔥 COVER LETTER
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

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-300 via-pink-400 to-purple-500 text-transparent bg-clip-text">
            Welcome back, {session.user?.name?.split(" ")[0]} ✨
          </h1>

          <p className="text-gray-300 mt-3 text-lg">
            Build your future with AI-powered tools 🚀
          </p>
        </div>

        {/* JOB SELECT */}
        <div className="mb-10">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-black/60 border border-purple-500 px-5 py-3 rounded-xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 hover:shadow-[0_0_20px_#a855f7]"
          >
            <option value="">Select Internship 💼</option>
            {internships.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} - {job.company}
              </option>
            ))}
          </select>
        </div>

        {/* APPLICATIONS */}
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg mb-12">
          <h2 className="text-xl font-bold mb-4 text-purple-300">
            My Applications
          </h2>

          {applications.length === 0 ? (
            <p className="text-gray-400">No applications yet</p>
          ) : (
            applications.map((app, i) => (
              <div
                key={i}
                className="mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-black/40 border border-purple-500/20 hover:shadow-[0_0_25px_#9333ea] transition"
              >
                <p className="font-bold text-white">{app.jobTitle}</p>
                <p className="text-sm text-gray-400">{app.company}</p>
                <p className="text-green-400 text-sm">{app.status}</p>
              </div>
            ))
          )}
        </div>

        {/* FEATURES */}
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

        {/* 🔥 RESULT UI */}
{result && (
  <div className="mt-12">

    {/* 🎯 ROADMAP */}
    {result.roadmap ? (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-purple-300">
          Your Skill Roadmap 🚀
        </h2>

        <div className="space-y-6">
          {result.roadmap.map((item: any, index: number) => (
            <div
              key={index}
              className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-black/40 
              border border-purple-500/20 backdrop-blur-xl 
              hover:shadow-[0_0_30px_#a855f7] transition"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 flex items-center justify-center rounded-full 
                bg-purple-600 text-white font-bold shadow-lg">
                  {item.step}
                </div>

                <h3 className="text-lg font-semibold text-purple-200">
                  {item.title}
                </h3>
              </div>

              <p className="text-gray-300 ml-14">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    ) : null}

    {/* 📄 RESUME */}
    {typeof result === "string" && result.includes("SKILLS") && (
      <div className="bg-black/40 p-6 rounded-xl border border-purple-500">
        <h2 className="text-xl mb-4 text-purple-300">Your Resume 📄</h2>
        <pre className="whitespace-pre-wrap text-sm text-gray-200">
          {result}
        </pre>
      </div>
    )}

    {/* 💌 COVER LETTER */}
    {typeof result === "string" && result.includes("Dear") && (
      <div className="bg-black/40 p-6 rounded-xl border border-purple-500">
        <h2 className="text-xl mb-4 text-purple-300">Cover Letter 💌</h2>
        <pre className="whitespace-pre-wrap text-sm text-gray-200">
          {result}
        </pre>
      </div>
    )}

  </div>
)}

      </main>

      <FloatingChatbot />
    </div>
  );
}