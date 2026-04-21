"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { MapPin, DollarSign } from "lucide-react";

type Internship = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  stipend?: string;
  salary?: string;
  description?: string;
  skillsRequired?: string[];
};

export default function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);

  const [job, setJob] = useState<Internship | null>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  // 📦 LOAD JOB
  useEffect(() => {
    const stored = localStorage.getItem("selectedJob");
    if (stored) setJob(JSON.parse(stored));
    else router.push("/internships");
  }, []);

  // 🚀 AI GENERATE
  const handleGenerate = async () => {
    if (!job) return;
    setLoading(true);

    const res = await fetch("/api/ai/generate-application", {
      method: "POST",
      body: JSON.stringify({
        jobTitle: job.title,
        company: job.company,
        description: job.description,
      }),
    });

    const data = await res.json();
    setAiData(data);
    setLoading(false);
  };

  // ✅ SUBMIT
  const handleSubmit = async () => {
    if (!job) return;

    await fetch("/api/applications", {
      method: "POST",
      body: JSON.stringify({
        jobTitle: job.title,
        company: job.company,
      }),
    });

    setApplied(true);

    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#140021] to-[#2d0036] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10">

        {/* LEFT SIDE — JOB DETAILS */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <p className="text-gray-300">{job.company}</p>

          <div className="flex gap-4 text-sm text-gray-400 mt-3">
            <span className="flex gap-1">
              <MapPin size={14} /> {job.location || "N/A"}
            </span>
            <span className="flex gap-1">
              <DollarSign size={14} />
              {job.salary || job.stipend || "N/A"}
            </span>
          </div>

          <p className="mt-6 text-gray-300 leading-relaxed">
            {job.description}
          </p>

          <div className="mt-6">
            <h3 className="text-sm mb-2 text-gray-400">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(job.skillsRequired || []).map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 bg-purple-500/30 rounded-full text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — AI PANEL */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">

          {!aiData && (
            <div className="text-center mt-10">
              <button
                onClick={handleGenerate}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold"
              >
                {loading ? "Generating..." : "🚀 Generate with AI"}
              </button>
            </div>
          )}

          {aiData && !applied && (
            <div className="space-y-6">

              {/* RESUME */}
              <div>
                <h3 className="mb-2 text-gray-300">Tailored Resume</h3>
                <textarea
                  defaultValue={aiData.resume}
                  className="w-full h-40 bg-black/70 p-3 rounded-xl border border-white/10"
                />
              </div>

              {/* COVER LETTER */}
              <div>
                <h3 className="mb-2 text-gray-300">Cover Letter</h3>
                <textarea
                  defaultValue={aiData.coverLetter}
                  className="w-full h-40 bg-black/70 p-3 rounded-xl border border-white/10"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-green-500 rounded-xl font-semibold"
                >
                  Submit Application
                </button>

                <button
                  onClick={handleGenerate}
                  className="flex-1 py-3 bg-white/10 rounded-xl"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}

          {applied && (
            <div className="text-center text-green-400 text-xl mt-20">
              ✅ Application Submitted
            </div>
          )}

        </div>
      </main>
    </div>
  );
}