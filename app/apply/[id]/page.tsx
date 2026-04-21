"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Download,
  Sparkles,
  Send,
  MapPin,
  DollarSign,
  Edit3,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";

// ✅ FIXED TYPE (ALL fields added properly)
type Internship = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  stipend?: string;
  salary?: string; // optional
  description?: string; // 🔥 FIXED
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
  const [aiData, setAiData] = useState<{
    resume: string;
    coverLetter: string;
    missingFields?: string[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [errorToast, setErrorToast] = useState("");

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(""), 4000);
  };

  // ✅ LOAD JOB
  useEffect(() => {
    const storedJob = localStorage.getItem("selectedJob");
    if (storedJob) {
      setJob(JSON.parse(storedJob));
    } else {
      router.push("/internships");
    }
  }, [router]);

  // 🚀 AI APPLY
  const handleApplyWithAI = async () => {
    if (!job) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai/generate-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          requiredSkills: job.skillsRequired || [],
          description: job.description || "", // ✅ SAFE
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiData(data);
      } else {
        showError("AI generation failed");
      }
    } catch (err) {
      console.error(err);
      showError("Server error");
    } finally {
      setLoading(false);
    }
  };

  // 📄 DOWNLOAD PDF
  const handleDownloadPDF = async () => {
    try {
      const res = await fetch("/api/user/resume-pdf");

      if (!res.ok) {
        const err = await res.json();
        showError(err.message || "PDF failed");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      showError("PDF error");
    }
  };

  // ✅ SUBMIT
  const handleFinalSubmit = async () => {
    setApplied(true);

    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-20">

        {/* ERROR */}
        {errorToast && (
          <div className="bg-red-500 p-3 rounded mb-4">
            {errorToast}
          </div>
        )}

        {/* JOB INFO */}
        <div className="bg-white/5 p-6 rounded mb-6">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p>{job.company}</p>

          <p className="text-sm mt-2 flex gap-3">
            <span className="flex gap-1">
              <MapPin size={14} /> {job.location || "N/A"}
            </span>
            <span className="flex gap-1">
              <DollarSign size={14} />{" "}
              {job.salary || job.stipend || "N/A"}
            </span>
          </p>

          <p className="mt-4 text-gray-300">
            {job.description || "No description"}
          </p>
        </div>

        {/* AI BUTTON */}
        {!aiData && (
          <button
            onClick={handleApplyWithAI}
            className="bg-purple-600 px-6 py-3 rounded"
          >
            {loading ? "Generating..." : "Generate with AI"}
          </button>
        )}

        {/* AI RESULT */}
        {aiData && !applied && (
          <div className="mt-6 space-y-6">

            {/* RESUME */}
            <div className="bg-white/5 p-4 rounded">
              <h3 className="mb-2">Resume</h3>
              <textarea
                defaultValue={aiData.resume}
                className="w-full h-40 bg-black p-3"
              />
            </div>

            {/* COVER LETTER */}
            <div className="bg-white/5 p-4 rounded">
              <h3 className="mb-2">Cover Letter</h3>
              <textarea
                defaultValue={aiData.coverLetter}
                className="w-full h-40 bg-black p-3"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-500 px-4 py-2 rounded"
              >
                Download PDF
              </button>

              <button
                onClick={handleFinalSubmit}
                className="bg-green-500 px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {applied && (
          <div className="text-green-400 mt-10 text-center text-xl">
            Application Submitted ✅
          </div>
        )}
      </main>
    </div>
  );
}