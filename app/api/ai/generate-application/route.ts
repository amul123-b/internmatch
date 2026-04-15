import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing API Key");
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { jobTitle, company, description } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const safeUser = {
      name: user.name || "Candidate",
      role: user.role || "Candidate",
      skills: user.skills || [],
      experience: user.experience || "",
      education: user.education || "",
    };

    const prompt = `
Return ONLY valid JSON.

Job: ${jobTitle} at ${company}
Description: ${description}

User:
Name: ${safeUser.name}
Role: ${safeUser.role}
Skills: ${safeUser.skills.join(", ")}
Experience: ${safeUser.experience}
Education: ${safeUser.education}

Rules:
- No hallucination
- If missing → "[MISSING: field]"
- Strict JSON only

{
 "resume": "",
 "coverLetter": "",
 "missingFields": []
}
`;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 8000)
        ),
      ]) as any;

      let text = result.response.text().trim();

      text = text.replace(/```json/g, "").replace(/```/g, "");

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("JSON parse failed");
      }

      return NextResponse.json({
        resume: parsed.resume || "",
        coverLetter: parsed.coverLetter || "",
        missingFields: parsed.missingFields || [],
      });

    } catch (aiError) {
      console.error("AI FAILED:", aiError);

      return NextResponse.json({
        resume: `${safeUser.name}
${session.user.email}

SKILLS
${safeUser.skills.join(", ") || "[MISSING]"}

EXPERIENCE
${safeUser.experience || "[MISSING: Experience]"}

EDUCATION
${safeUser.education || "[MISSING: Education]"}
`,
        coverLetter: `Dear ${company},

I am applying for ${jobTitle}. I have skills in ${safeUser.skills.join(", ") || "[MISSING]"}.

[MISSING DETAILS — EDIT BEFORE SUBMIT]

Thanks,
${safeUser.name}`,
        missingFields: [
          ...(safeUser.experience ? [] : ["Experience"]),
          ...(safeUser.education ? [] : ["Education"]),
        ],
      });
    }

  } catch (error) {
    console.error("FINAL ERROR:", error);

    return NextResponse.json(
      { message: "AI generation failed" },
      { status: 500 }
    );
  }
}