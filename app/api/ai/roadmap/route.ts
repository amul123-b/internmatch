import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { skill } = await req.json();

    if (!skill) {
      return NextResponse.json({ roadmap: "No skill provided" });
    }

    const roadmapMap: Record<string, string> = {
      react: `
Learn JSX and Components
Understand Hooks (useState, useEffect)
Build small projects (Todo App, Weather App)
Learn state management (Context / Redux)
Build full-stack apps with Next.js
      `,

      node: `
Learn Node.js basics
Understand Express.js
Build REST APIs
Connect with MongoDB
Add authentication (JWT)
Deploy backend
      `,

      mongodb: `
Understand NoSQL concepts
Learn CRUD operations
Use MongoDB Atlas
Integrate with Node.js
Optimize queries & indexing
      `,

      aws: `
Learn cloud basics
Understand EC2, S3
Deploy simple apps
Learn IAM & security
Explore serverless (Lambda)
      `,
    };

    const key = skill.toLowerCase();

    const roadmap =
      roadmapMap[key] ||
      `
Learn basics of ${skill}
Practice with small projects
Build real-world applications
Explore advanced concepts
Keep improving with practice
`;

    return NextResponse.json({
      roadmap: roadmap.trim(),
    });

  } catch (error) {
    return NextResponse.json(
      { roadmap: "Error generating roadmap" },
      { status: 500 }
    );
  }
}