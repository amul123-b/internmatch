import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface Internship {
  _id?: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  skillsRequired: string[];
  description: string;
  createdAt?: Date;
}

function extractSkills(description: string) {
  const skills = [
    "React", "JavaScript", "TypeScript", "Node.js",
    "Python", "MongoDB", "SQL", "AWS",
    "Docker", "Figma", "Java", "C++",
    "HTML", "CSS", "Next.js", "Express",
    "Git", "REST API", "GraphQL", "Linux"
  ];

  const found = skills.filter(skill =>
    description.toLowerCase().includes(skill.toLowerCase())
  );

  // 🔥 FALLBACK (IMPORTANT)
  if (found.length === 0) {
    return ["Communication", "Problem Solving"]; // never empty
  }

  return found;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔥 FETCH REAL INTERNSHIPS FROM ADZUNA
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&what=software intern&results_per_page=12`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch from Adzuna");
    }

    const data = await res.json();

    const jobs: Internship[] = (data.results || []).map((job: any) => ({
      _id: job.id?.toString(),
      title: job.title,
      company: job.company?.display_name || "Unknown",
      location: job.location?.display_name || "Remote",
      salary: job.salary_min
        ? `₹${Math.round(job.salary_min / 12)} / month`
        : "Not disclosed",
      skillsRequired: extractSkills(job.description || ""),
      description: job.description || "No description available",
      createdAt: new Date(),
    }));

    return NextResponse.json({ jobs }, { status: 200 });

  } catch (error) {
    console.error("Internships API Error:", error);

    return NextResponse.json(
      { message: "Failed to fetch real internships" },
      { status: 500 }
    );
  }
}