import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, role, skills } = await req.json();

    const resume = `
${name}
Role: ${role}

SKILLS:
${skills.join(", ")}

PROJECTS:
- Built projects using above skills

EXPERIENCE:
- Fresher / Student

EDUCATION:
- B.Tech / Degree (Not Provided)
`;

    return NextResponse.json({ resume });
  } catch (err) {
    return NextResponse.json(
      { resume: "Resume generation failed" },
      { status: 500 }
    );
  }
}