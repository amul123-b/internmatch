import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { jobTitle } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    const userSkills = user?.skills || [];

    // 🔥 Simulated job skills (later dynamic)
    const jobSkills = ["React", "Node.js", "MongoDB", "AWS"];

    const missingSkills = jobSkills.filter(
      (skill) => !userSkills.includes(skill)
    );

    const matchPercentage = Math.round(
      ((jobSkills.length - missingSkills.length) / jobSkills.length) * 100
    );

    return NextResponse.json({
      success: true,
      jobSkills,
      missingSkills,
      matchPercentage,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Skill gap error" },
      { status: 500 }
    );
  }
}