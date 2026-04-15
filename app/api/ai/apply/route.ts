import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { job, user } = await req.json();

    const prompt = `
You are a professional career assistant.

Generate:
1. A professional ATS-friendly resume
2. A tailored cover letter

Based on:

Candidate:
Name: ${user.name}
Skills: ${user.skills}
Education: ${user.education}

Job:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}

Make it clean, professional, and impressive.

IMPORTANT:
Return ONLY JSON like:
{
  "resume": "...",
  "coverLetter": "..."
}
`;

    // ✅ GEMINI INIT
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
    });

    // ✅ CALL GEMINI
    const result = await model.generateContent(prompt);
    const geminiResponse = await result.response;

    let text = geminiResponse.text();

    // 🧹 CLEAN RESPONSE
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // ✅ PARSE JSON SAFELY
    try {
      const parsed = JSON.parse(text);

      return NextResponse.json({
        resume: parsed.resume,
        coverLetter: parsed.coverLetter,
      });
    } catch (parseError) {
      console.error("Parse error:", parseError);

      return NextResponse.json({
        resume: text,
        coverLetter: "Could not parse properly",
      });
    }

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}