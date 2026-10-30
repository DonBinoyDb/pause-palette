"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShop } from "@/context/ShopContext";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, MessageCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

export default function CheckoutPage() {
  const { cart, cartTotal } = useShop();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [whatsappNumber, setWhatsappNumber] = useState("917907629021");

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

  // 1. Initial load of saved address details and prompt getSession call
  useEffect(() => {
    const savedInfoStr = typeof window !== "undefined" ? localStorage.getItem("pause_palette_shipping_details") : null;
    if (savedInfoStr) {
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
  }, [hasManuallyEditedEmail, hasManuallyEditedName]);

  // 2. React to active session updates: autofill logged-in email first
  useEffect(() => {
    if (session?.user?.email && !hasManuallyEditedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: session?.user?.email || "",
      }));
    }
    if (session?.user?.name && !hasManuallyEditedName) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || session?.user?.name || "",
      }));
    }
  }, [session?.user?.email, session?.user?.name, hasManuallyEditedEmail, hasManuallyEditedName]);

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
      .catch(() => {});
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
    } else if (cleanPin.length !== 6) {
      newErrors.pincode = "Please enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your bag is empty");
      router.push("/collections");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    setIsSubmitting(true);

    // Save shipping details for future visits
    try {
      localStorage.setItem("pause_palette_shipping_details", JSON.stringify(formData));
    } catch {
      // ignore
    }

    const phoneNumber = whatsappNumber || "917907629021";
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    let message = "✨ *NEW ORDER REQUEST - PAUSE PALETTE* ✨\n\n";

    message += "👤 *CUSTOMER & CONTACT DETAILS*\n";
    message += `• *Name:* ${formData.fullName.trim()}\n`;
    message += `• *Email:* ${formData.email.trim()}\n`;
    message += `• *Phone / WhatsApp:* ${formData.phone.trim()}\n\n`;

    message += "📍 *SHIPPING ADDRESS*\n";
    message += `• *Address:* ${formData.addressLine1.trim()}\n`;
    if (formData.addressLine2.trim()) {
      message += `• *Apartment / Landmark:* ${formData.addressLine2.trim()}\n`;
    }
    message += `• *City:* ${formData.city.trim()}\n`;
    message += `• *State:* ${formData.state.trim()}\n`;
    message += `• *PIN Code:* ${formData.pincode.trim()}\n`;
    message += `• *Country:* ${formData.country || "India"}\n\n`;

    if (formData.orderNotes.trim()) {
      message += `📝 *ORDER NOTES / REQUESTS:*\n"${formData.orderNotes.trim()}"\n\n`;
    }

    message += `🛍️ *ORDER ITEMS (${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}):*\n`;

    cart.forEach((item, index) => {
      message += `\n${index + 1}. *${item.name}*\n`;
      if (item.curatedDetails) {
        message += `   • Type: Curated Piece (${item.curatedDetails.modeTitle})\n`;
        message += `   • Fit: ${item.curatedDetails.audience}\n`;
        if (item.curatedDetails.technique) message += `   • Technique: ${item.curatedDetails.technique}\n`;
        if (item.curatedDetails.pieceName) message += `   • Piece: ${item.curatedDetails.pieceName}\n`;
        message += `   • Silhouette: ${item.curatedDetails.silhouetteName}\n`;
        message += `   • Size: ${item.size}\n`;
        if (item.curatedDetails.colorName) message += `   • Linen: ${item.curatedDetails.colorName}\n`;
        if (item.curatedDetails.theme) message += `   • Theme: "${item.curatedDetails.theme}"\n`;
      } else {
        let specs = `   • Size: ${item.size} | Fit: ${item.silhouette.replace(/-/g, " ")}`;
        if (item.color) {
          specs += ` | Colour: ${item.color}`;
        }
        message += `${specs}\n`;
      }
      message += `   • Quantity: ${item.quantity}\n`;
      message += `   • Price: ₹${(item.price * item.quantity).toLocaleString("en-IN")}\n`;
    });

    message += `\n💰 *ESTIMATED TOTAL:* ₹${cartTotal.toLocaleString("en-IN")}\n\n`;
    message += "Please confirm the order and share payment details. Thank you!";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");

    setIsSubmitting(false);
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
            <p className="text-[#8B8985] text-xs max-w-sm mb-8">
              Please add items to your cart before proceeding to checkout.
            </p>
            <Link
              href="/collections"
              className="bg-[#2C2B29] hover:bg-black text-white px-7 py-3 text-[11px] tracking-[0.18em] uppercase font-semibold transition-colors rounded-xs shadow-xs"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 items-start">
            {/* Left Column: Delivery Details Form */}
            <div className="flex-1 w-full">
              <form onSubmit={handlePlaceOrder} className="space-y-8">
                {/* 1. Contact Information */}
                <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E6E1]/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-5 border-b border-[#F0EEEB] pb-3">
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
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${
                          errors.email
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
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${
                          errors.fullName
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
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${
                          errors.phone
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
                  <h2 className="text-xs tracking-[0.2em] uppercase font-semibold text-[#2C2B29] mb-5 border-b border-[#F0EEEB] pb-3">
                    2. Delivery & Shipping Address
                  </h2>

                  <div className="space-y-4 sm:space-y-5">
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
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${
                          errors.addressLine1
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
                          className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${
                            errors.city
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
                          className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium focus:outline-none ${
                            errors.state
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
                          className={`w-full px-3.5 py-2.5 text-sm rounded-xs border transition-colors bg-white text-[#2C2B29] font-medium placeholder:text-[#9C9994] focus:outline-none ${
                            errors.pincode
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
                  </div>
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
                        <div className="text-right font-serif text-sm font-medium text-[#2C2B29] shrink-0">
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
                    <span className="font-serif text-sm text-[#2C2B29] font-medium">
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
                    <span className="font-serif text-2xl text-[#2C2B29] font-medium">
                      ₹ {cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full group bg-[#2C2B29] text-white py-3.5 px-5 flex items-center justify-between hover:bg-black transition-all duration-300 rounded-xs shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-[#79A7D3]" />
                    <span className="text-xs tracking-[0.16em] uppercase font-semibold">
                      Complete Order via WhatsApp
                    </span>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
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
