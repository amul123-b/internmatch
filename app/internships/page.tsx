"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useSession } from "next-auth/react";

export default function InternshipsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");

  // 🔒 PROTECT PAGE
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      alert("Login first to view internships 🚀");
      router.push("/login");
    }
  }, [session, status]);

  // 🔥 FETCH DATA
  useEffect(() => {
    if (!session) return;

    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/internships");
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        const userRes = await fetch("/api/user/profile");
        const userData = await userRes.json();

        const userSkills =
          userData?.user?.skills?.map((s: string) =>
            s.toLowerCase().trim()
          ) || [];

        const jobsWithMatch = (data.jobs || []).map((job: any) => {
          const required =
            job.skillsRequired?.map((s: string) =>
              s.toLowerCase().trim()
            ) || [];

          if (required.length === 0) {
            return { ...job, matchPercentage: 100 };
          }

          const matched = required.filter((skill: string) =>
            userSkills.includes(skill)
          );

          const percentage = Math.round(
            (matched.length / required.length) * 100
          );

          return {
            ...job,
            matchPercentage: percentage || 0,
          };
        });

        setJobs(jobsWithMatch);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load internships");
        setLoading(false);
      }
    };

    fetchJobs();
  }, [session]);

  // 🔥 SKILL FILTER LIST
  const allSkills = Array.from(
    new Set(jobs.flatMap((j) => j.skillsRequired || []))
  );

  // 🔥 FILTER LOGIC
  const filteredJobs = React.useMemo(() => {
    return jobs.filter((job) => {
      const searchMatch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());

      const roleMatch =
        roleFilter === "All" ||
        job.title.toLowerCase().includes(roleFilter.toLowerCase());

      const skillMatch =
        skillFilter === "All" ||
        job.skillsRequired?.includes(skillFilter);

      return searchMatch && roleMatch && skillMatch;
    });
  }, [jobs, search, roleFilter, skillFilter]);

  // 🔄 LOADING UI
  if (status === "loading" || loading) {
    return (
<div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-pink-950 text-white">        Loading internships...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gradient-to-br dark:from-black dark:via-purple-950 dark:to-pink-950 dark:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12 pt-28">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6 bg-gray-100 dark:bg-white/5 p-6 rounded-3xl border border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-2xl">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">
              Discover Internships
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Matched to your skills using AI
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 focus:border-purple-500 outline-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3"
            >
              <option value="All">All Roles</option>
              <option value="Developer">Developer</option>
              <option value="Design">Design</option>
              <option value="Data">Data</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3"
            >
              <option value="All">All Skills</option>
              {allSkills.map((sk: string) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <motion.div
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {filteredJobs.map((job) => (
            <motion.div
              key={job._id}
              className="bg-gray-100 dark:bg-white/5 p-6 rounded-3xl border border-gray-200 dark:border-white/10 relative"
            >
              {/* MATCH BADGE */}
              <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-2 rounded-bl-2xl">
                {job.matchPercentage}% Match
              </div>

              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {job.company}
              </p>

              <button
                onClick={() => {
                  localStorage.setItem("selectedJob", JSON.stringify(job));
                  router.push(`/apply/${job._id}`);
                }}
                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:scale-105 transition"
              >
                Apply 🚀
              </button>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}