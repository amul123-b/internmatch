import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, role, company } = await req.json();

    const letter = `
Dear ${company},

I am writing to apply for the ${role} position.

I have strong skills and passion for software development.
I am eager to contribute and learn in your company.

Thank you for your time and consideration.

Sincerely,
${name}
`;

    return NextResponse.json({ letter });
  } catch (err) {
    return NextResponse.json(
      { letter: "Cover letter generation failed" },
      { status: 500 }
    );
  }
}