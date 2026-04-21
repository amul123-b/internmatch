import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skills } = await req.json();

    if (!skills || skills.length === 0) {
      return NextResponse.json({ roadmap: [] });
    }

    const roadmap = skills.map((skill: string, i: number) => ({
      step: i + 1,
      title: `Learn ${skill}`,
      description: `Practice ${skill} with projects and real-world tasks`,
    }));

    return NextResponse.json({ roadmap });

  } catch {
    return NextResponse.json(
      { message: "Roadmap error" },
      { status: 500 }
    );
  }
}