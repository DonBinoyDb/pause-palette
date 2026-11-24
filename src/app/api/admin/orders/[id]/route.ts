import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/authHelpers";
import { ALLOWED_TRANSITIONS, OrderStatusType } from "@/lib/orderHelpers";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";

const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  courierName: z.string().trim().optional().nullable(),
  trackingNumber: z.string().trim().optional().nullable(),
  adminNotes: z.string().trim().optional().nullable(),
  markRefunded: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { status, paymentStatus, courierName, trackingNumber, adminNotes, markRefunded } =
      parsed.data;

    // Fetch existing order to check current state
    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Status transition validation
    if (status && status !== existing.status) {
      const allowed = ALLOWED_TRANSITIONS[existing.status as OrderStatusType] || [];
      if (!allowed.includes(status as OrderStatusType)) {
        return NextResponse.json(
          {
            error: `Invalid status transition from ${existing.status} to ${status}. Allowed: ${
              allowed.length ? allowed.join(", ") : "None (Terminal state)"
            }`,
          },
          { status: 400 }
        );
      }

      // Mandatory tracking info on DISPATCHED
      if (status === "DISPATCHED") {
        const finalCourier = courierName ?? existing.courierName;
        const finalTracking = trackingNumber ?? existing.trackingNumber;
        if (!finalCourier?.trim() || !finalTracking?.trim()) {
          return NextResponse.json(
            { error: "Courier name and tracking number are required when marking an order as Dispatched." },
            { status: 400 }
          );
        }
      }
    }

    // Prepare update payload
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (courierName !== undefined) updateData.courierName = courierName;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // Handle cancellation of a paid order
    if (status === "CANCELLED" && existing.paymentStatus === "PAID" && markRefunded) {
      updateData.paymentStatus = "REFUNDED";
    }

    // Optimistic concurrency control: ensure status hasn't changed concurrently
    const result = await prisma.order.updateMany({
      where: {
        id,
        status: existing.status,
      },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Conflict: This order was updated by another administrator. Please refresh." },
        { status: 409 }
      );
    }

    // Return refreshed order with items
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    console.error("Failed to update order:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
