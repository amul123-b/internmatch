"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

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

  useEffect(() => {
    const storedJob = localStorage.getItem("selectedJob");
    if (storedJob) {
      setJob(JSON.parse(storedJob));
    } else {
      router.push("/internships");
    }
  }, [router]);

  const handleApplyWithAI = async () => {
    if (!job) return;

    setLoading(true);

    const res = await fetch("/api/ai/generate-application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobTitle: job.title,
        company: job.company,
        requiredSkills: job.skillsRequired || [],
        description: job.description || "",
      }),
    });

    const data = await res.json();
    setAiData(data);
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    const res = await fetch("/api/user/resume-pdf");

    if (!res.ok) {
      alert("PDF failed");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Resume.pdf";
    a.click();
  };

  const handleFinalSubmit = async () => {
    if (!job) return;

    await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
      }),
    });

    setApplied(true);

    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  if (!job) return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-20">

        <h1 className="text-2xl font-bold">{job.title}</h1>
        <p>{job.company}</p>

        {!aiData && (
          <button
            onClick={handleApplyWithAI}
            className="bg-purple-600 px-6 py-3 mt-4"
          >
            {loading ? "Generating..." : "Generate with AI"}
          </button>
        )}

        {aiData && !applied && (
          <div className="mt-6">

            <textarea
              defaultValue={aiData.resume}
              className="w-full h-40 bg-black p-3"
            />

            <textarea
              defaultValue={aiData.coverLetter}
              className="w-full h-40 bg-black p-3 mt-4"
            />

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-500 px-4 py-2"
              >
                Download PDF
              </button>

              <button
                onClick={handleFinalSubmit}
                className="bg-green-500 px-4 py-2"
              >
                Submit
              </button>
            </div>

          </div>
        )}

        {applied && (
          <p className="text-green-400 mt-6">
            Application Submitted ✅
          </p>
        )}

      </main>
    </div>
  );
}