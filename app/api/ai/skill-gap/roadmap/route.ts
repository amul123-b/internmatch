import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skills } = await req.json();

    const roadmap = skills.map((skill: string, i: number) => ({
      step: i + 1,
      title: `Learn ${skill}`,
      description: `Build projects and practice ${skill}`,
    }));

    return NextResponse.json({ roadmap });

  } catch {
    return NextResponse.json(
      { message: "Roadmap error" },
      { status: 500 }
    );
  }
}