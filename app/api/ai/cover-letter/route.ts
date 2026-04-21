import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, role, company } = await req.json();

    if (!name) {
      return NextResponse.json({ letter: "Invalid input" });
    }

    const letter = `
Dear ${company || "Hiring Manager"},

I am excited to apply for the ${role || "Software Intern"} position at ${company || "your company"}.

I am passionate about software development and have hands-on experience working with modern technologies. I enjoy solving real-world problems and continuously improving my skills.

I believe my dedication, technical knowledge, and eagerness to learn make me a strong candidate for this role.

I would love the opportunity to contribute to your team and grow as a developer.

Thank you for your time and consideration.

Sincerely,  
${name}
    `;

    return NextResponse.json({
      letter: letter.trim(),
    });

  } catch (error) {
    return NextResponse.json(
      { letter: "Error generating cover letter" },
      { status: 500 }
    );
  }
}