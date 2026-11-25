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

// GET single address (ownership verified)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const address = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("[ADDRESS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch address" }, { status: 500 });
  }
}

// PUT update an existing address
export async function PUT(
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
      isDefault,
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

    const cleanLabel = (label?.trim() || existing.label || "Home");
    const wantsDefault = isDefault !== undefined ? Boolean(isDefault) : existing.isDefault;

    let updatedAddress;

    if (wantsDefault) {
      // Transaction: unset other defaults, update this one
      updatedAddress = await prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: { userId: user.id, id: { not: id } },
          data: { isDefault: false },
        });

        return tx.address.update({
          where: { id },
          data: {
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
      updatedAddress = await prisma.address.update({
        where: { id },
        data: {
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

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("[ADDRESS_PUT]", error);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

// DELETE an address with automatic default reassignment
export async function DELETE(
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

    // Atomic transaction: delete address and if it was default, reassign next address
    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id },
      });

      // If the deleted address was default, promote the most recently updated remaining address
      if (existing.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("[ADDRESS_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
