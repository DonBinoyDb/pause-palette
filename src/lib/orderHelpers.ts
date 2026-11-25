import { randomInt } from "crypto";

// Unambiguous character set (no 0, O, 1, I)
const ORDER_CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateOrderNumber(): string {
  const chars: string[] = [];
  for (let i = 0; i < 6; i++) {
    const idx = randomInt(ORDER_CHARSET.length);
    chars.push(ORDER_CHARSET[idx]);
  }
  return `PP-${chars.join("")}`;
}

export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    return digits;
  }
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export type OrderStatusType = 
  | "PENDING"
  | "CONFIRMED"
  | "IN_MAKING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export const ALLOWED_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_MAKING", "CANCELLED"],
  IN_MAKING: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const ORDER_STATUS_CONFIG: Record<
  OrderStatusType,
  { label: string; badgeClass: string; dotClass: string }
> = {
  PENDING: {
    label: "Pending Action",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    dotClass: "bg-blue-500",
  },
  IN_MAKING: {
    label: "In Making",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    dotClass: "bg-purple-500",
  },
  DISPATCHED: {
    label: "Dispatched",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
    dotClass: "bg-indigo-500",
  },
  DELIVERED: {
    label: "Delivered",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
    dotClass: "bg-rose-500",
  },
};

export const CUSTOMER_STATUS_CONFIG: Record<
  OrderStatusType,
  { label: string; badgeClass: string; dotClass: string }
> = {
  PENDING: {
    label: "Order Placed",
    badgeClass: "bg-[#FBF9F4] text-[#7A6233] border-[#EAE2D2]",
    dotClass: "bg-[#C29D47]",
  },
  CONFIRMED: {
    label: "Confirmed",
    badgeClass: "bg-[#F4F7FA] text-[#3D5A70] border-[#D5E1EC]",
    dotClass: "bg-[#4E7185]",
  },
  IN_MAKING: {
    label: "In Making",
    badgeClass: "bg-[#F8F5FA] text-[#5F4A75] border-[#E3D9EC]",
    dotClass: "bg-[#7D5E9E]",
  },
  DISPATCHED: {
    label: "Dispatched",
    badgeClass: "bg-[#F5F6FA] text-[#425078] border-[#D9DFEC]",
    dotClass: "bg-[#526496]",
  },
  DELIVERED: {
    label: "Delivered",
    badgeClass: "bg-[#F4F9F6] text-[#2F6142] border-[#D1E5D8]",
    dotClass: "bg-[#3D8057]",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-[#FAF4F4] text-[#8C4A4A] border-[#ECDCDC]",
    dotClass: "bg-[#B05B5B]",
  },
};
