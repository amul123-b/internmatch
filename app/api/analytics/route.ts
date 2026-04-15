import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    // Sanitize and Validate Analytics Payload securely
    const { event, details } = body;
    if (!event || typeof event !== "string") {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }
    
    // Lightweight mock solution dumping to server logs securely instead of complex DB metric ingestion
    const timestamp = new Date().toISOString();
    const userContext = session?.user?.email || "anonymous";

    console.log(`[ANALYTICS - ${timestamp}] Event: ${event} | User: ${userContext} | Details: ${details ? JSON.stringify(details).substring(0, 500) : "N/A"}`);

    return NextResponse.json({ success: true, message: "Tracked" }, { status: 200 });

  } catch (error) {
    // We swallow analytic fail alerts silently to prevent breaking actual ux flow.
    console.error("Analytics failure", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
