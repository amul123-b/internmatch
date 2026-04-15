import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ FIX: Read FormData instead of JSON
    const formData = await req.formData();

    const role = formData.get("role");
    const jobType = formData.get("jobType");
    const mode = formData.get("mode");
    const skills = formData.get("skills");
    const resumeFile = formData.get("resume") as File | null;

    let resumeText = "";

    // (optional simple handling)
    if (resumeFile) {
      resumeText = await resumeFile.text(); // basic extraction
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          role,
          jobType,
          mode,
          skills: typeof skills === "string" ? skills.split(",") : [],
          resume: resumeText,
          isOnboarded: true,
        },
      }
    );

    return NextResponse.json({ message: "Profile saved" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}