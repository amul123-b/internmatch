import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ jobs: [] });
    }

    const client = await clientPromise;
    const db = client.db();

    // 🔥 GET USER
    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    const userSkills = (user?.skills || []).map((s: string) =>
      s.toLowerCase()
    );

    // 🔥 GET ALL JOBS
    const jobs = await db.collection("internships").find({}).toArray();

    // 🧠 MATCHING LOGIC
    const scoredJobs = jobs.map((job: any) => {
      const required = (job.skillsRequired || []).map((s: string) =>
        s.toLowerCase()
      );

      const matched = required.filter((skill: string) =>
        userSkills.includes(skill)
      );

      const matchPercent =
        required.length === 0
          ? 0
          : Math.round((matched.length / required.length) * 100);

      return {
        ...job,
        matchPercent,
      };
    });

    // 🔥 SORT BY MATCH %
    scoredJobs.sort((a: any, b: any) => b.matchPercent - a.matchPercent);

    // 🔥 OPTIONAL FILTER (only relevant jobs)
    const filtered = scoredJobs.filter((job: any) => job.matchPercent > 0);

   return NextResponse.json({
  jobs: scoredJobs,
});

  } catch (err) {
    console.error(err);
    return NextResponse.json({ jobs: [] });
  }
}