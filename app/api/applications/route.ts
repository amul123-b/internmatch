import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// 📥 GET APPLICATIONS
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ applications: [] });
    }

    const client = await clientPromise;
    const db = client.db();

    const apps = await db
      .collection("applications")
      .find({ email: session.user.email })
      .toArray();

    return NextResponse.json({ applications: apps });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ applications: [] });
  }
}

// 📤 SAVE APPLICATION
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { jobTitle, company } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    await db.collection("applications").insertOne({
      email: session.user.email,
      jobTitle,
      company,
      status: "Applied",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}