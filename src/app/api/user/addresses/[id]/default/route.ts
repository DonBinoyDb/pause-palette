import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

// PATCH set address as default
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Atomic transaction: unset any existing defaults and mark this one as default
    const updated = await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: user.id, id: { not: id } },
        data: { isDefault: false },
      });

      return tx.address.update({
        where: { id },
        data: { isDefault: true },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ADDRESS_DEFAULT_PATCH]", error);
    return NextResponse.json({ error: "Failed to set default address" }, { status: 500 });
  }
}
