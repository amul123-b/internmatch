import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { skill } = await req.json();

    if (!skill) {
      return NextResponse.json(
        { message: "Skill is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-pro",
      });

      const result = await model.generateContent(
        `Create a step-by-step roadmap to learn ${skill} from beginner to advanced in 10 clear steps. Return each step on a new line.`
      );

      const text = result.response.text().trim();

      return NextResponse.json({ roadmap: text });

    } catch (err) {
      console.error("AI FAILED → using fallback");

      return NextResponse.json({
        roadmap: `1. Learn basics of ${skill}
2. Practice fundamentals
3. Build small projects
4. Learn intermediate concepts
5. Work on real-world projects
6. Learn advanced topics
7. Optimize and improve code
8. Build portfolio projects
9. Prepare for interviews
10. Apply for jobs`,
      });
    }

  } catch (error) {
    console.error("ROADMAP ERROR:", error);

    return NextResponse.json(
      { message: "Error generating roadmap" },
      { status: 500 }
    );
  }
}