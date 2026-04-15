"use client";

import { useState } from "react";

export default function SkillGapPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) {
      alert("Enter skills first");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: input.split(",").map((s) => s.trim()),
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing skills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-xl bg-white/5 p-8 rounded-2xl">

        <h1 className="text-2xl font-bold mb-4">Skill Gap Analyzer</h1>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter skills (e.g. React, Java)"
          className="w-full p-3 rounded-xl bg-black/40 mb-4"
        />

        <button
          onClick={handleAnalyze}
          className="w-full py-3 bg-purple-600 rounded-xl"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {/* RESULT */}
        {result && result.success && (
          <div className="mt-6">

            <p className="mb-2">
              🎯 Match: <b>{result.matchPercentage}%</b>
            </p>

            <p className="mb-2">❌ Missing Skills:</p>
            <ul className="list-disc ml-5 text-red-400">
              {result.missingSkills.map((skill: string) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>

          </div>
        )}

      </div>
    </div>
  );
}