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

    const formData = await req.formData();

    // ✅ EXISTING FIELDS (no UI change)
    const role = formData.get("role")?.toString() || "";
    const jobType = formData.get("jobType")?.toString() || "";
    const mode = formData.get("mode")?.toString() || "";
    const skills = formData.get("skills")?.toString() || "";

    // ✅ NEW OPTIONAL FIELDS (safe if not present in UI)
    const experience = formData.get("experience")?.toString() || "";
    const education = formData.get("education")?.toString() || "";
    

    const client = await clientPromise;
    const db = client.db();

    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          role,
          jobType,
          mode,

          // ✅ clean skills array
          skills: skills
            ? skills.split(",").map((s) => s.trim()).filter(Boolean)
            : [],

          // ✅ NEW fields (used by AI later)
          experience,
          education,

          // ✅ onboarding flag
          isOnboarded: true,

          updatedAt: new Date(),
        },
      },
      { upsert: true } // 🔥 ensures user always exists
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