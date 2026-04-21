import { NextResponse } from "next/server";

export async function GET() {
  try {
    const text = "Sample Resume PDF";

    const blob = new Blob([text], { type: "application/pdf" });

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=Resume.pdf",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "PDF failed" },
      { status: 500 }
    );
  }
}