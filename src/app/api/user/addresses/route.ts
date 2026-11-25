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

// GET all addresses for the logged-in user
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("[ADDRESSES_GET]", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

// POST create a new address for the logged-in user
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country = "India",
      isDefault = false,
      deduplicate = false,
    } = body;

    // Validation
    if (!fullName?.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    const cleanPhone = (phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json({ error: "Valid 10-digit phone number is required" }, { status: 400 });
    }
    if (!addressLine1?.trim()) {
      return NextResponse.json({ error: "Address line 1 is required" }, { status: 400 });
    }
    if (!city?.trim()) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }
    if (!state?.trim()) {
      return NextResponse.json({ error: "State is required" }, { status: 400 });
    }
    const cleanPin = (pincode || "").replace(/\D/g, "");
    if (!cleanPin || cleanPin.length < 6) {
      return NextResponse.json({ error: "Valid 6-digit PIN code is required" }, { status: 400 });
    }

    const cleanLabel = (label?.trim() || "Home");

    // Optional deduplication (useful during checkout when user checks "Save to profile")
    if (deduplicate) {
      const existing = await prisma.address.findFirst({
        where: {
          userId: user.id,
          addressLine1: { equals: addressLine1.trim(), mode: "insensitive" },
          city: { equals: city.trim(), mode: "insensitive" },
          pincode: cleanPin,
        },
      });

      if (existing) {
        // Update existing address details instead of creating a duplicate
        const updated = await prisma.address.update({
          where: { id: existing.id },
          data: {
            fullName: fullName.trim(),
            phone: cleanPhone,
            addressLine2: addressLine2?.trim() || null,
            state: state.trim(),
            label: cleanLabel,
            ...(isDefault ? { isDefault: true } : {}),
          },
        });

        if (isDefault) {
          // If marked default, unset others in transaction
          await prisma.$transaction([
            prisma.address.updateMany({
              where: { userId: user.id, id: { not: existing.id } },
              data: { isDefault: false },
            }),
            prisma.address.update({
              where: { id: existing.id },
              data: { isDefault: true },
            }),
          ]);
        }

        return NextResponse.json(updated);
      }
    }

    // Check count of user's addresses. If this is their first address, force isDefault = true
    const existingCount = await prisma.address.count({
      where: { userId: user.id },
    });

    const shouldBeDefault = existingCount === 0 ? true : Boolean(isDefault);

    let createdAddress;

    if (shouldBeDefault) {
      // Atomic transaction: unset any existing default address first, then create with isDefault = true
      createdAddress = await prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });

        return tx.address.create({
          data: {
            userId: user.id,
            label: cleanLabel,
            fullName: fullName.trim(),
            phone: cleanPhone,
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2?.trim() || null,
            city: city.trim(),
            state: state.trim(),
            pincode: cleanPin,
            country: country.trim() || "India",
            isDefault: true,
          },
        });
      });
    } else {
      createdAddress = await prisma.address.create({
        data: {
          userId: user.id,
          label: cleanLabel,
          fullName: fullName.trim(),
          phone: cleanPhone,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2?.trim() || null,
          city: city.trim(),
          state: state.trim(),
          pincode: cleanPin,
          country: country.trim() || "India",
          isDefault: false,
        },
      });
    }

    return NextResponse.json(createdAddress, { status: 201 });
  } catch (error) {
    console.error("[ADDRESSES_POST]", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
