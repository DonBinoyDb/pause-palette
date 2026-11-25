"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShop } from "@/context/ShopContext";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, MessageCircle, AlertCircle, Check, Plus, MapPin, RefreshCw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { INDIAN_STATES, STANDARD_ADDRESS_LABELS } from "@/lib/constants";

interface SavedAddress {
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

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useShop();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Generated once per checkout visit; stable across retries to prevent duplicate orders
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );

  const [whatsappNumber, setWhatsappNumber] = useState("917907629021");

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  // Save to profile state (when creating a new address during checkout)
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [saveLabel, setSaveLabel] = useState<string>("Home");
  const [customSaveLabel, setCustomSaveLabel] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Kerala",
    pincode: "",
    country: "India",
    orderNotes: "",
  });

  const [hasManuallyEditedEmail, setHasManuallyEditedEmail] = useState(false);
  const [hasManuallyEditedName, setHasManuallyEditedName] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  // Fetch user's saved addresses when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserAddresses();
    }
  }, [status]);

  const fetchUserAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/user/addresses");
      if (res.ok) {
        const data: SavedAddress[] = await res.json();
        setSavedAddresses(Array.isArray(data) ? data : []);

        if (Array.isArray(data) && data.length > 0) {
          // Keep new address form first by default as requested
          setSelectedAddressId("new");
        } else {
          setSelectedAddressId("new");
        }
      }
    } catch (error) {
      console.error("Failed to fetch saved addresses", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const applyAddressToForm = (addr: SavedAddress) => {
    setFormData((prev) => ({
      ...prev,
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || "India",
    }));

    // Clear address-related validation errors
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.addressLine1;
      delete updated.city;
      delete updated.state;
      delete updated.pincode;
      delete updated.phone;
      return updated;
    });
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    applyAddressToForm(addr);
  };

  const selectedSavedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

  const handleSelectNewAddress = () => {
    setSelectedAddressId("new");
    setFormData((prev) => ({
      ...prev,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "Kerala",
      pincode: "",
    }));
  };

  // 1. Initial load of saved address details and prompt getSession call
  useEffect(() => {
    const savedInfoStr = typeof window !== "undefined" ? localStorage.getItem("pause_palette_shipping_details") : null;
    if (savedInfoStr && selectedAddressId === "new") {
      try {
        const saved = JSON.parse(savedInfoStr);
        setFormData((prev) => ({
          ...prev,
          addressLine1: saved.addressLine1 || prev.addressLine1,
          addressLine2: saved.addressLine2 || prev.addressLine2,
          city: saved.city || prev.city,
          state: saved.state || prev.state,
          pincode: saved.pincode || prev.pincode,
          country: saved.country || prev.country,
          phone: saved.phone || prev.phone,
          fullName: prev.fullName || saved.fullName || "",
        }));
      } catch {
        // ignore
      }
    }

    // Fast-path session fetch from server cookie
    getSession().then((sess) => {
      if (sess?.user?.email) {
        setFormData((prev) => ({
          ...prev,
          email: prev.email && hasManuallyEditedEmail ? prev.email : (sess.user?.email || prev.email),
          fullName: prev.fullName && hasManuallyEditedName ? prev.fullName : (sess.user?.name || prev.fullName),
        }));
      }
    });
  }, [hasManuallyEditedEmail, hasManuallyEditedName, selectedAddressId]);

  // 2. React to active session updates: autofill logged-in email first
  useEffect(() => {
    if (session?.user?.email && !hasManuallyEditedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: session?.user?.email || "",
      }));
    }
    if (session?.user?.name && !hasManuallyEditedName && selectedAddressId === "new") {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || session?.user?.name || "",
      }));
    }
  }, [session?.user?.email, session?.user?.name, hasManuallyEditedEmail, hasManuallyEditedName, selectedAddressId]);

  // Fetch official WhatsApp number
  useEffect(() => {
    fetch("/api/settings/contact")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.whatsappNumber) {
          const digits = data.whatsappNumber.replace(/\D/g, "");
          if (digits) setWhatsappNumber(digits);
        }
      })
      .catch(() => { });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setHasManuallyEditedEmail(true);
    }
    if (name === "fullName") {
      setHasManuallyEditedName(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your contact phone / WhatsApp number";
    } else if (cleanPhone.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Please enter your delivery street address";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city";
    }

    if (!formData.state.trim()) {
      newErrors.state = "Please select your state";
    }

    const cleanPin = formData.pincode.replace(/\D/g, "");
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Please enter your PIN code";
    } else if (cleanPin.length < 6) {
      newErrors.pincode = "Please enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.querySelector(`[name="${firstErrorKey}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    // Save shipping details to local storage
    try {
      localStorage.setItem("pause_palette_shipping_details", JSON.stringify(formData));
    } catch {
      // ignore
    }

    // If new address was entered and user checked "Save to profile", save with de-duplication
    if (selectedAddressId === "new" && saveToProfile && session?.user) {
      const finalLabel = saveLabel === "Other" ? (customSaveLabel.trim() || "Other") : saveLabel;
      fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: finalLabel,
          fullName: formData.fullName.trim(),
          phone: formData.phone.replace(/\D/g, ""),
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2?.trim() || null,
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.replace(/\D/g, ""),
          country: formData.country || "India",
          deduplicate: true,
        }),
      }).catch((e) => console.error("Auto-save address error", e));
    }

    try {
      const orderPayload = {
        customerName: formData.fullName.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        shippingAddress: {
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2?.trim() || null,
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.replace(/\D/g, ""),
          country: formData.country || "India",
        },
        orderNotes: formData.orderNotes?.trim() || null,
        idempotencyKey: idempotencyKeyRef.current,
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          size: item.size || null,
          silhouette: item.silhouette || null,
          color: item.color || null,
          curatedDetails: item.curatedDetails || null,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to place order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Order created successfully: clear cart and redirect to success receipt
      await clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order-success/${data.order.orderNumber}`);
    } catch (err) {
      console.error("Order submit network error:", err);
      toast.error("Network error while submitting order. Please retry.");
      setIsSubmitting(false);
    }
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="flex min-h-screen flex-col bg-[#F9F8F6]">
      <Navbar variant="dark" />

      <div className="pt-28 md:pt-36 pb-20 px-4 sm:px-8 md:px-12 lg:px-16 container mx-auto w-full max-w-[1300px] flex-1">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 border-b border-[#E8E6E1] pb-5 gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-garamond text-3xl sm:text-4xl text-[#2C2B29] tracking-tight">
                Shipping & Checkout
              </h1>
              <span className="text-[11px] font-sans font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFECE6] text-[#5C5A58]">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </span>
            </div>
            <p className="text-[#8B8985] text-[11px] tracking-[0.18em] uppercase mt-1">
              Enter your delivery details to complete your order via WhatsApp
            </p>
          </div>
          <Link
            href="/cart"
            className="group inline-flex items-center gap-2 text-[11px] tracking-[0.16em] uppercase text-[#8B8985] hover:text-[#2C2B29] transition-colors"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
            <span>Return to Bag</span>
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-garamond text-2xl text-[#2C2B29] mb-3">Your bag is currently empty.</p>
            <p className="text-sm text-[#787673] mb-8 font-serif italic">
              Explore our collections to add thoughtful handcrafted pieces to your bag.
            </p>
            <Link
              href="/collections"
              className="px-8 py-3.5 bg-[#2C2B29] text-white hover:bg-black text-xs tracking-[0.2em] uppercase font-medium transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left Column: Checkout Form */}
            <div className="flex-1 w-full space-y-6">
              <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }} className="space-y-6">

                {/* 1. Contact Information */}
                <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E6E1]/90 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#F0EEEB]">
                    <h2 className="text-xs tracking-[0.2em] uppercase font-semibold text-[#2C2B29]">
                      1. Contact Information
                    </h2>
                    {session?.user && (
                      <span className="text-[10px] text-[#4E7185] bg-[#EAF0F6] px-2 py-0.5 rounded-xs tracking-wider uppercase font-medium">
                        Logged in as {session.user.name || session.user.email}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Email Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] tracking-wider uppercase text-[#5C5A58] font-medium mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        placeholder="yourname@example.com"
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${errors.email
                          ? "border-red-400 focus:border-red-500 bg-red-50/20"
                          : "border-[#D6D3CD] focus:border-[#2C2B29]"
                          }`}
                      />
                      {errors.email ? (
                        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle size={12} /> {errors.email}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#8B8985] mt-1 font-sans">
                          Order confirmations and dispatch updates will be sent to this email.
                        </p>
                      )}
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] tracking-wider uppercase text-[#5C5A58] font-medium mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName || ""}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${errors.fullName
                          ? "border-red-400 focus:border-red-500 bg-red-50/20"
                          : "border-[#D6D3CD] focus:border-[#2C2B29]"
                          }`}
                      />
                      {errors.fullName && (
                        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle size={12} /> {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* WhatsApp / Contact Phone */}
                    <div>
                      <label className="block text-[11px] tracking-wider uppercase text-[#5C5A58] font-medium mb-1.5">
                        Phone / WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${errors.phone
                          ? "border-red-400 focus:border-red-500 bg-red-50/20"
                          : "border-[#D6D3CD] focus:border-[#2C2B29]"
                          }`}
                      />
                      {errors.phone ? (
                        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                          <AlertCircle size={12} /> {errors.phone}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#8B8985] mt-1 font-sans">
                          For order coordination and shipping updates.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Shipping Address */}
                <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E6E1]/90 shadow-2xs">
                  <div className="pb-3 mb-5 border-b border-[#F0EEEB]">
                    <h2 className="text-xs tracking-[0.2em] uppercase font-semibold text-[#2C2B29]">
                      2. Delivery & Shipping Address
                    </h2>
                  </div>

                  {/* Saved Address Names Quick Selector (only names shown) */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-6 pb-4 border-b border-[#F0EEEB]">
                      <span className="block text-[10px] tracking-[0.2em] uppercase text-[#787673] font-medium mb-2.5">
                        Saved Addresses:
                      </span>

                      {/* Horizontally scrollable row for any number of addresses */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <button
                          type="button"
                          onClick={handleSelectNewAddress}
                          className={`shrink-0 px-3 py-1.5 text-xs tracking-[0.14em] uppercase transition-all rounded-xs border flex items-center gap-1.5 ${selectedAddressId === "new"
                            ? "border-[#2C2B29] bg-[#2C2B29] text-white font-medium shadow-2xs"
                            : "border-[#E8E6E1] text-[#5C5A58] hover:border-[#2C2B29] bg-white"
                            }`}
                        >
                          <Plus size={11} strokeWidth={2} />
                          <span>New Address</span>
                        </button>

                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  handleSelectNewAddress();
                                } else {
                                  handleSelectSavedAddress(addr);
                                }
                              }}
                              className={`shrink-0 px-3.5 py-1.5 text-xs tracking-[0.14em] uppercase transition-all rounded-xs border flex items-center gap-1.5 ${isSelected
                                ? "border-[#2C2B29] bg-[#2C2B29] text-white font-medium shadow-2xs"
                                : "border-[#E8E6E1] text-[#5C5A58] hover:border-[#2C2B29] bg-white"
                                }`}
                            >
                              <span>{addr.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* On clicking a saved address name, the whole address is shown */}
                  {selectedSavedAddress && (
                    <div className="p-5 border border-[#2C2B29] bg-[#FAF9F6] rounded-xs space-y-3 mb-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-[#EAE8E4] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-[#2C2B29]">
                            {selectedSavedAddress.label}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleSelectNewAddress}
                          className="text-[11px] tracking-[0.12em] uppercase text-[#787673] hover:text-[#2C2B29] transition-colors underline underline-offset-4"
                        >
                          + Enter new address
                        </button>
                      </div>

                      <div>
                        <p className="font-garamond text-[17px] font-medium text-[#2C2B29] leading-tight">
                          {selectedSavedAddress.fullName}
                        </p>
                        <p className="text-xs text-[#787673] font-sans mt-0.5">
                          +91 {selectedSavedAddress.phone}
                        </p>
                        <p className="text-xs text-[#5C5A58] mt-2 leading-relaxed font-light">
                          {selectedSavedAddress.addressLine1}
                          {selectedSavedAddress.addressLine2 ? `, ${selectedSavedAddress.addressLine2}` : ""}
                          <br />
                          {selectedSavedAddress.city}, {selectedSavedAddress.state} – {selectedSavedAddress.pincode}
                        </p>
                        <p className="text-[11px] tracking-wider uppercase text-[#8C8882] mt-1 font-light">
                          {selectedSavedAddress.country || "India"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Manual / New Address Form Fields (shown first by default) */}
                  {(selectedAddressId === "new" || savedAddresses.length === 0) && (
                    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">

                      {/* Address Line 1 */}
                      <div>
                        <label className="block text-[11px] tracking-wider uppercase text-[#5C5A58] font-medium mb-1.5">
                          Street Address / House / Flat No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={formData.addressLine1 || ""}
                          onChange={handleChange}
                          placeholder="e.g. Flat 4B, Harmony Apartments, 5th Cross Road"
                          className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${errors.addressLine1
                            ? "border-red-400 focus:border-red-500 bg-red-50/20"
                            : "border-[#D6D3CD] focus:border-[#2C2B29]"
                            }`}
                        />
                        {errors.addressLine1 && (
                          <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                            <AlertCircle size={12} /> {errors.addressLine1}
                          </p>
                        )}
                      </div>

                      {/* Address Line 2 */}
                      <div>
                        <label className="block text-[11px] tracking-wider uppercase text-[#5C5A58] font-medium mb-1.5">
                          Apartment, Suite, Landmark <span className="text-[#8B8985] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={formData.addressLine2 || ""}
                          onChange={handleChange}
                          placeholder="e.g. Near City Center Library, 2nd floor"
                          className="w-full px-3.5 py-2.5 text-sm rounded-xs border border-[#D6D3CD] focus:border-[#2C2B29] transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none"
                        />
                      </div>

                      {/* City, State, PIN */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* City */}
                        <div>
                          <label className="block text-[11px] tracking-wider uppercase text-[#5C5A58] font-medium mb-1.5">
                            City / Town <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city || ""}
                            onChange={handleChange}
                            placeholder="e.g. Kochi"
                            className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${errors.city
                              ? "border-red-400 focus:border-red-500 bg-red-50/20"
                              : "border-[#D6D3CD] focus:border-[#2C2B29]"
                              }`}
                          />
                          {errors.city && (
                            <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                              <AlertCircle size={12} /> {errors.city}
                            </p>
                          )}
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-[11px] tracking-wider uppercase text-[#5C5A58] font-medium mb-1.5">
                            State <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="state"
                            value={formData.state || "Kerala"}
                            onChange={handleChange}
                            className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium focus:outline-none ${errors.state
                              ? "border-red-400 focus:border-red-500 bg-red-50/20"
                              : "border-[#D6D3CD] focus:border-[#2C2B29]"
                              }`}
                          >
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          {errors.state && (
                            <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                              <AlertCircle size={12} /> {errors.state}
                            </p>
                          )}
                        </div>

                        {/* PIN Code */}
                        <div>
                          <label className="block text-[11px] tracking-wider uppercase text-[#5C5A58] font-medium mb-1.5">
                            PIN Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            maxLength={6}
                            value={formData.pincode || ""}
                            onChange={handleChange}
                            placeholder="e.g. 682001"
                            className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${errors.pincode
                              ? "border-red-400 focus:border-red-500 bg-red-50/20"
                              : "border-[#D6D3CD] focus:border-[#2C2B29]"
                              }`}
                          />
                          {errors.pincode && (
                            <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
                              <AlertCircle size={12} /> {errors.pincode}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Country (Default India) */}
                      <div>
                        <label className="block text-[11px] tracking-wider uppercase text-[#5C5A58] font-medium mb-1.5">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country || "India"}
                          disabled
                          className="w-full px-3.5 py-2.5 text-sm rounded-xs border border-[#E8E6E1] bg-[#F7F6F4] text-[#5C5A58] cursor-not-allowed"
                        />
                      </div>

                      {/* Save to Profile Option */}
                      {session?.user && (
                        <div className="pt-3 border-t border-[#F0EEEB] space-y-3">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={saveToProfile}
                              onChange={(e) => setSaveToProfile(e.target.checked)}
                              className="w-4 h-4 accent-[#2C2B29] rounded-xs cursor-pointer"
                            />
                            <span className="text-xs text-[#2C2B29] font-medium">
                              Save this address to my profile for future orders
                            </span>
                          </label>

                          {saveToProfile && (
                            <div className="pl-6 space-y-2">
                              <span className="block text-[10px] tracking-wider uppercase text-[#8B8985]">
                                Label this address as:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {STANDARD_ADDRESS_LABELS.map((lbl) => (
                                  <button
                                    key={lbl}
                                    type="button"
                                    onClick={() => setSaveLabel(lbl)}
                                    className={`px-3 py-1.5 text-xs tracking-wider uppercase border rounded-xs transition-colors ${saveLabel === lbl
                                      ? "border-[#2C2B29] bg-[#2C2B29] text-white font-medium"
                                      : "border-[#D6D3CD] text-[#5C5A58] hover:border-[#2C2B29] bg-white"
                                      }`}
                                  >
                                    {lbl}
                                  </button>
                                ))}
                              </div>

                              {saveLabel === "Other" && (
                                <input
                                  type="text"
                                  placeholder="e.g. Studio, Vacation Home"
                                  value={customSaveLabel}
                                  onChange={(e) => setCustomSaveLabel(e.target.value)}
                                  className="w-full max-w-xs px-3 py-1.5 text-xs border border-[#D6D3CD] focus:border-[#2C2B29] rounded-xs bg-white text-[#2C2B29] outline-none"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Order Notes & Special Instructions */}
                <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E6E1]/90 shadow-2xs">
                  <h2 className="text-xs tracking-[0.2em] uppercase font-semibold text-[#2C2B29] mb-2">
                    3. Order Notes & Custom Instructions <span className="text-[#8B8985] font-normal">(Optional)</span>
                  </h2>
                  <p className="text-[11px] text-[#8B8985] mb-4">
                    Have any specific requests regarding sizing, delivery timing, or gift packaging? Let us know below.
                  </p>
                  <textarea
                    name="orderNotes"
                    rows={3}
                    value={formData.orderNotes || ""}
                    onChange={handleChange}
                    placeholder="e.g. Please add a handwritten gift note wishing Happy Birthday, or preferred weekend delivery..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xs border border-[#D6D3CD] focus:border-[#2C2B29] transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none resize-y"
                  />
                </div>
              </form>
            </div>

            {/* Right Column: Order Summary & Place Order */}
            <div className="w-full lg:w-[400px] xl:w-[440px] shrink-0 sticky top-28 md:top-36">
              <div className="bg-[#F2F0ED] p-5 sm:p-7 rounded-sm border border-[#E8E6E1]/90 space-y-6">
                <div>
                  <h2 className="text-[11px] tracking-[0.2em] uppercase font-semibold text-[#8B8985] mb-4">
                    Order Summary ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
                  </h2>

                  {/* Scrollable Items List */}
                  <div className="divide-y divide-[#E0DED9] max-h-72 overflow-y-auto pr-1 [scrollbar-width:thin]">
                    {cart.map((item) => (
                      <div key={item.id} className="py-3 flex gap-3 items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-13 aspect-[3/4] object-cover bg-white rounded-2xs border border-[#E0DED9]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm text-[#2C2B29] truncate">{item.name}</p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#6B6864] mt-0.5">
                            <span>Size: <strong className="text-[#2C2B29]">{item.size}</strong></span>
                            {item.color && (
                              <>
                                <span>•</span>
                                <span className="text-[#4E7185] bg-[#EAF0F6] px-1 py-0.2 rounded-2xs font-semibold">
                                  {item.color}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right font-garamond text-sm font-medium text-[#2C2B29] shrink-0">
                          ₹ {(item.price * item.quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-[#E0DED9] pt-4 space-y-2.5 text-xs text-[#5C5A58]">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="font-garamond text-sm text-[#2C2B29] font-medium">
                      ₹ {cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span className="text-[11px] text-[#4E7185] font-medium">Complimentary</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#E0DED9]">
                    <span className="text-xs tracking-wider uppercase font-semibold text-[#2C2B29]">
                      Total
                    </span>
                    <span className="font-garamond text-2xl text-[#2C2B29] font-medium">
                      ₹ {cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full group bg-[#79A7D3] hover:bg-[#6895C2] text-white py-3.5 px-5 flex items-center justify-between transition-all duration-300 rounded-xs shadow-xs disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    {isSubmitting ? (
                      <RefreshCw size={16} className="animate-spin text-white" />
                    ) : (
                      <MessageCircle size={16} className="text-white" />
                    )}
                    <span className="text-xs tracking-[0.16em] uppercase font-semibold">
                      {isSubmitting ? "Securing & Placing Order..." : "Complete Order on WhatsApp"}
                    </span>
                  </div>
                  {!isSubmitting && (
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                  )}
                </button>

                {/* Assurance details */}
                <div className="space-y-2 pt-2 border-t border-[#E0DED9]/70 text-[11px] text-[#787673]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#4E7185] shrink-0" />
                    <span>Personalized coordination with the studio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-[#4E7185] shrink-0" />
                    <span>Dispatches in 12–15 business days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
