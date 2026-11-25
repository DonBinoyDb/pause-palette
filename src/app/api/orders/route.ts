import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/authHelpers";
import { generateOrderNumber } from "@/lib/orderHelpers";
import { calculateCuratedItemPrice, resolveCuratedItem } from "@/lib/curatorPricing";
import { z } from "zod";

const createOrderSchema = z.object({
  customerName: z.string().min(2, "Name is required").trim(),
  customerEmail: z.string().email("Valid email is required").trim(),
  customerPhone: z.string().min(10, "Valid phone number is required").trim(),
  shippingAddress: z.object({
    addressLine1: z.string().min(3, "Address is required"),
    addressLine2: z.string().optional().nullable(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().min(4, "Pincode is required"),
    country: z.string().default("India"),
  }),
  orderNotes: z.string().optional().nullable(),
  idempotencyKey: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().optional().nullable(),
        name: z.string(),
        image: z.string().optional().nullable(),
        quantity: z.number().int().min(1).max(20).default(1),
        size: z.string().optional().nullable(),
        silhouette: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        curatedDetails: z.any().optional().nullable(),
      })
    )
    .min(1, "At least one item is required in the cart"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      orderNotes,
      idempotencyKey,
      items,
    } = parsed.data;

    // Idempotency check: if already placed with this key, return it
    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: {
          userId_idempotencyKey: {
            userId: user.id,
            idempotencyKey,
          },
        },
        include: {
          items: true,
        },
      });

      if (existing) {
        return NextResponse.json({
          order: existing,
          isReplay: true,
        });
      }
    }

    // Separate regular catalog products from bespoke curated pieces
    const catalogProductIds = items
      .map((i) => i.productId)
      .filter((id): id is string => Boolean(id && !id.startsWith("curated-")));

    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: catalogProductIds },
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        isPublished: true,
      },
    });

    type CatalogProductType = {
      id: string;
      name: string;
      price: number;
      images: string[];
      isPublished: boolean;
    };

    const productMap = new Map<string, CatalogProductType>(
      dbProducts.map((p: any) => [p.id, p as CatalogProductType])
    );

    // Build verified items and compute verified server total
    let totalAmount = 0;
    const validatedItemsToCreate: Array<{
      productId: string | null;
      productName: string;
      productImage: string | null;
      price: number;
      quantity: number;
      size: string | null;
      silhouette: string | null;
      color: string | null;
      curatedDetails: any;
    }> = [];

    for (const item of items) {
      let finalPrice = 0;
      let finalName = item.name;
      let finalImage = item.image || null;
      let dbProductId: string | null = null;

      let finalCuratedDetails = item.curatedDetails || null;

      if (item.productId && !item.productId.startsWith("curated-")) {
        const dbProduct = productMap.get(item.productId);
        if (!dbProduct) {
          return NextResponse.json(
            { error: `Product "${item.name}" is no longer available.` },
            { status: 400 }
          );
        }
        finalPrice = Math.round(dbProduct.price);
        finalName = dbProduct.name;
        finalImage = dbProduct.images?.[0] || finalImage;
        dbProductId = dbProduct.id;
      } else {
        // Curated bespoke piece - compute price & freeze snapshot strictly server-side
        const { verifiedPrice, frozenDetails } = await resolveCuratedItem(item.curatedDetails);
        finalPrice = verifiedPrice;
        finalCuratedDetails = frozenDetails;
      }

      totalAmount += finalPrice * item.quantity;
      validatedItemsToCreate.push({
        productId: dbProductId,
        productName: finalName,
        productImage: finalImage,
        price: finalPrice,
        quantity: item.quantity,
        size: item.size || null,
        silhouette: item.silhouette || null,
        color: item.color || null,
        curatedDetails: finalCuratedDetails,
      });
    }

    // Attempt creation with retry on order number collision
    let createdOrder = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (!createdOrder && attempts < maxAttempts) {
      attempts++;
      const orderNumber = generateOrderNumber();

      try {
        createdOrder = await prisma.order.create({
          data: {
            orderNumber,
            userId: user.id,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            orderNotes,
            totalAmount,
            status: "PENDING",
            paymentStatus: "PENDING",
            idempotencyKey: idempotencyKey || null,
            items: {
              create: validatedItemsToCreate,
            },
          },
          include: {
            items: true,
          },
        });
      } catch (err: any) {
        // If unique constraint violation on idempotency key, fetch and return
        if (err.code === "P2002" && err.meta?.target?.includes("idempotencyKey")) {
          const existing = await prisma.order.findUnique({
            where: {
              userId_idempotencyKey: {
                userId: user.id,
                idempotencyKey: idempotencyKey!,
              },
            },
            include: { items: true },
          });
          if (existing) return NextResponse.json({ order: existing, isReplay: true });
        }

        // If collision on orderNumber, retry
        if (err.code === "P2002" && err.meta?.target?.includes("orderNumber")) {
          continue;
        }

        throw err;
      }
    }

    if (!createdOrder) {
      return NextResponse.json(
        { error: "Could not generate a unique order reference. Please retry." },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: createdOrder }, { status: 201 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please log in to place an order." }, { status: 401 });
    }
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to place order." }, { status: 500 });
  }
}
