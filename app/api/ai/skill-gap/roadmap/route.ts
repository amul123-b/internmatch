import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { skill } = await req.json();

    if (!skill) {
      return NextResponse.json(
        { message: "Skill is required" },
        { status: 400 }
      );
    }

    const prompt = `
Create a detailed learning roadmap for ${skill}.

Rules:
- Minimum 12 steps
- Beginner → Intermediate → Advanced
- Each step should be 1 clear line
- Include projects + real-world practice
- No numbering explanation text, only steps

Output format:
Step 1: ...
Step 2: ...
Step 3: ...
`;

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const result = await model.generateContent(prompt);
      let text = result.response.text();

      // cleanup
      text = text.replace(/```/g, "").trim();

      return NextResponse.json({
        roadmap: text,
      });

    } catch (aiError) {
      console.error("Gemini failed → fallback");

      // 🔥 FALLBACK (IMPORTANT)
      return NextResponse.json({
        roadmap: `
Step 1: Learn fundamentals of ${skill}
Step 2: Understand core concepts
Step 3: Set up environment
Step 4: Build small projects
Step 5: Practice exercises
Step 6: Learn best practices
Step 7: Build intermediate projects
Step 8: Explore real-world use cases
Step 9: Debug and optimize
Step 10: Learn advanced topics
Step 11: Build major project
Step 12: Create portfolio
        `.trim(),
      });
    }

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Roadmap generation failed" },
      { status: 500 }
    );
  }
}