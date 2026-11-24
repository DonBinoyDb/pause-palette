import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();
  if (!user || user.role?.toLowerCase() !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
