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

  const [resumeText, setResumeText] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // AUTH
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status]);

  // FETCH DATA
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const profile = await fetch("/api/user/profile").then(res => res.json());
      const jobs = await fetch("/api/internships").then(res => res.json());
      const apps = await fetch("/api/applications").then(res => res.json());

      setUserProfile(profile.user);
      setInternships(jobs.jobs);
      setApplications(apps.applications || []);
    };

    fetchData();
  }, [session]);

  // ANALYZE
  const handleAnalyze = async () => {
    if (!selectedJobId) {
      alert("Please select a job 👇 first");
      return;
    }

    const job = internships.find(j => j._id === selectedJobId);
    if (!job) return;

    const userSkills = (userProfile?.skills || []).map(s => s.toLowerCase());
    const required = job.skillsRequired || [];

    const missing = required.filter(
      s => !userSkills.includes(s.toLowerCase())
    );

    setMissingSkills(missing);
    setMatch(
      Math.round(((required.length - missing.length) / required.length) * 100)
    );

    const roadmapResult: RoadmapItem[] = [];

    for (let skill of missing) {
      try {
        const res = await fetch("/api/ai/roadmap", {
          method: "POST",
          body: JSON.stringify({ skill }),
        });
        const data = await res.json();

        roadmapResult.push({
          skill,
          steps: data.roadmap?.split("\n") || [],
        });
      } catch {
        roadmapResult.push({
          skill,
          steps: ["Learn basics", "Practice", "Build projects"],
        });
      }
    }

    setRoadmap(roadmapResult);
  };

  // RESUME
  const handleResume = async () => {
    const res = await fetch("/api/ai/resume", {
      method: "POST",
      body: JSON.stringify(userProfile),
    });
    const data = await res.json();
    setResumeText(data.resume);
  };

  // COVER LETTER
  const handleCover = async () => {
    const res = await fetch("/api/ai/cover-letter", {
      method: "POST",
      body: JSON.stringify(userProfile),
    });
    const data = await res.json();
    setCoverLetter(data.letter);
  };

  if (!session) return null;

  const features = [
    { title: "Skill Gap Analyzer", icon: Brain, action: handleAnalyze },
    { title: "Roadmap Generator", icon: Map, action: handleAnalyze },
    { title: "Resume Builder", icon: FileText, action: handleResume },
    { title: "Cover Letter Generator", icon: PenTool, action: handleCover },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-950 to-black text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24">

        <h1 className="text-5xl font-bold mb-2">
          Welcome back, {session.user?.name?.split(" ")[0]}
        </h1>

        <p className="text-gray-400 mb-8">
          Analyze your skills and generate smart roadmaps 🚀
        </p>

        {/* JOB SELECT */}
        <select
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="mb-10 p-3 rounded bg-black border border-purple-500"
        >
          <option value="">Select a job</option>
          {internships.map(job => (
            <option key={job._id} value={job._id}>
              {job.title} - {job.company}
            </option>
          ))}
        </select>

        {/* APPLICATIONS */}
        <div className="bg-purple-900/40 p-6 rounded-xl mb-10">
          <h2 className="text-xl font-bold mb-4">My Applications</h2>

          {applications.length === 0 ? (
            <p>No applications yet</p>
          ) : (
            applications.map((app, i) => (
              <div key={i} className="bg-black/40 p-4 rounded mb-3">
                <p>{app.jobTitle}</p>
                <p className="text-gray-400">{app.company}</p>
                <p className="text-green-400">{app.status}</p>
              </div>
            ))
          )}
        </div>

        {/* FEATURES */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {features.map((f, i) => {
            const Icon = f.icon;

            return (
              <motion.div
                key={i}
                whileHover={{
                  scale: 1.08,
                  boxShadow: "0px 0px 25px rgba(168,85,247,0.8)"
                }}
                onClick={f.action}
                className="p-6 bg-purple-800/30 rounded-xl text-center cursor-pointer transition"
              >
                <Icon className="mx-auto mb-3 text-pink-400" />
                <p>{f.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* RESULTS */}
        {match !== null && (
          <div className="mb-6">Match: {match}%</div>
        )}

        {missingSkills.map((skill, i) => (
          <div key={i}>{skill}</div>
        ))}

        {roadmap.map((r, i) => (
          <div key={i} className="mb-4">
            <h3>{r.skill}</h3>
            <ul>
              {r.steps.map((s, j) => <li key={j}>• {s}</li>)}
            </ul>
          </div>
        ))}

        {resumeText && (
          <textarea value={resumeText} readOnly className="w-full h-40 mt-6 bg-black p-3" />
        )}

        {coverLetter && (
          <textarea value={coverLetter} readOnly className="w-full h-40 mt-6 bg-black p-3" />
        )}

      </main>

      <FloatingChatbot />
    </div>
  );
}