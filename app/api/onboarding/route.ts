import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ NOW USING JSON (not formData)
    const body = await req.json();

    const role = body.role || "";
    const jobType = body.jobType || "";
    const mode = body.mode || "";

    // skills comes as array now
    const skills = Array.isArray(body.skills) ? body.skills : [];

    const experience = body.experience || "";
    const education = body.education || "";
    const resumeText = body.resumeText || "";

    const client = await clientPromise;
    const db = client.db();

    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          role,
          jobType,
          mode,

          // ✅ directly store array
          skills,

          // ✅ new fields
          experience,
          education,
          resumeText,

          isOnboarded: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("ONBOARDING ERROR:", err);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}