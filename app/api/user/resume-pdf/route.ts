import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import PDFDocument from "pdfkit";

export const runtime = "nodejs"; // ✅ VERY IMPORTANT

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const name = user.name || "Not Provided";
    const email = user.email || "Not Provided";
    const role = user.role || "Not Provided";
    const skills = user.skills?.join(", ") || "Not Provided";
    const resumeText = user.resume || "Experience & Education: Not Provided";

    // ✅ CREATE PDF
    const doc = new PDFDocument({ margin: 50 });

    const chunks: any[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    // 🔥 WRITE CONTENT
    doc.fontSize(20).text(name, { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`${email} | ${role}`, { align: "center" });

    doc.moveDown(2);

    doc.fontSize(14).text("TECHNICAL SKILLS");
    doc.moveDown(0.5);
    doc.fontSize(11).text(skills);

    doc.moveDown(1.5);

    doc.fontSize(14).text("EXPERIENCE & EDUCATION");
    doc.moveDown(0.5);
    doc.fontSize(11).text(resumeText);

    doc.end();

    // ✅ WAIT FOR PDF
    const pdfBuffer = await pdfPromise;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name.replace(/\s+/g, "_")}_Resume.pdf"`,
      },
    });

  } catch (err) {
    console.error("PDF ERROR:", err);
    return NextResponse.json(
      { message: "PDF generation failed" },
      { status: 500 }
    );
  }
}