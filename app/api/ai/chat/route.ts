import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing API Key");
    }

    const { message } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(message);
    const text = result.response.text().trim();

    return NextResponse.json({ reply: text || "No response" });

  } catch (error) {
    console.error("CHAT ERROR:", error);

    return NextResponse.json({
      reply: "AI is temporarily unavailable. Try again.",
    });
  }
}