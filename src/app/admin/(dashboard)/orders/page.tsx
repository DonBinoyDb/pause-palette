"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Search,
  RefreshCw,
  X,
  MessageCircle,
  Copy,
  Check,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Eye,
  ExternalLink,
  DollarSign,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import { normalizeIndianPhone, ALLOWED_TRANSITIONS, ORDER_STATUS_CONFIG, OrderStatusType } from "@/lib/orderHelpers";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  size: string | null;
  silhouette: string | null;
  color: string | null;
  curatedDetails?: any;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  orderNotes?: string | null;
  adminNotes?: string | null;
  totalAmount: number;
  status: OrderStatusType;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  courierName?: string | null;
  trackingNumber?: string | null;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_TABS = [
  { id: "ALL", label: "All Orders" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "IN_MAKING", label: "In Making" },
  { id: "DISPATCHED", label: "Dispatched" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "CANCELLED", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [kpis, setKpis] = useState({
    totalOrders: 0,
    pendingAction: 0,
    inMaking: 0,
    totalRevenue: 0,
  });

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [courierInput, setCourierInput] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        status: activeStatus,
        search: searchQuery,
        page: page.toString(),
        limit: "12",
      });

      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?callbackUrl=/admin/orders");
          return;
        }
        if (res.status === 403) {
          toast.error("Admin access required.");
          return;
        }
        const errJson = await res.json().catch(() => ({}));
        toast.error(errJson.error || "Failed to load orders");
        return;
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
      if (data.kpis) {
        setKpis(data.kpis);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, searchQuery, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setCourierInput(order.courierName || "");
    setTrackingInput(order.trackingNumber || "");
    setAdminNotesInput(order.adminNotes || "");
  };

  const handleCloseDrawer = () => {
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (
    targetStatus: OrderStatusType,
    extraData?: { courierName?: string; trackingNumber?: string; markRefunded?: boolean }
  ) => {
    if (!selectedOrder) return;

    if (targetStatus === "DISPATCHED") {
      const courier = (extraData?.courierName ?? courierInput).trim();
      const tracking = (extraData?.trackingNumber ?? trackingInput).trim();
      if (!courier || !tracking) {
        toast.error("Courier name and tracking number are required for dispatch.");
        return;
      }
    }

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          courierName: courierInput.trim() || null,
          trackingNumber: trackingInput.trim() || null,
          adminNotes: adminNotesInput.trim() || null,
          markRefunded: extraData?.markRefunded,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update order status");
        return;
      }

      toast.success(`Order moved to ${ORDER_STATUS_CONFIG[targetStatus]?.label || targetStatus}`);
      setSelectedOrder(data.order);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Network error updating order.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminNotes: adminNotesInput.trim() || null,
          courierName: courierInput.trim() || null,
          trackingNumber: trackingInput.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save notes");
        return;
      }

      toast.success("Order details saved");
      setSelectedOrder(data.order);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notes.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (newPaymentStatus: "PENDING" | "PAID" | "REFUNDED") => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: newPaymentStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update payment status");
        return;
      }

      toast.success(`Payment updated to ${newPaymentStatus}`);
      setSelectedOrder(data.order);
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment.");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    toast.success("Order number copied!");
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const getWhatsAppLink = (order: Order) => {
    const phone = normalizeIndianPhone(order.customerPhone);
    const message = encodeURIComponent(
      `Hello ${order.customerName}, regarding your Pause Palette order #${order.orderNumber}:`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen text-[#2C2B29]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#79A7D3] font-semibold">
              Store Management
            </span>
          </div>
          <h1 className="font-garamond text-3xl sm:text-4xl text-[#2C2B29] tracking-tight">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review incoming orders, process shipments, and manage customer fulfillment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders()}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 text-xs font-serif tracking-widest uppercase border border-gray-300 bg-white hover:bg-gray-50 transition-colors shadow-2xs rounded-xs"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-[#79A7D3]" : "text-gray-500"} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
        <div className="bg-white border border-gray-200/80 p-5 rounded-xs shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] uppercase tracking-widest font-mono text-gray-500">Total Orders</span>
            <ClipboardList size={18} className="text-[#79A7D3]" />
          </div>
          <p className="font-garamond text-2xl sm:text-3xl text-gray-900 font-normal">
            {kpis.totalOrders}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Lifetime customer purchases</p>
        </div>

        <div className="bg-white border border-amber-200/70 p-5 rounded-xs shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] uppercase tracking-widest font-mono font-medium">Pending Action</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <p className="font-garamond text-2xl sm:text-3xl text-amber-900 font-normal">
            {kpis.pendingAction}
          </p>
          <p className="text-[11px] text-amber-700/80 mt-1">Needs confirmation & payment verification</p>
        </div>

        <div className="bg-white border border-purple-200/70 p-5 rounded-xs shadow-2xs">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-[11px] uppercase tracking-widest font-mono font-medium">In Making</span>
            <PackageCheck size={18} className="text-purple-500" />
          </div>
          <p className="font-garamond text-2xl sm:text-3xl text-purple-900 font-normal">
            {kpis.inMaking}
          </p>
          <p className="text-[11px] text-purple-700/80 mt-1">Artisan workshop production</p>
        </div>

        <div className="bg-white border border-emerald-200/70 p-5 rounded-xs shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] uppercase tracking-widest font-mono font-medium">Paid Revenue</span>
            <DollarSign size={18} className="text-emerald-500" />
          </div>
          <p className="font-garamond text-2xl sm:text-3xl text-emerald-900 font-normal">
            ₹{kpis.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-emerald-700/80 mt-1">Excludes cancelled orders</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-gray-200 rounded-xs mb-6 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center border-b border-gray-100">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {STATUS_TABS.map((tab) => {
              const isActive = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveStatus(tab.id);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-serif tracking-wider uppercase rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#2C2B29] text-white font-medium shadow-2xs"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, name, phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xs bg-[#FAF8F5]/60 focus:bg-white focus:outline-none focus:border-[#79A7D3] transition-colors"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-gray-200 text-[11px] font-mono uppercase tracking-wider text-gray-500">
                <th className="py-3 px-4 font-medium">Order #</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Items</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 font-serif">
                    <RefreshCw size={22} className="animate-spin text-[#79A7D3] mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 font-serif">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusConf = ORDER_STATUS_CONFIG[order.status] || {
                    label: order.status,
                    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
                    dotClass: "bg-gray-400",
                  };

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF8F5]/50 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDrawer(order)}
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-gray-900 whitespace-nowrap">
                        <span className="text-[#2C2B29] group-hover:text-[#79A7D3] transition-colors">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{order.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        <span className="font-medium">{order.items.length}</span> piece{order.items.length > 1 ? "s" : ""}
                        <span className="text-gray-400 text-[11px] ml-1.5 truncate max-w-[150px] inline-block align-bottom">
                          ({order.items[0]?.productName || "Piece"}
                          {order.items.length > 1 ? ` +${order.items.length - 1}` : ""})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-serif font-medium text-gray-900 whitespace-nowrap">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-medium border ${
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : order.paymentStatus === "REFUNDED"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusConf.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotClass}`} />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrawer(order);
                          }}
                          className="px-2.5 py-1 text-[11px] font-serif tracking-wider uppercase text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 rounded-xs transition-colors shadow-2xs inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-[#FAF8F5]/30">
          <div>
            Showing <span className="font-medium text-gray-800">{orders.length}</span> of{" "}
            <span className="font-medium text-gray-800">{totalCount}</span> total orders
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-gray-200 rounded-xs bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="font-mono text-[11px] px-2">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-gray-200 rounded-xs bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Next Page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Order Details Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={handleCloseDrawer}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-[#FAF8F5]">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-xl font-bold tracking-tight text-gray-900">
                    {selectedOrder.orderNumber}
                  </h2>
                  <button
                    type="button"
                    onClick={() => copyOrderNumber(selectedOrder.orderNumber)}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                    title="Copy Order #"
                  >
                    {copiedNumber ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    ORDER_STATUS_CONFIG[selectedOrder.status]?.badgeClass
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      ORDER_STATUS_CONFIG[selectedOrder.status]?.dotClass
                    }`}
                  />
                  {ORDER_STATUS_CONFIG[selectedOrder.status]?.label}
                </span>

                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="p-1.5 text-gray-400 hover:text-gray-800 rounded-xs transition-colors"
                  aria-label="Close drawer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xs p-4 bg-[#FAF8F5]/40">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-2">
                    Customer Details
                  </span>
                  <p className="font-medium text-sm text-gray-900">{selectedOrder.customerName}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{selectedOrder.customerEmail}</p>
                  <p className="text-xs font-mono text-gray-700 mt-1">{selectedOrder.customerPhone}</p>

                  <a
                    href={getWhatsAppLink(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-serif tracking-wider uppercase text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xs transition-colors"
                  >
                    <MessageCircle size={14} /> WhatsApp Chat
                  </a>
                </div>

                <div className="border border-gray-200 rounded-xs p-4 bg-[#FAF8F5]/40">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-2">
                    Shipping Address
                  </span>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {selectedOrder.shippingAddress.addressLine1}
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <>, {selectedOrder.shippingAddress.addressLine2}</>
                    )}
                    <br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                    <span className="font-mono font-medium">{selectedOrder.shippingAddress.pincode}</span>
                    <br />
                    {selectedOrder.shippingAddress.country || "India"}
                  </p>
                </div>
              </div>

              {/* Order Notes from Customer */}
              {selectedOrder.orderNotes && (
                <div className="border border-amber-200 bg-amber-50/60 p-4 rounded-xs text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 block mb-1 font-semibold">
                    Customer Note / Instructions:
                  </span>
                  <p className="text-amber-900 italic font-serif">&ldquo;{selectedOrder.orderNotes}&rdquo;</p>
                </div>
              )}

              {/* Ordered Items Breakdown */}
              <div className="border border-gray-200 rounded-xs overflow-hidden">
                <div className="bg-[#FAF8F5] px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-gray-600 font-medium">
                    Order Items ({selectedOrder.items.length})
                  </span>
                  <span className="text-xs font-serif font-medium text-gray-900">
                    Total: ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-4 flex gap-4 items-center">
                      <div className="w-16 h-20 bg-gray-100 rounded-xs border border-gray-200 shrink-0 overflow-hidden">
                        {item.productImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag size={20} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-garamond text-base font-medium text-gray-900 truncate">
                          {item.productName}
                        </p>
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                          {item.size && (
                            <p>
                              Size: <span className="font-medium text-gray-800">{item.size}</span>
                            </p>
                          )}
                          {item.silhouette && (
                            <p>
                              Fit: <span className="font-medium text-gray-800">{item.silhouette}</span>
                            </p>
                          )}
                          {item.color && (
                            <p>
                              Color: <span className="font-medium text-gray-800">{item.color}</span>
                            </p>
                          )}
                          {item.curatedDetails?.colorName && (
                            <p className="flex items-center gap-1.5">
                              Linen Swatch:
                              {item.curatedDetails.colorImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.curatedDetails.colorImage}
                                  alt=""
                                  className="w-3.5 h-3.5 rounded-full object-cover border border-gray-300 inline-block"
                                />
                              ) : item.curatedDetails.colorHex ? (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block"
                                  style={{ backgroundColor: item.curatedDetails.colorHex }}
                                />
                              ) : null}
                              <span className="font-medium text-gray-800">{item.curatedDetails.colorName}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        <p className="font-serif font-medium text-sm text-gray-900 mt-0.5">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Workflow */}
              <div className="border border-gray-200 rounded-xs p-5 bg-[#FAF8F5]/30 space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500 block">
                  Status Transition Workflow
                </span>

                <div className="flex flex-wrap gap-2.5">
                  {(ALLOWED_TRANSITIONS[selectedOrder.status] || []).map((target) => {
                    const isCancel = target === "CANCELLED";
                    return (
                      <button
                        key={target}
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          if (isCancel) {
                            const isPaid = selectedOrder.paymentStatus === "PAID";
                            if (isPaid) {
                              const refund = confirm(
                                "This order is PAID. Do you want to mark the payment as REFUNDED along with cancellation?"
                              );
                              handleUpdateStatus(target, { markRefunded: refund });
                              return;
                            }
                            if (confirm("Are you sure you want to cancel this order?")) {
                              handleUpdateStatus(target);
                            }
                            return;
                          }
                          handleUpdateStatus(target);
                        }}
                        className={`px-4 py-2 text-xs font-serif tracking-widest uppercase transition-all shadow-2xs rounded-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                          isCancel
                            ? "border border-rose-300 text-rose-700 bg-white hover:bg-rose-50"
                            : "border border-gray-900 bg-gray-900 text-white hover:bg-black font-medium"
                        }`}
                      >
                        {isUpdating && <RefreshCw size={12} className="animate-spin" />}
                        <span>Move to {ORDER_STATUS_CONFIG[target]?.label || target}</span>
                      </button>
                    );
                  })}

                  {(ALLOWED_TRANSITIONS[selectedOrder.status] || []).length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      This order is in a terminal state ({selectedOrder.status}). No further transitions allowed.
                    </p>
                  )}
                </div>

                {/* Dispatch / Shipping Fields */}
                <div className="pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-gray-500 uppercase block mb-1">
                      Courier / Delivery Partner
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BlueDart, Delhivery, DTDC"
                      value={courierInput}
                      onChange={(e) => setCourierInput(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xs bg-white focus:outline-none focus:border-[#79A7D3]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-gray-500 uppercase block mb-1">
                      Tracking Number / AWB
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567890"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xs bg-white focus:outline-none focus:border-[#79A7D3]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Status Manual Controls */}
              <div className="border border-gray-200 rounded-xs p-5 bg-[#FAF8F5]/30">
                <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500 block mb-3">
                  Payment Status Verification
                </span>
                <div className="flex gap-2">
                  {(["PENDING", "PAID", "REFUNDED"] as const).map((ps) => {
                    const isCurrent = selectedOrder.paymentStatus === ps;
                    return (
                      <button
                        key={ps}
                        type="button"
                        disabled={isUpdating || isCurrent}
                        onClick={() => handleUpdatePaymentStatus(ps)}
                        className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider rounded-xs border transition-colors ${
                          isCurrent
                            ? "bg-gray-800 text-white border-gray-800 font-bold"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        {ps}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="border border-gray-200 rounded-xs p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500">
                    Internal Admin Notes (Private)
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isUpdating}
                    className="px-3 py-1 text-xs font-serif tracking-widest uppercase bg-gray-900 text-white hover:bg-black rounded-xs transition-colors shadow-2xs"
                  >
                    Save Notes
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Record customer preferences, dispatch timeline, or special fabric tailoring notes..."
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  className="w-full text-xs p-3 border border-gray-200 rounded-xs focus:outline-none focus:border-[#79A7D3] bg-[#FAF8F5]/40 leading-relaxed"
                />
              </div>
            </div>

            {/* Drawer Sticky Footer */}
            <div className="p-4 border-t border-gray-200 bg-[#FAF8F5] flex justify-between items-center">
              <span className="text-xs text-gray-500 font-mono">
                Order Reference: <strong className="text-gray-800">{selectedOrder.orderNumber}</strong>
              </span>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="px-5 py-2 text-xs font-serif tracking-widest uppercase border border-gray-300 bg-white hover:bg-gray-50 rounded-xs transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
