"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Map, FileText, PenTool, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import FloatingChatbot from "@/app/components/FloatingChatbot";

// ✅ TYPES
type Internship = {
  _id: string;
  title: string;
  company: string;
  skillsRequired?: string[];
};

type Application = {
  jobTitle: string;
  company: string;
  status: string;
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
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");

  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [match, setMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [resumeText, setResumeText] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // 🔐 AUTH CHECK
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  // 📦 FETCH ALL DATA
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

        // ✅ FETCH APPLICATIONS
        const appRes = await fetch("/api/applications");
        const appData = await appRes.json();
        setApplications(appData.applications || []);

      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [session]);

  // 🚀 ANALYZE
  const handleAnalyze = async () => {
    if (!userProfile) return alert("Profile loading...");
    if (!selectedJobId) return alert("Select a job");

    setLoading(true);
    setRoadmap([]);
    setMatch(null);

    try {
      const job = internships.find(j => j._id === selectedJobId);
      if (!job) return;

      const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
      const required = job.skillsRequired || [];

      const missing = required.filter(
        s => !userSkills.includes(s.toLowerCase())
      );

      const percent = Math.round(
        ((required.length - missing.length) / required.length) * 100
      );

      setMatch(percent);

      const roadmapData: RoadmapItem[] = [];

      for (let skill of missing) {
        try {
          const res = await fetch("/api/ai/roadmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skill }),
          });

          const data = await res.json();

          roadmapData.push({
            skill,
            steps: data.roadmap?.split("\n") || [],
          });
        } catch {
          roadmapData.push({
            skill,
            steps: ["Learn basics", "Practice", "Build projects"],
          });
        }
      }

      setRoadmap(roadmapData);

    } catch {
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  // 🧾 RESUME
  const handleResume = async () => {
    if (!userProfile) return;

    const res = await fetch("/api/ai/resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userProfile.name,
        role: userProfile.role,
        skills: userProfile.skills,
      }),
    });

    const data = await res.json();
    setResumeText(data.resume || "Failed");
  };

  // 📄 COVER LETTER
  const handleCoverLetter = async () => {
    if (!userProfile) return;

    const res = await fetch("/api/ai/cover-letter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userProfile.name,
        role: userProfile.role,
        company: "Target Company",
      }),
    });

    const data = await res.json();
    setCoverLetter(data.letter || "Failed");
  };

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-20">

        <h1 className="text-4xl font-bold mb-6">
          Welcome {session.user?.name}
        </h1>

        {/* 🔥 APPLICATION TRACKER */}
        <div className="bg-white/5 p-6 rounded mb-10">
          <h2 className="text-xl mb-4">My Applications</h2>

          {applications.length === 0 ? (
            <p>No applications yet</p>
          ) : (
            applications.map((app, i) => (
              <div key={i} className="p-3 mb-2 bg-black/40 rounded">
                <p className="font-bold">{app.jobTitle}</p>
                <p>{app.company}</p>
                <p className="text-green-400">{app.status}</p>
              </div>
            ))
          )}
        </div>

        {/* 🎯 FEATURE CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {[ 
            { title: "Analyze", action: handleAnalyze },
            { title: "Roadmap", action: handleAnalyze },
            { title: "Resume", action: handleResume },
            { title: "Cover Letter", action: handleCoverLetter },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              onClick={f.action}
              className="p-6 bg-white/5 rounded cursor-pointer text-center"
            >
              {f.title}
            </motion.div>
          ))}
        </div>

        {/* JOB SELECT */}
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="p-2 mb-4 bg-black"
        >
          <option value="">Select job</option>
          {internships.map(j => (
            <option key={j._id} value={j._id}>
              {j.title}
            </option>
          ))}
        </select>

        {/* MATCH */}
        {match !== null && (
          <p className="text-green-400">Match: {match}%</p>
        )}

        {/* ROADMAP */}
        {roadmap.map((r, i) => (
          <div key={i}>
            <h3>{r.skill}</h3>
            {r.steps.map((s, j) => (
              <p key={j}>- {s}</p>
            ))}
          </div>
        ))}

        {/* RESUME */}
        {resumeText && (
          <pre className="bg-white/5 p-4 mt-6">{resumeText}</pre>
        )}

        {/* COVER LETTER */}
        {coverLetter && (
          <pre className="bg-white/5 p-4 mt-6">{coverLetter}</pre>
        )}

      </main>

      <FloatingChatbot />
    </div>
  );
}