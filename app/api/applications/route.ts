import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ applications: apps });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ applications: [] });
  }
}