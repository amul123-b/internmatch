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

interface RoadmapItem {
  skill: string;
  steps: string[];
}

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

  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [match, setMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [resumeText, setResumeText] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status]);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const profileRes = await fetch("/api/user/profile");
      const profileData = await profileRes.json();
      setUserProfile(profileData.user);

      const jobRes = await fetch("/api/internships");
      const jobData = await jobRes.json();
      setInternships(jobData.jobs);

      const appRes = await fetch("/api/applications");
      const appData = await appRes.json();
      setApplications(appData.applications || []);
    };

    fetchData();
  }, [session]);

  // 🚀 ANALYZE
  const handleAnalyze = async () => {
    if (!selectedJobId) return alert("Select a job first");

    const job = internships.find(j => j._id === selectedJobId);
    if (!job || !userProfile) return;

    setLoading(true);
    setMissingSkills([]);
    setRoadmap([]);
    setMatch(null);

    const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
    const required = job.skillsRequired || [];

    const missing = required.filter(
      s => !userSkills.includes(s.toLowerCase())
    );

    const matchPercent = Math.round(
      ((required.length - missing.length) / required.length) * 100
    );

    setMissingSkills(missing);
    setMatch(matchPercent);

    const roadmapData: RoadmapItem[] = [];

    for (let skill of missing) {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        body: JSON.stringify({ skill }),
      });

      const data = await res.json();

      roadmapData.push({
        skill,
        steps: data.roadmap?.split("\n") || ["Learn basics", "Practice"],
      });
    }

    setRoadmap(roadmapData);
    setLoading(false);
  };

  // 🧾 RESUME
  const handleResume = async () => {
    const res = await fetch("/api/ai/resume", {
      method: "POST",
      body: JSON.stringify(userProfile),
    });

    const data = await res.json();
    setResumeText(data.resume);
  };

  // 📄 COVER LETTER
  const handleCoverLetter = async () => {
    const res = await fetch("/api/ai/cover-letter", {
      method: "POST",
      body: JSON.stringify(userProfile),
    });

    const data = await res.json();
    setCoverLetter(data.letter);
  };

  if (status === "loading") return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-pink-950 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-20">

        <h1 className="text-5xl font-bold mb-4">
          Welcome back, {session?.user?.name}
        </h1>

        {/* 🔥 JOB SELECTOR (FIXED ISSUE) */}
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="bg-black border border-white/20 p-3 rounded mb-6 w-full"
        >
          <option value="">Select Job</option>
          {internships.map(job => (
            <option key={job._id} value={job._id}>
              {job.title} - {job.company}
            </option>
          ))}
        </select>

        {/* FEATURE BUTTONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <button onClick={handleAnalyze} className="bg-purple-600 p-4 rounded">Skill Gap</button>
          <button onClick={handleAnalyze} className="bg-pink-600 p-4 rounded">Roadmap</button>
          <button onClick={handleResume} className="bg-blue-600 p-4 rounded">Resume</button>
          <button onClick={handleCoverLetter} className="bg-green-600 p-4 rounded">Cover Letter</button>
        </div>

        {/* RESULTS */}
        {match !== null && (
          <div className="mb-6">
            <h2>Match: {match}%</h2>
            <p>Missing Skills: {missingSkills.join(", ")}</p>
          </div>
        )}

        {roadmap.map((r, i) => (
          <div key={i} className="mb-4">
            <h3>{r.skill}</h3>
            <ul>
              {r.steps.map((s, j) => (
                <li key={j}>• {s}</li>
              ))}
            </ul>
          </div>
        ))}

        {resumeText && (
          <textarea className="w-full h-40 bg-black mt-6" value={resumeText} readOnly />
        )}

        {coverLetter && (
          <textarea className="w-full h-40 bg-black mt-6" value={coverLetter} readOnly />
        )}

      </main>

      <FloatingChatbot />
    </div>
  );
}