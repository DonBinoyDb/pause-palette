"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { Plus, Edit2, Trash2, Check, MapPin, X, Package, ShoppingBag, MessageCircle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { INDIAN_STATES, STANDARD_ADDRESS_LABELS } from "@/lib/constants";
import { ORDER_STATUS_CONFIG, OrderStatusType, normalizeIndianPhone } from "@/lib/orderHelpers";

const CUSTOMER_STATUS_CONFIG: Record<
  string,
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

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { clearData } = useShop();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "account">("orders");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("917907629021");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  // Form state
  const [selectedLabel, setSelectedLabel] = useState<string>("Home");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Kerala");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (tab === "orders" || tab === "addresses" || tab === "account") {
        setActiveTab(tab as any);
      }
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/user/orders", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUserOrders(Array.isArray(data.orders) ? data.orders : []);
      }
    } catch (error) {
      console.error("Failed to load user orders", error);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAddresses();
      fetchOrders();
      fetch("/api/settings/contact")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.whatsappNumber) setWhatsappNumber(normalizeIndianPhone(data.whatsappNumber));
        })
        .catch(() => { });
    }
  }, [status, fetchOrders]);

  // Re-fetch orders when user switches to the orders tab
  useEffect(() => {
    if (activeTab === "orders" && status === "authenticated") {
      fetchOrders();
    }
  }, [activeTab, status, fetchOrders]);

  // Re-fetch orders when window gains focus (e.g. after admin updates status in another tab)
  useEffect(() => {
    if (status !== "authenticated") return;
    const onFocus = () => fetchOrders();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [status, fetchOrders]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to load addresses", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSignOut = async () => {
    clearData();
    try {
      await signOut({ redirect: false });
    } finally {
      window.location.href = "/";
    }
  };

  const openAddModal = () => {
    setEditingAddressId(null);
    setSelectedLabel("Home");
    setCustomLabel("");
    setFullName(session?.user?.name || "");
    setPhone("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setState("Kerala");
    setPincode("");
    setIsDefault(addresses.length === 0);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddressId(addr.id);
    if (STANDARD_ADDRESS_LABELS.includes(addr.label as any)) {
      setSelectedLabel(addr.label);
      setCustomLabel("");
    } else {
      setSelectedLabel("Other");
      setCustomLabel(addr.label);
    }
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || "");
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setIsDefault(addr.isDefault);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = "Valid 10-digit phone number is required";
    }

    if (!addressLine1.trim()) errors.addressLine1 = "Street address is required";
    if (!city.trim()) errors.city = "City is required";
    if (!state.trim()) errors.state = "State is required";

    const cleanPin = pincode.replace(/\D/g, "");
    if (!cleanPin || cleanPin.length < 6) {
      errors.pincode = "Valid 6-digit PIN code is required";
    }

    if (selectedLabel === "Other" && !customLabel.trim()) {
      errors.customLabel = "Please enter an address label";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    setSavingAddress(true);
    const finalLabel = selectedLabel === "Other" ? (customLabel.trim() || "Other") : selectedLabel;

    const payload = {
      label: finalLabel,
      fullName: fullName.trim(),
      phone: phone.replace(/\D/g, ""),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || null,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.replace(/\D/g, ""),
      country: "India",
      isDefault,
    };

    try {
      const url = editingAddressId
        ? `/api/user/addresses/${editingAddressId}`
        : "/api/user/addresses";
      const method = editingAddressId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingAddressId ? "Address updated successfully" : "Address added successfully");
        setIsModalOpen(false);
        fetchAddresses();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to save address");
      }
    } catch (error) {
      console.error("Save address failed", error);
      toast.error("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}/default`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.success("Default address updated");
        fetchAddresses();
      } else {
        toast.error("Failed to update default address");
      }
    } catch (error) {
      console.error("Set default address error", error);
      toast.error("Failed to update default address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      } else {
        toast.error("Failed to delete address");
      }
    } catch (error) {
      console.error("Delete address error", error);
      toast.error("Failed to delete address");
    }
  };

  if (status === "loading" || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="font-serif text-gray-400 tracking-widest text-sm uppercase">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar variant="dark" />

      <div className="pt-40 pb-32 px-6 sm:px-10 md:px-20 container mx-auto w-full max-w-[1400px] flex-1">

        {/* Header */}
        <div className="mb-16 md:mb-20 text-center">
          <h1 className="font-garamond text-3xl md:text-4xl text-gray-900 tracking-wide mb-3">
            My Account
          </h1>
          <p className="text-gray-500 italic text-sm font-garamond">
            Welcome back, {session.user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="sticky top-32 space-y-8">
              <nav className="flex flex-col gap-6">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`text-left text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-between ${activeTab === "orders"
                    ? "text-gray-900 font-medium"
                    : "text-gray-400 hover:text-gray-900"
                    }`}
                >
                  <span>Order History</span>
                  {userOrders.length > 0 && (
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                      {userOrders.length}
                    </span>
                  )}
                </button>
                <Link
                  href="/saved"
                  className="text-left text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Saved Items
                </Link>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`text-left text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-between ${activeTab === "addresses"
                    ? "text-gray-900 font-medium"
                    : "text-gray-400 hover:text-gray-900"
                    }`}
                >
                  <span>Saved Addresses</span>
                  {addresses.length > 0 && (
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono">
                      {addresses.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("account")}
                  className={`text-left text-xs tracking-[0.15em] uppercase transition-colors ${activeTab === "account"
                    ? "text-gray-900 font-medium"
                    : "text-gray-400 hover:text-gray-900"
                    }`}
                >
                  Account Details
                </button>
              </nav>

              <div className="pt-8 border-t border-gray-100">
                <button
                  onClick={handleSignOut}
                  className="text-left text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 min-h-[500px]">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xs tracking-[0.2em] text-gray-900 uppercase font-medium">
                      Order History ({userOrders.length})
                    </h2>
                    <p className="text-xs text-gray-500 font-garamond italic mt-1">
                      View your ordered pieces, purchase dates, and tailoring status.
                    </p>
                  </div>
                  <Link
                    href="/shop/all"
                    className="text-xs tracking-[0.16em] uppercase text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Browse Collection
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="py-24 text-center">
                    <div className="w-8 h-8 border-2 border-[#79A7D3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-serif text-xs text-gray-400">Loading your orders...</p>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="py-24 text-center bg-white border border-gray-100 p-8 rounded-xs">
                    <Package size={28} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-serif italic text-base mb-4">You haven't placed any orders yet.</p>
                    <Link
                      href="/shop/all"
                      className="inline-block border-b border-gray-900 text-gray-900 text-xs tracking-[0.15em] uppercase pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors"
                    >
                      Explore Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userOrders.map((order: any) => {
                      const orderDate = new Date(order.createdAt);
                      const formattedDate = orderDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                      const formattedTime = orderDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });

                      const statusConfig = CUSTOMER_STATUS_CONFIG[order.status] || {
                        label: order.status || "Processing",
                        badgeClass: "bg-gray-50 text-gray-700 border-gray-200",
                        dotClass: "bg-gray-400",
                      };

                      return (
                        <div
                          key={order.id}
                          className="bg-white border border-gray-200 rounded-xs overflow-hidden shadow-2xs"
                        >
                          {/* Order Header: Order #, Date & Time, Total Price, Status */}
                          <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E8E6E1] flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                              <div>
                                <span className="font-sans text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#8B8985] block mb-1 font-semibold">
                                  Order Number
                                </span>
                                <span className="font-sans font-medium text-[14px] sm:text-[15px] text-[#2C2B29] tracking-wider">
                                  {order.orderNumber}
                                </span>
                              </div>

                              <div className="hidden sm:block w-px h-8 bg-[#E8E6E1]" />

                              <div>
                                <span className="font-sans text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#8B8985] block mb-1 font-semibold">
                                  Date & Time
                                </span>
                                <span className="font-sans text-[13px] sm:text-[14px] text-[#2C2B29]">
                                  {formattedDate} <span className="text-[#8B8985] text-xs">at {formattedTime}</span>
                                </span>
                              </div>

                              <div className="hidden sm:block w-px h-8 bg-[#E8E6E1]" />

                              <div>
                                <span className="font-sans text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#8B8985] block mb-1 font-semibold">
                                  Total Price
                                </span>
                                <span className="font-garamond font-medium text-[16px] sm:text-[18px] text-[#2C2B29]">
                                  ₹{order.totalAmount.toLocaleString("en-IN")}
                                </span>
                              </div>

                              <div className="hidden sm:block w-px h-8 bg-[#E8E6E1]" />

                              <div>
                                <span className="font-sans text-[10px] sm:text-[10.5px] uppercase tracking-[0.2em] text-[#8B8985] block mb-1 font-semibold">
                                  Status
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[10.5px] sm:text-[11px] font-sans uppercase tracking-[0.14em] font-semibold border ${statusConfig.badgeClass}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                                  <span>{statusConfig.label}</span>
                                </span>
                              </div>
                            </div>

                            {/* Receipt Button (Hidden for now, preserved for future enablement) */}
                            {/* <Link
                              href={`/receipt/${order.orderNumber}`}
                              className="text-[11px] tracking-[0.18em] uppercase border border-[#D6D3CD] hover:border-[#2C2B29] bg-white hover:bg-[#F8F6F2] text-[#2C2B29] px-4 py-2 transition-colors rounded-xs font-medium shadow-2xs"
                            >
                              Receipt
                            </Link> */}
                          </div>

                          {/* Items Ordered List */}
                          <div className="divide-y divide-[#F0EDE8] p-4 sm:p-6">
                            {order.items?.map((item: any) => {
                              const cleanSize = item.size?.trim();
                              const cleanFit = item.silhouette ? item.silhouette.replace(/-/g, " ").trim() : null;
                              const cleanColor = item.color?.trim();

                              return (
                                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 sm:gap-5 items-center">
                                  <div className="w-14 sm:w-16 h-18 sm:h-20 bg-[#FAF8F5] border border-[#E8E6E1] rounded-2xs overflow-hidden shrink-0">
                                    {item.productImage ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img
                                        src={item.productImage}
                                        alt={item.productName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ShoppingBag size={18} />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-serif text-[15px] sm:text-[17px] text-[#2C2B29] font-normal leading-snug truncate">
                                      {item.productName}
                                    </h3>

                                    {/* Specs matching storefront standard */}
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-[11.5px] tracking-wider uppercase text-[#8B8985] mt-1">
                                      {cleanSize && (
                                        <span>Size: <strong className="text-[#2C2B29] font-medium">{cleanSize}</strong></span>
                                      )}
                                      {cleanSize && (cleanFit || cleanColor) && (
                                        <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                                      )}
                                      {cleanFit && (
                                        <span>Fit: <strong className="text-[#2C2B29] font-medium">{cleanFit}</strong></span>
                                      )}
                                      {cleanFit && cleanColor && (
                                        <span className="w-1 h-1 rounded-full bg-[#D1CFCA]" />
                                      )}
                                      {cleanColor && (
                                        <span>Color: <strong className="text-[#2C2B29] font-medium">{cleanColor}</strong></span>
                                      )}
                                    </div>

                                    {/* Unit price and quantity indicator */}
                                    <p className="text-[11.5px] sm:text-[12px] text-[#8B8985] mt-1">
                                      Price: <span className="font-garamond text-[#2C2B29] font-medium">₹{item.price.toLocaleString("en-IN")}</span>
                                      {item.quantity > 1 ? ` x ${item.quantity}` : ""}
                                    </p>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <p className="text-[11px] sm:text-xs uppercase tracking-wider text-[#8B8985]">Qty: {item.quantity}</p>
                                    <p className="font-garamond font-medium text-[16px] sm:text-[17px] text-[#2C2B29] mt-0.5">
                                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* Saved Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-8 border-b border-gray-100 gap-4">
                  <div>
                    <h2 className="text-xs tracking-[0.2em] text-gray-900 uppercase font-medium">
                      Saved Addresses ({addresses.length})
                    </h2>
                    <p className="text-xs text-gray-500 font-garamond italic mt-1">
                      Manage your delivery destinations for quick and easy checkout.
                    </p>
                  </div>

                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C2B29] text-white hover:bg-black text-[11px] tracking-[0.15em] uppercase font-medium transition-colors rounded-none self-start sm:self-auto shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Add New Address</span>
                  </button>
                </div>

                {loadingAddresses ? (
                  <div className="py-20 text-center text-gray-400 font-garamond italic text-base">
                    Loading your saved addresses...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-gray-200 rounded-lg p-8">
                    <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-900 font-garamond text-lg mb-1">No saved addresses yet</p>
                    <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">
                      Save home, office, and other delivery addresses for effortless one-click checkout.
                    </p>
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-2.5 text-xs tracking-[0.15em] uppercase transition-colors"
                    >
                      <Plus size={14} />
                      <span>Add Your First Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`relative p-6 border transition-all flex flex-col justify-between ${addr.isDefault
                          ? "border-gray-900 bg-white shadow-xs"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                          }`}
                      >
                        {/* Top Header */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-gray-900">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[9px] tracking-[0.15em] uppercase text-gray-400 font-normal">
                                  • Default
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="font-garamond text-lg text-gray-900 font-medium leading-snug">
                            {addr.fullName}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono mt-0.5 mb-3">
                            +91 {addr.phone}
                          </p>

                          <div className="text-xs text-gray-600 leading-relaxed space-y-0.5 border-t border-gray-100 pt-3">
                            <p>{addr.addressLine1}</p>
                            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                            <p>{addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span></p>
                            <p className="text-gray-400 text-[11px] uppercase tracking-wider">{addr.country}</p>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-100 text-xs">
                          <div>
                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id)}
                                className="text-[11px] tracking-[0.1em] uppercase text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-4"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(addr)}
                              className="text-gray-400 hover:text-gray-900 transition-colors p-1"
                              title="Edit address"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              title="Delete address"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Account Details Tab */}
            {activeTab === "account" && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-xs tracking-[0.2em] text-gray-400 uppercase mb-12 border-b border-gray-100 pb-4">
                  Account Details
                </h2>

                <form className="max-w-2xl">
                  {/* Personal Info Section */}
                  <div className="space-y-10 mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-[0.15em] uppercase text-gray-400">First Name</label>
                        <input
                          type="text"
                          defaultValue={session.user?.name?.split(" ")[0] || ""}
                          className="w-full border-b border-gray-200 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors bg-transparent rounded-none placeholder-gray-300"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Last Name</label>
                        <input
                          type="text"
                          defaultValue={session.user?.name?.split(" ").slice(1).join(" ") || ""}
                          className="w-full border-b border-gray-200 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors bg-transparent rounded-none placeholder-gray-300"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91"
                        className="w-full border-b border-gray-200 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors bg-transparent rounded-none placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Account Security Section */}
                  <div className="space-y-10 mb-16">
                    <div className="flex flex-col gap-2 opacity-60">
                      <label className="text-[10px] tracking-[0.15em] uppercase text-gray-400">Email Address (Non-editable)</label>
                      <input
                        type="email"
                        defaultValue={session.user?.email || ""}
                        disabled
                        className="w-full border-b border-gray-200 py-3 text-sm text-gray-500 bg-transparent rounded-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <button type="button" className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-4 text-xs tracking-[0.15em] uppercase transition-colors">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-xl w-full border border-gray-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-garamond text-xl text-gray-900">
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </h3>
                <p className="text-[11px] tracking-[0.1em] uppercase text-gray-400 mt-0.5">
                  Delivery Destination
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-900 p-1.5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAddress} className="overflow-y-auto p-6 space-y-6">

              {/* Address Label Chips */}
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-2">
                  Address Label
                </label>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_ADDRESS_LABELS.map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setSelectedLabel(lbl)}
                      className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-all border ${selectedLabel === lbl
                        ? "border-gray-900 bg-gray-900 text-white font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
                        }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                {selectedLabel === "Other" && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="e.g. Studio, Vacation Home, Parent's House"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      className={`w-full border-b py-2 text-sm text-gray-900 focus:outline-none transition-colors ${formErrors.customLabel ? "border-red-400" : "border-gray-200 focus:border-gray-900"
                        }`}
                    />
                    {formErrors.customLabel && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.customLabel}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's name"
                    className={`w-full border-b py-2 text-sm text-gray-900 focus:outline-none transition-colors ${formErrors.fullName ? "border-red-400" : "border-gray-200 focus:border-gray-900"
                      }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-1">
                    Phone / WhatsApp (+91) *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full border-b py-2 text-sm text-gray-900 focus:outline-none transition-colors ${formErrors.phone ? "border-red-400" : "border-gray-200 focus:border-gray-900"
                      }`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Street Address Line 1 */}
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-1">
                  Street Address Line 1 *
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House / Flat no., Building, Street"
                  className={`w-full border-b py-2 text-sm text-gray-900 focus:outline-none transition-colors ${formErrors.addressLine1 ? "border-red-400" : "border-gray-200 focus:border-gray-900"
                    }`}
                />
                {formErrors.addressLine1 && (
                  <p className="text-[11px] text-red-500 mt-1">{formErrors.addressLine1}</p>
                )}
              </div>

              {/* Street Address Line 2 */}
              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-1">
                  Street Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, suite, landmark, locality"
                  className="w-full border-b border-gray-200 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                />
              </div>

              {/* City, State, PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className={`w-full border-b py-2 text-sm text-gray-900 focus:outline-none transition-colors ${formErrors.city ? "border-red-400" : "border-gray-200 focus:border-gray-900"
                      }`}
                  />
                  {formErrors.city && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border-b border-gray-200 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors bg-white cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="6-digit PIN"
                    maxLength={6}
                    className={`w-full border-b py-2 text-sm text-gray-900 focus:outline-none transition-colors ${formErrors.pincode ? "border-red-400" : "border-gray-200 focus:border-gray-900"
                      }`}
                  />
                  {formErrors.pincode && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.pincode}</p>
                  )}
                </div>
              </div>

              {/* Set as Default Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 accent-gray-900 rounded-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-700">
                    Set as default delivery address
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-xs tracking-[0.15em] uppercase text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-8 py-2.5 bg-gray-900 text-white hover:bg-black text-xs tracking-[0.15em] uppercase font-medium transition-colors disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : editingAddressId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
