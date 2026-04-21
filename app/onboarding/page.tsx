"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = [
  "Software Developer","Frontend Developer","Backend Developer",
  "Full Stack Developer","Data Scientist","AI/ML Engineer",
  "UI/UX Designer","DevOps Engineer","Cybersecurity Analyst",
  "Product Manager"
];

const ALL_SKILLS = [
  "JavaScript","TypeScript","Python","Java","C++","React","Next.js",
  "Node.js","Express","MongoDB","MySQL","PostgreSQL","Firebase",
  "AWS","Docker","Kubernetes","Git","GitHub","REST APIs","GraphQL",
  "Tailwind CSS","Redux","Figma","Adobe XD","UI Design","UX Research",
  "Machine Learning","Deep Learning","NLP","TensorFlow","PyTorch",
  "Data Analysis","Pandas","NumPy","Matplotlib","Seaborn",
  "Linux","Bash","CI/CD","Jenkins","Agile","Scrum",
  "Cybersecurity","Pen Testing","Networking","Cloud Computing",
  "HTML","CSS","Bootstrap","SASS","Three.js","WebSockets",
  "Microservices","System Design","OOP","DSA",
  "Testing","Jest","Cypress","Playwright",
  "Android","iOS","React Native","Flutter",
  "Blockchain","Solidity","Web3",
  "Communication","Problem Solving","Leadership"
];

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [customSkill, setCustomSkill] = useState("");

  const [formData, setFormData] = useState({
    role: "",
    mode: "",
    skills: [] as string[],
    education: "",
    experience: "",
    resumeText: ""
  });

  // 🔐 Redirect if already onboarded
  useEffect(() => {
    if ((session?.user as any)?.isOnboarded) {
      router.push("/internships");
    }
  }, [session, router]);

  // 🎯 Toggle Skill
  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  // ➕ Add custom skill
  const addCustomSkill = () => {
    if (!customSkill.trim()) return;

    if (!formData.skills.includes(customSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, customSkill],
      });
    }

    setCustomSkill("");
  };

  // 👉 NEXT
  const handleNext = () => {
    setError("");

    if (step === 1 && !formData.role) return setError("Select role");
    if (step === 2 && !formData.mode) return setError("Select work mode");
    if (step === 3 && formData.skills.length === 0) return setError("Select skills");
    if (step === 4 && !formData.education) return setError("Add education");
    if (step === 5 && !formData.experience) return setError("Add experience");

    setStep(step + 1);
  };

  // 👉 SUBMIT
  const handleSubmit = async () => {
    if (!formData.resumeText.trim()) {
      return setError("Paste your resume");
    }

    setLoading(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: formData.role,
        mode: formData.mode,
        skills: formData.skills,
        education: formData.education,
        experience: formData.experience,
        resumeText: formData.resumeText
      }),
    });

    if (res.ok) {
      await update({ isOnboarded: true });
      router.push("/internships");
    } else {
      setError("Failed to save");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#180a2b] to-[#3a0852] text-white p-6">

      <div className="w-full max-w-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Complete Your Profile
        </h1>

        {error && (
          <p className="text-red-400 text-center mb-4">{error}</p>
        )}

        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="1">
              <h2>Select Role</h2>
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`w-full p-3 mt-2 rounded-xl ${
                    formData.role === r ? "bg-purple-500" : "bg-white/10"
                  }`}
                >
                  {r}
                </button>
              ))}
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="2">
              <h2>Work Mode</h2>
              {["Remote", "Hybrid", "Onsite"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFormData({ ...formData, mode: r })}
                  className={`w-full p-3 mt-2 rounded-xl ${
                    formData.mode === r ? "bg-purple-500" : "bg-white/10"
                  }`}
                >
                  {r}
                </button>
              ))}
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="3">
              <input
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 mb-3 bg-black/40 rounded"
              />

              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {ALL_SKILLS.filter((s) =>
                  s.toLowerCase().includes(search.toLowerCase())
                ).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.skills.includes(skill)
                        ? "bg-purple-500"
                        : "bg-white/10"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  placeholder="Custom skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="flex-1 p-2 bg-black/40 rounded"
                />
                <button onClick={addCustomSkill} className="bg-purple-500 px-3">
                  Add
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <motion.div key="4">
              <h2>Education</h2>
              <textarea
                rows={4}
                placeholder="Enter your education details"
                className="w-full p-3 bg-black/40 rounded"
                onChange={(e) =>
                  setFormData({ ...formData, education: e.target.value })
                }
              />
            </motion.div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <motion.div key="5">
              <h2>Experience</h2>
              <textarea
                rows={4}
                placeholder="Enter your experience"
                className="w-full p-3 bg-black/40 rounded"
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
              />
            </motion.div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <motion.div key="6">
              <h2>Paste Resume</h2>
              <textarea
                rows={6}
                placeholder="Paste your resume here..."
                className="w-full p-3 bg-black/40 rounded"
                onChange={(e) =>
                  setFormData({ ...formData, resumeText: e.target.value })
                }
              />
            </motion.div>
          )}

        </AnimatePresence>

        {/* BUTTONS */}
        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-white/10 rounded"
            >
              Back
            </button>
          )}

          {step < 6 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-purple-600 rounded"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-pink-600 rounded"
            >
              {loading ? "Saving..." : "Finish"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}