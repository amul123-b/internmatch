import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import PDFDocument from "pdfkit";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeOverride = searchParams.get("aiResume");

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User profile not found." }, { status: 404 });
    }

    if (!user.name || !user.email) {
      return NextResponse.json({ message: "Critical fields missing. Update profile." }, { status: 400 });
    }

    // Prepare content strictly
    const userName = user.name || "Not Provided";
    const userEmail = session.user.email || "Not Provided";
    const userRole = user.role || "Not Provided";
    const userSkills = user.skills?.join(", ") || "Not Provided";
    
    // We allow an override logic so the user can download the AI tailored resume text if it exists
    // The user requirement said: "Generate a clean ATS friendly PDF based only on verified data... if missing show Not Provided"
    const finalResumeText = resumeOverride || user.resume || "Experience & Education: Not Provided";

    const stream = new ReadableStream({
      start(controller) {
        const doc = new PDFDocument({ margin: 60, size: 'A4' });

        doc.on("data", (chunk) => controller.enqueue(chunk));
        doc.on("end", () => controller.close());

        // Header
        doc.font("Helvetica-Bold").fontSize(24).text(userName, { align: "center" });
        doc.font("Helvetica").fontSize(10).text(`${userEmail} | ${userRole}`, { align: "center" });
        doc.moveDown(2);

        // Skills Section
        doc.font("Helvetica-Bold").fontSize(14).text("TECHNICAL SKILLS");
        const rightMargin1 = doc.options.margins?.right ? Number(doc.options.margins.right) : 60;
        doc.moveTo(doc.x, doc.y).lineTo(Number(doc.page.width) - rightMargin1, doc.y).stroke();
        doc.moveDown(0.5);
        doc.font("Helvetica").fontSize(11).text(userSkills);
        doc.moveDown(1.5);

        // Experience & Education Section
        doc.font("Helvetica-Bold").fontSize(14).text("EXPERIENCE & EDUCATION");
        const rightMargin2 = doc.options.margins?.right ? Number(doc.options.margins.right) : 60;
        doc.moveTo(doc.x, doc.y).lineTo(Number(doc.page.width) - rightMargin2, doc.y).stroke();
        doc.moveDown(0.5);
        
        doc.font("Helvetica").fontSize(11).text(finalResumeText, {
          lineGap: 4
        });

        doc.end();
      }
    });

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="${userName.replace(/\s+/g, '_')}_Resume.pdf"`);

    return new NextResponse(stream, { status: 200, headers });

  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json({ message: "PDF Generation Failed" }, { status: 500 });
  }
}
