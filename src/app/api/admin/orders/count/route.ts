import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/authHelpers";

export async function GET() {
  try {
    await requireAdmin();

    const pendingCount = await prisma.order.count({
      where: {
        status: "PENDING",
      },
    });

    return NextResponse.json({ pendingCount });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.error("Failed to fetch pending count:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
