"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import {
  ArrowLeft,
  Printer,
  MessageCircle,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react";
import { CUSTOMER_STATUS_CONFIG, OrderStatusType, normalizeIndianPhone } from "@/lib/orderHelpers";

export default function OrderReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderNumber}`, { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/login?callbackUrl=/order-success/${orderNumber}`);
            return;
          }
          if (res.status === 404 || res.status === 403) {
            setError("Order details could not be found or you do not have permission to view it.");
            return;
          }
          throw new Error("Failed to load order receipt");
        }
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.error(err);
        setError("Unable to load order receipt.");
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber, router]);

  const getWhatsAppLink = () => {
    if (!order) return "#";
    const storeWhatsApp = "917907629021";
    const message = encodeURIComponent(
      `Hello Pause Palette! I am inquiring about my Order Receipt #${order.orderNumber} (Total: ₹${order.totalAmount.toLocaleString(
        "en-IN"
      )}).`
    );
    return `https://wa.me/${storeWhatsApp}?text=${message}`;
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col font-sans text-[#2C2B29]">
      <div className="print:hidden">
        <Navbar variant="dark" />
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-20 print:p-0 print:pt-4 print:max-w-none">
        <div className="mb-4 print:hidden">
          <BackButton fallbackHref="/profile" />
        </div>
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-9 h-9 border-2 border-[#79A7D3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif text-gray-500 text-sm">Preparing official order receipt...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-white border border-[#E8E6E1] p-8 rounded-xs shadow-2xs max-w-lg mx-auto">
            <p className="text-gray-700 font-serif text-base mb-5">{error}</p>
            <Link
              href="/profile?tab=orders"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2C2B29] text-white font-serif text-xs uppercase tracking-widest rounded-xs hover:bg-black transition-colors"
            >
              Return to Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Action Bar (Hidden when printing) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 print:hidden">
              <Link
                href="/profile?tab=orders"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#8B8985] hover:text-[#2C2B29] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Order History</span>
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#D6D3CD] hover:border-[#2C2B29] bg-white hover:bg-[#FAF8F5] text-xs uppercase tracking-[0.16em] font-medium text-[#2C2B29] rounded-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>

                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-[0.16em] font-medium rounded-xs transition-colors shadow-2xs"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
            </div>

            {/* Official Order Receipt Document */}
            <div className="bg-white border border-[#E8E6E1] p-6 sm:p-10 md:p-12 shadow-sm rounded-xs print:border-none print:shadow-none print:p-0">
              {/* Receipt Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-[#E8E6E1]">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/Pause.png"
                    alt="Pause Palette"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B8985] font-semibold mt-2">
                    Pause Palette • Slow Living Apparel
                  </p>
                  <p className="text-[11px] text-[#8B8985] mt-0.5">
                    Artisanal Tailoring & Curated Wardrobe
                  </p>
                  <p className="text-[11px] text-[#8B8985]">
                    Kerala, India • contact@pausepalette.com
                  </p>
                </div>

                <div className="sm:text-right w-full sm:w-auto">
                  <span className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-semibold text-[#8B8985] block mb-1">
                    Official Receipt
                  </span>
                  <h1 className="font-garamond text-2xl sm:text-3xl text-[#2C2B29] font-medium tracking-tight">
                    {order.orderNumber}
                  </h1>

                  <p className="text-xs text-[#8B8985] mt-1.5">
                    Date:{" "}
                    <span className="text-[#2C2B29] font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </p>

                  <div className="mt-3 flex sm:justify-end gap-2 items-center flex-wrap">
                    {(() => {
                      const statusConfig =
                        CUSTOMER_STATUS_CONFIG[order.status as OrderStatusType] || {
                          label: order.status,
                          badgeClass: "bg-gray-50 text-gray-700 border-gray-200",
                          dotClass: "bg-gray-400",
                        };

                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusConfig.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                          <span>{statusConfig.label}</span>
                        </span>
                      );
                    })()}

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      Payment: {order.paymentStatus || "PENDING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-[#E8E6E1]">
                {/* Billed To / Customer */}
                <div>
                  <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-[#8B8985] block mb-2">
                    Customer Information
                  </span>
                  <p className="font-medium text-[15px] sm:text-[16px] text-[#2C2B29] leading-snug">
                    {order.customerName}
                  </p>
                  <p className="text-xs text-[#5C5A58] mt-1">{order.customerEmail}</p>
                  <p className="text-xs text-[#5C5A58] mt-0.5">+91 {order.customerPhone}</p>

                  {order.orderNotes && (
                    <div className="mt-4 pt-3 border-t border-[#F0EDE8]">
                      <span className="text-[10px] uppercase tracking-wider text-[#8B8985] font-semibold block">
                        Order Notes / Custom Instructions:
                      </span>
                      <p className="text-xs text-[#5C5A58] italic mt-1 leading-relaxed">
                        &ldquo;{order.orderNotes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Delivery Destination */}
                <div>
                  <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-[#8B8985] block mb-2">
                    Delivery Destination
                  </span>
                  <p className="font-medium text-[15px] sm:text-[16px] text-[#2C2B29] leading-snug">
                    {order.customerName}
                  </p>
                  <div className="text-xs text-[#5C5A58] leading-relaxed mt-1">
                    <p>{order.shippingAddress?.addressLine1}</p>
                    {order.shippingAddress?.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                      {order.shippingAddress?.pincode}
                    </p>
                    <p className="text-[#8B8985] uppercase tracking-wider text-[11px] mt-0.5">
                      {order.shippingAddress?.country || "India"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Ordered Table */}
              <div className="py-8">
                <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-[#8B8985] block mb-4">
                  Pieces in this Order ({order.items?.length || 0})
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8E6E1] text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-[#8B8985] font-semibold">
                        <th className="pb-3 pr-4 font-semibold">Item & Description</th>
                        <th className="pb-3 px-4 text-center font-semibold">Qty</th>
                        <th className="pb-3 px-4 text-right font-semibold">Unit Price</th>
                        <th className="pb-3 pl-4 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EDE8]">
                      {order.items?.map((item: any) => {
                        const cleanSize = item.size?.trim();
                        const cleanFit = item.silhouette
                          ? item.silhouette.replace(/-/g, " ").trim()
                          : null;
                        const cleanColor = item.color?.trim();

                        return (
                          <tr key={item.id} className="align-top">
                            {/* Item info */}
                            <td className="py-4 pr-4">
                              <div className="flex items-start gap-3.5">
                                <div className="w-12 h-16 bg-[#FAF8F5] border border-[#E8E6E1] rounded-2xs overflow-hidden shrink-0 print:hidden">
                                  {item.productImage ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={item.productImage}
                                      alt={item.productName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                      <ShoppingBag size={14} />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-serif text-[15px] sm:text-[16px] text-[#2C2B29] font-normal leading-snug">
                                    {item.productName}
                                  </p>

                                  {/* Specs */}
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] sm:text-[11px] tracking-wider uppercase text-[#8B8985] mt-1">
                                    {cleanSize && (
                                      <span>
                                        Size:{" "}
                                        <strong className="text-[#2C2B29] font-medium">
                                          {cleanSize}
                                        </strong>
                                      </span>
                                    )}
                                    {cleanSize && (cleanFit || cleanColor) && (
                                      <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                                    )}
                                    {cleanFit && (
                                      <span>
                                        Fit:{" "}
                                        <strong className="text-[#2C2B29] font-medium">
                                          {cleanFit}
                                        </strong>
                                      </span>
                                    )}
                                    {cleanFit && cleanColor && (
                                      <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                                    )}
                                    {cleanColor && (
                                      <span>
                                        Color:{" "}
                                        <strong className="text-[#2C2B29] font-medium">
                                          {cleanColor}
                                        </strong>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Qty */}
                            <td className="py-4 px-4 text-center text-xs text-[#5C5A58]">
                              {item.quantity}
                            </td>

                            {/* Unit Price */}
                            <td className="py-4 px-4 text-right font-garamond text-sm sm:text-[15px] text-[#5C5A58]">
                              ₹{item.price.toLocaleString("en-IN")}
                            </td>

                            {/* Line Total */}
                            <td className="py-4 pl-4 text-right font-garamond font-medium text-sm sm:text-base text-[#2C2B29]">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation Summary (Right Aligned) */}
              <div className="pt-4 border-t border-[#E8E6E1] flex justify-end">
                <div className="w-full sm:w-72 space-y-2.5">
                  <div className="flex justify-between items-center text-xs text-[#5C5A58]">
                    <span>Items Subtotal</span>
                    <span className="font-garamond text-sm text-[#2C2B29]">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-[#5C5A58]">
                    <span>Tailoring & Handling</span>
                    <span className="text-[11px] text-[#4E7185] font-medium uppercase tracking-wider">
                      Complimentary
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-[#5C5A58]">
                    <span>Insured Domestic Delivery</span>
                    <span className="text-[11px] text-[#4E7185] font-medium uppercase tracking-wider">
                      Complimentary
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E8E6E1] flex justify-between items-baseline">
                    <span className="text-xs uppercase tracking-[0.18em] font-semibold text-[#2C2B29]">
                      Total Paid / Due
                    </span>
                    <span className="font-garamond font-semibold text-xl sm:text-2xl text-[#2C2B29]">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#8B8985] text-right pt-0.5">
                    Includes all applicable goods & service levies
                  </p>
                </div>
              </div>

              {/* Receipt Footer / Studio Guarantee */}
              <div className="mt-12 pt-6 border-t border-[#E8E6E1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#8B8985]">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#8B8985] shrink-0" />
                  <span>
                    Handcrafted slowly to order in our Kerala artisanal studio. Thank you for curating with us.
                  </span>
                </div>
                <p className="text-[11px] shrink-0">
                  Concierge: <span className="font-mono text-[#5C5A58]">+91 79076 29021</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
