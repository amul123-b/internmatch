"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Download, Sparkles, Send, MapPin, DollarSign, Edit3, AlertTriangle } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { Internship } from "@/app/api/internships/route";

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [job, setJob] = useState<Internship | null>(null);
  const [aiData, setAiData] = useState<{ resume: string; coverLetter: string; missingFields?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const resolvedParams = use(params);

  const [errorToast, setErrorToast] = useState("");

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(""), 4500);
  };

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

    fetch("/api/analytics", { method: "POST", body: JSON.stringify({ event: "apply_clicked" }) }).catch(() => {});

    try {
      const res = await fetch("/api/ai/generate-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          requiredSkills: job.skillsRequired,
          description: job.description
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiData(data);
      } else {
        showError("Failed to generate AI application. Please check API keys or connections.");
      }
    } catch (e) {
        console.error(e);
        showError("Server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch("/api/user/resume-pdf");
      if (!res.ok) {
        const err = await res.json();
        showError(err.message || "Failed to download PDF. Please update missing profile fields.");
         return;
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Resume_Verified.pdf"; 
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      showError("Error generating PDF.");
    }
  };

  const handleFinalSubmit = async () => {
    setApplied(true);
    fetch("/api/analytics", { method: "POST", body: JSON.stringify({ event: "apply_submitted" }) }).catch(() => {});
    setTimeout(() => {
      router.push("/dashboard");
    }, 2500);
  };

  if (!job) return <div className="min-h-screen bg-[#0b0416] text-white flex items-center justify-center animate-pulse">Loading Application...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-pink-950 text-white relative">
      <Navbar />

      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-40 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-4xl mx-auto px-6 py-12 pt-28 relative z-10">
        
        {/* TOAST ERROR */}
        <AnimatePresence>
          {errorToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] max-w-md w-full bg-red-900/90 border-2 border-red-500 text-white px-6 py-4 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.5)] flex items-center gap-3 backdrop-blur-xl"
            >
              <AlertTriangle className="w-6 h-6 text-red-200" />
              <p className="font-semibold">{errorToast}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* JOB INFO COMPONENT */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 border-b border-l border-white/10 rounded-bl-3xl bg-white/5">
             <Briefcase className="text-purple-400 w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold mb-1">Applying for {job.title}</h1>
          <h2 className="text-xl font-semibold text-purple-300 mb-4">{job.company}</h2>
          
          <div className="flex gap-4 mb-6">
             <span className="flex items-center gap-2 text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"><MapPin className="w-4 h-4 text-pink-400"/> {job.location}</span>
             <span className="flex items-center gap-2 text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"><DollarSign className="w-4 h-4 text-green-400"/> {job.salary}</span>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed max-w-3xl border-t border-white/10 pt-4">
            {job.description}
          </p>
        </div>

        {/* CTA GENERATION */}
        {!aiData && !loading && !applied && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-purple-500/50 backdrop-blur-md">
            <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">AI Application Generator</h3>
            <p className="mb-8 text-gray-300 max-w-lg mx-auto">We'll strategically integrate your skills into a custom cover letter and format your resume for {job.company}. (If details are missing, we'll prompt you to fill them in manually — no hallucinations!).</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApplyWithAI}
              className="px-10 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] transition-shadow text-white flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" /> Generate Profile with AI
            </motion.button>
          </motion.div>
        )}

        {/* LOADING ANIMATION */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 flex flex-col items-center bg-black/40 rounded-3xl border border-white/5 backdrop-blur-lg shadow-2xl">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">AI is crafting your application</h3>
            <p className="text-gray-400 animate-pulse max-w-md mx-auto">Analyzing strictly factual data and ensuring 100% accuracy...</p>
          </motion.div>
        )}

        {/* AI GENERATED RESULT */}
        {aiData && !applied && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h2 className="text-3xl font-extrabold flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-pink-400" /> Review Your Materials
            </h2>

            {/* MISSING FIELDS WARNING */}
            {aiData.missingFields && aiData.missingFields.length > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-yellow-900/30 border border-yellow-500/50 p-6 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <h3 className="text-yellow-400 font-bold text-lg flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5"/> Action Required: Missing Details
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  To ensure 100% accuracy, our AI refused to invent or guess missing information. Some details are missing from your resume and must be completed manually below.
                </p>
                <div className="flex flex-wrap gap-2">
                   {aiData.missingFields.map((field, i) => (
                      <span key={i} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs rounded-full font-bold uppercase tracking-wider">{field}</span>
                   ))}
                </div>
              </motion.div>
            )}
            
            {/* Resume Editor */}
            <div className={`bg-black/40 border p-6 rounded-3xl shadow-xl relative group transition-colors duration-300 ${aiData.missingFields?.includes("Experience") || aiData.missingFields?.includes("Education") ? "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "border-white/10"}`}>
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-pink-400"><Edit3 className="w-5 h-5"/> Tailored Resume</h3>
              </div>
              <textarea 
                className="w-full h-56 bg-black/20 border border-white/5 rounded-2xl p-5 text-sm text-gray-200 resize-y outline-none focus:border-purple-500 font-mono leading-relaxed transition"
                defaultValue={aiData.resume}
                aria-label="Tailored Resume Editor"
              />
            </div>

            {/* Cover Letter Editor */}
            <div className={`bg-black/40 border p-6 rounded-3xl shadow-xl relative group transition-colors duration-300 ${(aiData.missingFields?.length ?? 0) > 0 ? "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "border-white/10"}`}>
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-cyan-400"><Edit3 className="w-5 h-5"/> Custom Cover Letter</h3>
              </div>
              <textarea 
                className="w-full h-64 bg-black/20 border border-white/5 rounded-2xl p-5 text-sm text-gray-200 resize-y outline-none focus:border-cyan-500 font-mono leading-relaxed transition"
                defaultValue={aiData.coverLetter}
                aria-label="Custom Cover Letter Editor"
              />
            </div>

            {/* ACTION BAR */}
            <div className="sticky bottom-8 bg-black/80 p-4 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-between items-center shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50">
              <button onClick={() => setAiData(null)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10 text-sm font-medium text-gray-300">
                Discard & Regenerate
              </button>
              <div className="flex gap-4 items-center flex-wrap justify-end">
                
                {aiData.missingFields && aiData.missingFields.length > 0 && (
                   <span className="text-yellow-400 text-sm hidden md:block font-medium animate-pulse">
                      Please replace [MISSING: ...] markers before submitting.
                   </span>
                )}

                <button 
                  onClick={handleDownloadPDF} 
                  className="px-5 py-3 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/40 transition flex items-center gap-2 font-semibold"
                >
                  <Download className="w-4 h-4"/> Download ATS PDF
                </button>
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={aiData.missingFields && aiData.missingFields.length > 0}
                  aria-disabled={aiData.missingFields && aiData.missingFields.length > 0}
                  className={`px-8 py-3 font-extrabold rounded-xl transition flex items-center gap-2 text-white ${aiData.missingFields && aiData.missingFields.length > 0 ? "bg-gray-700 cursor-not-allowed opacity-50" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.03] shadow-[0_0_20px_rgba(16,185,129,0.4)]"}`}
                >
                  Submit Now <Send className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUCCESS STATE */}
        {applied && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-32 bg-white/5 rounded-3xl border border-green-500/30 backdrop-blur-lg shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
            <div className="inline-flex items-center justify-center w-28 h-28 bg-green-500/20 text-green-400 rounded-full mb-6 border-4 border-green-500/30 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-14 h-14"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300 mb-4 tracking-tight">Application Submitted!</h2>
            <p className="text-gray-400 text-lg">Your hyper-accurate profile is on its way to {job.company}.</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
          </motion.div>
        )}

      </main>
    </div>
  );
}
