import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/authHelpers";
import { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (statusParam !== "ALL" && Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
      where.status = statusParam as OrderStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, totalCount, totalAll, pendingCount, inMakingCount, paidOrders] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "IN_MAKING" } }),
      prisma.order.findMany({
        where: {
          paymentStatus: "PAID",
          status: { not: "CANCELLED" },
        },
        select: {
          totalAmount: true,
        },
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum: number, o: { totalAmount: number }) => sum + (o.totalAmount || 0), 0);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      },
      kpis: {
        totalOrders: totalAll,
        pendingAction: pendingCount,
        inMaking: inMakingCount,
        totalRevenue,
      },
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.error("Failed to fetch admin orders:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
