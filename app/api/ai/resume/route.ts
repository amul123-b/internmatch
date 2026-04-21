import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, role, skills } = await req.json();

    if (!name) {
      return NextResponse.json({ resume: "Invalid input" });
    }

    const skillsText = (skills || []).join(", ");

    const resume = `
${name}
${role || "Software Developer"}

----------------------------
SKILLS
${skillsText || "Not specified"}

----------------------------
PROJECTS
- Built real-world applications using modern technologies
- Developed scalable and efficient solutions
- Worked on frontend and backend systems

----------------------------
EXPERIENCE
- Hands-on coding experience with multiple technologies
- Strong problem-solving and debugging skills

----------------------------
EDUCATION
Bachelor's Degree in Computer Science (or related field)

----------------------------
SUMMARY
Passionate developer with strong interest in building scalable applications and learning new technologies.
    `;

    return NextResponse.json({
      resume: resume.trim(),
    });

  } catch (error) {
    return NextResponse.json(
      { resume: "Error generating resume" },
      { status: 500 }
    );
  }
}