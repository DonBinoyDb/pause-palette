"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Save, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShoppingBag,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import StickySaveBar from "@/components/admin/StickySaveBar";

const DEFAULT_SETTINGS = {
  whatsappNumber: "917907629021",
  supportEmail: "pausepalette@gmail.com",
  instagramUrl: "https://www.instagram.com/pause_palette?stkn=c2k1dGNxeGJ4aGtj",
};

export default function ContactSettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_SETTINGS.whatsappNumber);
  const [supportEmail, setSupportEmail] = useState(DEFAULT_SETTINGS.supportEmail);
  const [instagramUrl, setInstagramUrl] = useState(DEFAULT_SETTINGS.instagramUrl);
  
  const [initialData, setInitialData] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/contact");
      if (res.ok) {
        const data = await res.json();
        const settings = {
          whatsappNumber: data.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
          supportEmail: data.supportEmail || DEFAULT_SETTINGS.supportEmail,
          instagramUrl: data.instagramUrl || DEFAULT_SETTINGS.instagramUrl,
        };
        setWhatsappNumber(settings.whatsappNumber);
        setSupportEmail(settings.supportEmail);
        setInstagramUrl(settings.instagramUrl);
        setInitialData(settings);
      }
    } catch (error) {
      console.error("Failed to load contact settings:", error);
      toast.error("Failed to load settings. Using defaults.");
    } finally {
      setLoading(false);
    }
  };

  // Clean digits for wa.me
  const cleanDigits = whatsappNumber.replace(/\D/g, "");
  const waLink = `https://wa.me/${cleanDigits || DEFAULT_SETTINGS.whatsappNumber}`;

  const isDirty = 
    whatsappNumber !== initialData.whatsappNumber ||
    supportEmail !== initialData.supportEmail ||
    instagramUrl !== initialData.instagramUrl;

  const handleSave = async () => {
    if (!cleanDigits) {
      toast.error("Please provide a valid WhatsApp phone number.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/settings/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber: cleanDigits,
          supportEmail,
          instagramUrl,
        }),
      });

      if (res.ok) {
        toast.success("WhatsApp & Contact settings saved live!");
        setInitialData({
          whatsappNumber: cleanDigits,
          supportEmail,
          instagramUrl,
        });
        setWhatsappNumber(cleanDigits);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(waLink);
    setCopiedLink(true);
    toast.success("WhatsApp chat link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset WhatsApp number and contact channels to defaults?")) {
      setWhatsappNumber(DEFAULT_SETTINGS.whatsappNumber);
      setSupportEmail(DEFAULT_SETTINGS.supportEmail);
      setInstagramUrl(DEFAULT_SETTINGS.instagramUrl);
      toast.success("Reset to defaults. Remember to save changes.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center text-gray-400 gap-3">
        <RefreshCw size={28} className="animate-spin text-[#C2A17A]" />
        <span className="font-medium text-sm text-gray-500">Loading WhatsApp & Contact settings...</span>
      </div>
    );
  }

  return (
    <div className="w-full pb-28">
      
      {/* Header Banner (Normal flow, not sticky) */}
      <div className="pb-6 mb-8 border-b border-[#E8E6E1] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider text-[#8B8985] font-semibold">Store Management</span>
            <span className="text-[#8B8985]">/</span>
            <span className="text-[11px] uppercase tracking-wider text-[#2C2B29] font-semibold">Contact & Channels</span>
            {isDirty ? (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Unsaved Changes
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={11} className="text-emerald-600" />
                Active on Storefront
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#2C2B29] font-bold">
            WhatsApp & Contact Settings
          </h1>
          <p className="text-xs text-[#8B8985] mt-1 max-w-2xl">
            Configure the official WhatsApp number for customer enquiries and WhatsApp Cart Checkout. Changes update immediately across the entire site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[#2C2B29] text-xs font-medium transition-colors shadow-2xs"
            title="Copy Public WhatsApp Link"
          >
            {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copiedLink ? "Link Copied" : "Copy Chat Link"}</span>
          </button>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold tracking-wider transition-colors shadow-sm"
          >
            <MessageCircle size={14} />
            <span>Test Chat ↗</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Settings Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* WhatsApp Card */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F2F0ED]">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#2C2B29]">Official WhatsApp Business Number</h2>
                <p className="text-xs text-[#8B8985]">Receives cart checkout orders and direct customer chat requests</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#2C2B29] uppercase tracking-wider">
                Phone Number (Include Country Code)
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 917907629021 or +91 79076 29021"
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-xl text-sm font-mono text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#2C2B29]/10 focus:border-[#2C2B29] transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Enter your full international number without spaces or symbols (e.g. <span className="font-mono font-medium text-gray-700">917907629021</span> for India +91). Any spaces or plus signs will be formatted automatically.
              </p>
            </div>

            {/* Generated Link Display */}
            <div className="p-3.5 bg-[#FAF9F7] rounded-xl border border-[#E8E6E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-semibold text-[#8B8985] tracking-wider">Active Click-to-Chat URL:</span>
                <span className="font-mono text-emerald-700 font-medium truncate max-w-sm">{waLink}</span>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#2C2B29] hover:underline flex items-center gap-1 shrink-0"
              >
                Open in WhatsApp <ExternalLink size={11} />
              </a>
            </div>

            {/* Where It's Used Callout */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-950 flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                <Sparkles size={14} className="text-emerald-700" />
                <span>Automatic Storefront Integrations</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-emerald-900/90 list-disc list-inside">
                <li>
                  <strong>Cart WhatsApp Checkout:</strong> When buyers click &ldquo;Checkout via WhatsApp&rdquo; in their shopping bag, their selected pieces, measurements, and total price open directly in chat with this number.
                </li>
                <li>
                  <strong>Contact Page:</strong> The &ldquo;Chat with Us&rdquo; button directs prospective customers directly to this number.
                </li>
              </ul>
            </div>
          </div>

          {/* Secondary Support Channels */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F2F0ED]">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#2C2B29]">Other Contact Channels</h2>
                <p className="text-xs text-[#8B8985]">Customer support email and official Instagram handle</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#2C2B29] uppercase tracking-wider">
                Support Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="pausepalette@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-xl text-sm text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#2C2B29]/10 focus:border-[#2C2B29] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#2C2B29] uppercase tracking-wider">
                Instagram Page URL
              </label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/pause_palette"
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF9F7] border border-gray-200 rounded-xl text-sm text-[#2C2B29] focus:outline-none focus:ring-2 focus:ring-[#2C2B29]/10 focus:border-[#2C2B29] transition-all"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-8">
          
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2F0ED]">
              <span className="text-xs uppercase font-semibold text-[#8B8985] tracking-wider">Live Storefront Preview</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">Customer View</span>
            </div>

            {/* Simulated Cart Checkout Button */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cart Page Button</span>
              <div className="w-full py-3.5 bg-[#2C2B29] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm">
                <ShoppingBag size={14} />
                <span>Checkout via WhatsApp</span>
              </div>
              <p className="text-[10px] text-gray-400 text-center">
                Routes directly to: <span className="font-mono text-gray-700">+{cleanDigits || DEFAULT_SETTINGS.whatsappNumber}</span>
              </p>
            </div>

            <div className="w-full h-[1px] bg-gray-100 my-1"></div>

            {/* Simulated WhatsApp Chat Message */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sample Order Text Received</span>
              <div className="bg-[#EFEAE2] p-4 rounded-xl border border-[#E0D8CB] text-xs font-sans text-gray-800 leading-relaxed shadow-inner">
                <div className="bg-white p-3 rounded-lg shadow-2xs space-y-2 border border-gray-100">
                  <p className="text-[11px] font-medium text-gray-700">
                    Hello, I would like to purchase the following items from my cart:
                  </p>
                  <div className="text-[11px] font-mono text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 space-y-1">
                    <p>1. In Wild Bloom Linen Shirt</p>
                    <p>   Size: M | Fit: Relaxed</p>
                    <p>   Quantity: 1</p>
                    <p>   Price: ₹4,200</p>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-800">Estimated Total: ₹4,200</p>
                  <p className="text-[10px] text-gray-500 italic">Please let me know the next steps for payment and shipping.</p>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Updates apply in real-time without redeploying.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Sticky Save Bar */}
      <StickySaveBar
        onSave={handleSave}
        saving={saving}
        isDirty={isDirty}
        label="Save WhatsApp Number"
        subtext={`WhatsApp: +${cleanDigits || DEFAULT_SETTINGS.whatsappNumber}`}
        secondaryAction={{
          label: "Restore Default",
          onClick: handleResetDefaults,
        }}
      />

    </div>
  );
}
