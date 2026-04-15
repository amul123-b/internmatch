import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { jobTitle, company } = await req.json();

  return NextResponse.json({
    resume: `Resume tailored for ${jobTitle} at ${company}`,
    coverLetter: `Dear ${company}, I am excited to apply for ${jobTitle}...`,
  });
}