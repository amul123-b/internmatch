import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userSkills, requiredSkills } = await req.json();

    const missingSkills = (requiredSkills || []).filter(
      (skill: string) =>
        !(userSkills || []).map((s: string) => s.toLowerCase()).includes(skill.toLowerCase())
    );

    const match =
      requiredSkills.length === 0
        ? 0
        : Math.round(
            ((requiredSkills.length - missingSkills.length) /
              requiredSkills.length) *
              100
          );

    return NextResponse.json({
      missingSkills,
      match,
    });
  } catch {
    return NextResponse.json({ missingSkills: [], match: 0 });
  }
}