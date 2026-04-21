import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import PDFDocument from "pdfkit";

// 🔥 IMPORTANT (Fix for Vercel)
export const runtime = "nodejs";

export async function GET(req: Request) {
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

    // 🧠 Safe fallback values
    const name = user.name || "Not Provided";
    const email = session.user.email || "Not Provided";
    const role = user.role || "Not Provided";
    const skills = user.skills?.join(", ") || "Not Provided";
    const experience = user.experience || "Not Provided";
    const education = user.education || "Not Provided";

    // 🧾 Create PDF
    const doc = new PDFDocument({ margin: 50 });

    const buffers: Uint8Array[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    
    doc.on("end", () => {});

    // 📄 CONTENT
    doc.fontSize(22).text(name, { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`${email} | ${role}`, { align: "center" });

    doc.moveDown(2);

    doc.fontSize(14).text("SKILLS");
    doc.moveDown(0.5);
    doc.fontSize(11).text(skills);

    doc.moveDown(1.5);

    doc.fontSize(14).text("EXPERIENCE");
    doc.moveDown(0.5);
    doc.fontSize(11).text(experience);

    doc.moveDown(1.5);

    doc.fontSize(14).text("EDUCATION");
    doc.moveDown(0.5);
    doc.fontSize(11).text(education);

    doc.end();

    // 🔥 WAIT for PDF to finish
    await new Promise((resolve) => doc.on("end", resolve));

    const pdfBuffer = Buffer.concat(buffers);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name.replace(/\s+/g, "_")}_Resume.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF ERROR:", error);

    return NextResponse.json(
      { message: "PDF generation failed" },
      { status: 500 }
    );
  }
}