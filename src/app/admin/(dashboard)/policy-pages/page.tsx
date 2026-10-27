"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  RefreshCw, 
  FileText, 
  Truck, 
  Repeat,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
  Sparkles,
  Info,
  Clock,
  Layers,
  CopyPlus
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  PolicyPageData, 
  PolicySection, 
  DEFAULT_SHIPPING_AND_DELIVERY, 
  DEFAULT_RETURNS_AND_EXCHANGES 
} from "@/lib/policyDefaults";
import StickySaveBar from "@/components/admin/StickySaveBar";

type TabKey = "shipping-and-delivery" | "returns-and-exchanges";
type DevicePreview = "desktop" | "mobile";

export default function PolicyPagesManager() {
  const [activeTab, setActiveTab] = useState<TabKey>("shipping-and-delivery");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [devicePreview, setDevicePreview] = useState<DevicePreview>("desktop");
  const [activeEditingSectionId, setActiveEditingSectionId] = useState<string | null>(null);

  // States for each page
  const [shippingData, setShippingData] = useState<PolicyPageData>(DEFAULT_SHIPPING_AND_DELIVERY);
  const [returnsData, setReturnsData] = useState<PolicyPageData>(DEFAULT_RETURNS_AND_EXCHANGES);
  
  // Track saved snapshots to detect unsaved changes
  const [savedShippingSnapshot, setSavedShippingSnapshot] = useState<string>("");
  const [savedReturnsSnapshot, setSavedReturnsSnapshot] = useState<string>("");

  // Open/collapsed state for sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dispatch: true,
    "complimentary-shipping": true,
    delivery: true,
    returns: true,
    exchanges: true,
    "delivery-transit": true,
    note: true,
  });

  const currentData = activeTab === "shipping-and-delivery" ? shippingData : returnsData;
  const currentSavedSnapshot = activeTab === "shipping-and-delivery" ? savedShippingSnapshot : savedReturnsSnapshot;
  const isDirty = currentSavedSnapshot !== "" && JSON.stringify(currentData) !== currentSavedSnapshot;

  const setCurrentData = (updater: (prev: PolicyPageData) => PolicyPageData) => {
    if (activeTab === "shipping-and-delivery") {
      setShippingData(updater);
    } else {
      setReturnsData(updater);
    }
  };

  useEffect(() => {
    fetchPagesData();
  }, []);

  const fetchPagesData = async () => {
    try {
      setLoading(true);
      const [resShipping, resReturns] = await Promise.all([
        fetch("/api/policy-pages/shipping-and-delivery"),
        fetch("/api/policy-pages/returns-and-exchanges"),
      ]);

      if (resShipping.ok) {
        const json = await resShipping.json();
        const loaded: PolicyPageData = {
          id: "shipping-and-delivery",
          title: json.title || DEFAULT_SHIPPING_AND_DELIVERY.title,
          introText: json.introText ?? DEFAULT_SHIPPING_AND_DELIVERY.introText,
          introItalic: json.introItalic ?? DEFAULT_SHIPPING_AND_DELIVERY.introItalic,
          sections: Array.isArray(json.sections) && json.sections.length > 0 
            ? json.sections 
            : DEFAULT_SHIPPING_AND_DELIVERY.sections,
          footerNote: json.footerNote ?? DEFAULT_SHIPPING_AND_DELIVERY.footerNote,
          footerItalic: json.footerItalic ?? DEFAULT_SHIPPING_AND_DELIVERY.footerItalic,
        };
        setShippingData(loaded);
        setSavedShippingSnapshot(JSON.stringify(loaded));
      }

      if (resReturns.ok) {
        const json = await resReturns.json();
        const loaded: PolicyPageData = {
          id: "returns-and-exchanges",
          title: json.title || DEFAULT_RETURNS_AND_EXCHANGES.title,
          introText: json.introText ?? DEFAULT_RETURNS_AND_EXCHANGES.introText,
          introItalic: json.introItalic ?? DEFAULT_RETURNS_AND_EXCHANGES.introItalic,
          sections: Array.isArray(json.sections) && json.sections.length > 0 
            ? json.sections 
            : DEFAULT_RETURNS_AND_EXCHANGES.sections,
          footerNote: json.footerNote ?? DEFAULT_RETURNS_AND_EXCHANGES.footerNote,
          footerItalic: json.footerItalic ?? DEFAULT_RETURNS_AND_EXCHANGES.footerItalic,
        };
        setReturnsData(loaded);
        setSavedReturnsSnapshot(JSON.stringify(loaded));
      }
    } catch (err) {
      console.error("Failed to load policy pages", err);
      toast.error("Failed to load page contents");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/policy-pages/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentData),
      });

      const resData = await res.json();
      if (resData.success) {
        if (activeTab === "shipping-and-delivery") {
          setSavedShippingSnapshot(JSON.stringify(currentData));
        } else {
          setSavedReturnsSnapshot(JSON.stringify(currentData));
        }
        toast.success(`${currentData.title} updated and published live!`);
      } else {
        toast.error(resData.message || "Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    try {
      setResetting(true);
      const res = await fetch(`/api/policy-pages/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });

      const resData = await res.json();
      if (resData.success) {
        const defaultData = activeTab === "shipping-and-delivery" 
          ? DEFAULT_SHIPPING_AND_DELIVERY 
          : DEFAULT_RETURNS_AND_EXCHANGES;
        setCurrentData(() => ({ ...defaultData }));
        if (activeTab === "shipping-and-delivery") {
          setSavedShippingSnapshot(JSON.stringify(defaultData));
        } else {
          setSavedReturnsSnapshot(JSON.stringify(defaultData));
        }
        toast.success(`Reset ${defaultData.title} to original defaults!`);
      } else {
        toast.error(resData.message || "Failed to reset");
      }
    } catch (err) {
      console.error("Reset error:", err);
      toast.error("An error occurred while resetting.");
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  const handleAddSection = () => {
    const newId = `section-${Date.now()}`;
    const newSection: PolicySection = {
      id: newId,
      title: "NEW POLICY SECTION",
      content: "Enter your terms, dispatch details, or customer guidelines here.",
    };

    setCurrentData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    setExpandedSections((prev) => ({ ...prev, [newId]: true }));
    setActiveEditingSectionId(newId);
    toast.success("New section added! Fill in the title and details.");
  };

  const handleDuplicateSection = (index: number) => {
    const target = currentData.sections[index];
    const newId = `section-${Date.now()}`;
    const duplicated: PolicySection = {
      id: newId,
      title: `${target.title} (COPY)`,
      content: target.content,
    };

    const newSections = [...currentData.sections];
    newSections.splice(index + 1, 0, duplicated);

    setCurrentData((prev) => ({
      ...prev,
      sections: newSections,
    }));

    setExpandedSections((prev) => ({ ...prev, [newId]: true }));
    setActiveEditingSectionId(newId);
    toast.success("Section duplicated!");
  };

  const handleRemoveSection = (index: number) => {
    const target = currentData.sections[index];
    setCurrentData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
    toast.success(`Removed "${target.title || "Section"}"`);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentData.sections.length) return;

    setCurrentData((prev) => {
      const items = [...prev.sections];
      const temp = items[index];
      items[index] = items[targetIndex];
      items[targetIndex] = temp;
      return { ...prev, sections: items };
    });
  };

  const handleSectionChange = (index: number, field: "title" | "content", value: string) => {
    setCurrentData((prev) => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sections: updated };
    });
  };

  const toggleSectionExpand = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAllSections = () => {
    const updated: Record<string, boolean> = {};
    currentData.sections.forEach((sec) => {
      updated[sec.id] = true;
    });
    setExpandedSections(updated);
  };

  const collapseAllSections = () => {
    const updated: Record<string, boolean> = {};
    currentData.sections.forEach((sec) => {
      updated[sec.id] = false;
    });
    setExpandedSections(updated);
  };

  // Quick insertion helpers for textareas
  const insertTextAtSection = (index: number, textToAppend: string) => {
    const current = currentData.sections[index].content;
    const separator = current.trim().length > 0 ? "\n\n" : "";
    handleSectionChange(index, "content", current + separator + textToAppend);
  };

  const liveStoreUrl = activeTab === "shipping-and-delivery" ? "/shipping-and-delivery" : "/returns-and-exchanges";

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${liveStoreUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.success("Page link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center text-gray-400 gap-3">
        <RefreshCw size={28} className="animate-spin text-[#C2A17A]" />
        <span className="font-medium text-sm text-gray-500">Loading policy page settings...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28">
      
      {/* Header Banner (Normal flow, not sticky) */}
      <div className="pb-6 mb-6 border-b border-[#E8E6E1] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wider text-[#8B8985] font-semibold">Store Management</span>
            <span className="text-[#8B8985]">/</span>
            <span className="text-[11px] uppercase tracking-wider text-[#2C2B29] font-semibold">Customer Policies</span>
            {isDirty ? (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Unsaved Changes
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={11} className="text-emerald-600" />
                Published Live
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#2C2B29] font-bold">
            Policy Pages Manager
          </h1>
          <p className="text-xs text-[#8B8985] mt-1 max-w-2xl">
            Easily update dispatch times, free shipping policies, exchange procedures, and return conditions. Everything reflects instantly on your storefront.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[#2C2B29] text-xs font-medium transition-colors shadow-2xs"
            title="Copy Public URL"
          >
            {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copiedLink ? "Copied" : "Copy Link"}</span>
          </button>

          <Link
            href={liveStoreUrl}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E8E6E1] bg-white text-[#2C2B29] hover:bg-[#FAF9F7] text-xs font-medium transition-colors shadow-2xs"
          >
            <ExternalLink size={13} />
            <span>Open Page ↗</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
          >
            <RotateCcw size={13} />
            <span>Restore Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-xs uppercase tracking-wider transition-all shadow-sm ${
              isDirty
                ? "bg-[#2C2B29] hover:bg-black text-white ring-2 ring-[#2C2B29]/20"
                : "bg-[#2C2B29] text-white hover:bg-black opacity-90"
            } disabled:opacity-50`}
          >
            {saving ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save & Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Cards - Clean, Large & User Friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        
        {/* Shipping Tab Button */}
        <button
          type="button"
          onClick={() => setActiveTab("shipping-and-delivery")}
          className={`relative p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
            activeTab === "shipping-and-delivery"
              ? "bg-white border-[#2C2B29] shadow-sm ring-1 ring-[#2C2B29]"
              : "bg-[#F9F8F6] border-[#E8E6E1] hover:bg-white/80 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === "shipping-and-delivery"
                ? "bg-[#2C2B29] text-white"
                : "bg-white border border-[#E8E6E1] text-[#8B8985]"
            }`}>
              <Truck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#2C2B29]">Shipping & Delivery</span>
                {activeTab === "shipping-and-delivery" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </div>
              <p className="text-xs text-[#8B8985] mt-0.5">
                {shippingData.sections.length} policy sections configured
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#8B8985] hidden sm:block">/shipping-and-delivery</span>
        </button>

        {/* Returns Tab Button */}
        <button
          type="button"
          onClick={() => setActiveTab("returns-and-exchanges")}
          className={`relative p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
            activeTab === "returns-and-exchanges"
              ? "bg-white border-[#2C2B29] shadow-sm ring-1 ring-[#2C2B29]"
              : "bg-[#F9F8F6] border-[#E8E6E1] hover:bg-white/80 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === "returns-and-exchanges"
                ? "bg-[#2C2B29] text-white"
                : "bg-white border border-[#E8E6E1] text-[#8B8985]"
            }`}>
              <Repeat size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#2C2B29]">Returns & Exchanges</span>
                {activeTab === "returns-and-exchanges" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </div>
              <p className="text-xs text-[#8B8985] mt-0.5">
                {returnsData.sections.length} policy sections configured
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#8B8985] hidden sm:block">/returns-and-exchanges</span>
        </button>

      </div>

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Section 1: Page Headline & Introduction */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#FAF9F7] border border-[#E8E6E1] flex items-center justify-center text-[#2C2B29] text-xs font-bold">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#2C2B29] uppercase tracking-wider">
                  Page Headline & Introduction
                </h2>
              </div>
              <span className="text-[11px] text-[#8B8985]">Appears at the very top of the page</span>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Page Title (Storefront Heading)
                </label>
                <input
                  type="text"
                  value={currentData.title}
                  onChange={(e) => setCurrentData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Shipping & Delivery"
                  className="w-full bg-[#FAF9F7]/40 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#2C2B29] focus:bg-white focus:outline-none focus:border-[#2C2B29] transition-colors"
                />
              </div>

              {/* Intro Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-700">
                    Introductory Statement (Welcome / Made-to-Order note)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentData.introItalic}
                      onChange={(e) => setCurrentData((prev) => ({ ...prev, introItalic: e.target.checked }))}
                      className="rounded border-gray-300 text-[#2C2B29] focus:ring-0"
                    />
                    <span>Italic Font</span>
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={currentData.introText}
                  onChange={(e) => setCurrentData((prev) => ({ ...prev, introText: e.target.value }))}
                  placeholder="Enter introductory message. Press Enter twice to create multiple paragraphs..."
                  className="w-full bg-[#FAF9F7]/40 border border-gray-200 rounded-lg p-3 text-xs sm:text-sm text-[#2C2B29] focus:bg-white focus:outline-none focus:border-[#2C2B29] transition-colors leading-relaxed font-sans resize-y"
                />
                <div className="flex items-center justify-between text-[11px] text-[#8B8985] mt-1">
                  <span>Tip: Separate multiple paragraphs with an empty line.</span>
                  <span>{currentData.introText.trim().length} chars</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Policy Content Sections (Accordion List) */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#FAF9F7] border border-[#E8E6E1] flex items-center justify-center text-[#2C2B29] text-xs font-bold">
                  2
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#2C2B29] uppercase tracking-wider">
                    Policy Content Sections ({currentData.sections.length})
                  </h2>
                  <p className="text-[11px] text-[#8B8985]">
                    Drag, edit, reorder or add custom sections to this policy.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandAllSections}
                  className="text-[11px] text-gray-500 hover:text-black px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  Expand All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={collapseAllSections}
                  className="text-[11px] text-gray-500 hover:text-black px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  Collapse All
                </button>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2C2B29] text-white hover:bg-black transition-colors text-xs font-medium ml-2 shadow-2xs"
                >
                  <Plus size={13} />
                  <span>Add Section</span>
                </button>
              </div>
            </div>

            {/* List of Sections */}
            {currentData.sections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-gray-600">No sections in this policy</p>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                  Click the &quot;Add Section&quot; button above to create a dispatch timeline, returns window, or custom rule.
                </p>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="mt-4 px-4 py-2 bg-white border border-gray-200 text-xs font-medium rounded-lg hover:bg-gray-50 text-[#2C2B29] shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add First Section
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentData.sections.map((section, index) => {
                  const isExpanded = expandedSections[section.id] !== false;
                  const isHighlighted = activeEditingSectionId === section.id;

                  return (
                    <div
                      key={section.id || index}
                      onFocus={() => setActiveEditingSectionId(section.id)}
                      className={`border rounded-xl transition-all overflow-hidden ${
                        isHighlighted
                          ? "border-[#2C2B29] shadow-xs bg-white"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      {/* Accordion Header */}
                      <div className="flex items-center justify-between p-3.5 bg-[#FAF9F7]/70 cursor-pointer select-none" onClick={() => toggleSectionExpand(section.id)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-white border border-gray-200 text-[#2C2B29] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>
                          
                          <div className="min-w-0">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#2C2B29] block truncate">
                              {section.title || "Untitled Section"}
                            </span>
                            {!isExpanded && (
                              <p className="text-[11px] text-gray-400 truncate max-w-md">
                                {section.content || "Empty content"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Top Action Controls */}
                        <div className="flex items-center gap-1 shrink-0 ml-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(index, "up")}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-1 text-gray-400 hover:text-black hover:bg-white rounded disabled:opacity-20 transition-all"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(index, "down")}
                            disabled={index === currentData.sections.length - 1}
                            title="Move Down"
                            className="p-1 text-gray-400 hover:text-black hover:bg-white rounded disabled:opacity-20 transition-all"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateSection(index)}
                            title="Duplicate Section"
                            className="p-1 text-gray-400 hover:text-black hover:bg-white rounded transition-colors ml-0.5"
                          >
                            <CopyPlus size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(index)}
                            title="Delete Section"
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-0.5"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionExpand(section.id)}
                            className="p-1 text-gray-400 hover:text-black rounded ml-1"
                          >
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div className="p-4 pt-3 border-t border-gray-100 space-y-3.5 bg-white">
                          
                          {/* Section Title */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                                Section Subheading
                              </label>
                              <span className="text-[10px] text-gray-400">Uppercase on storefront</span>
                            </div>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                              placeholder="e.g. DISPATCH, RETURNS, EXCHANGES, TRANSIT"
                              className="w-full bg-[#FAF9F7]/40 border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#2C2B29] focus:bg-white focus:outline-none focus:border-[#2C2B29] transition-colors"
                            />
                          </div>

                          {/* Quick Insert Snippet Helpers */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                                Content & Policy Rules
                              </label>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                <span>Quick insert:</span>
                                <button
                                  type="button"
                                  onClick={() => insertTextAtSection(index, "• ")}
                                  className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                  title="Add bullet point"
                                >
                                  • Bullet
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertTextAtSection(index, "Orders are typically dispatched within 12–15 business days.")}
                                  className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                  title="Add dispatch timeline"
                                >
                                  Timeline
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertTextAtSection(index, "For assistance, please contact our team at pausepalette@gmail.com")}
                                  className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                  title="Add email support"
                                >
                                  Email
                                </button>
                              </div>
                            </div>

                            <textarea
                              rows={4}
                              value={section.content}
                              onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                              placeholder="Type policy instructions or conditions here. Press Enter twice to split into separate paragraphs..."
                              className="w-full bg-[#FAF9F7]/40 border border-gray-200 rounded-lg p-3 text-xs text-[#2C2B29] focus:bg-white focus:outline-none focus:border-[#2C2B29] transition-colors leading-relaxed font-sans resize-y"
                            />
                            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-0.5">
                              <span>Double Enter (empty line) creates a distinct paragraph.</span>
                              <span>{section.content.split("\n\n").filter(Boolean).length} paragraph(s)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Bottom Closing Note */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#FAF9F7] border border-[#E8E6E1] flex items-center justify-center text-[#2C2B29] text-xs font-bold">
                  3
                </span>
                <h2 className="text-sm font-bold text-[#2C2B29] uppercase tracking-wider">
                  Closing / Footer Note (Optional)
                </h2>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={currentData.footerItalic}
                  onChange={(e) => setCurrentData((prev) => ({ ...prev, footerItalic: e.target.checked }))}
                  className="rounded border-gray-300 text-[#2C2B29] focus:ring-0"
                />
                <span>Italic Font</span>
              </label>
            </div>

            <div>
              <textarea
                rows={3}
                value={currentData.footerNote}
                onChange={(e) => setCurrentData((prev) => ({ ...prev, footerNote: e.target.value }))}
                placeholder="e.g. Pieces made with intention are worth a little time. Thank you for allowing us the time to make yours thoughtfully"
                className="w-full bg-[#FAF9F7]/40 border border-gray-200 rounded-lg p-3 text-xs sm:text-sm text-[#2C2B29] focus:bg-white focus:outline-none focus:border-[#2C2B29] transition-colors leading-relaxed font-sans resize-y"
              />
              <p className="text-[11px] text-[#8B8985] mt-1">
                A warm sign-off or note displayed after all policy sections. Leave blank if not required.
              </p>
            </div>
          </div>

          {/* Save Floating Bar for Mobile / Bottom UX */}
          <div className="flex items-center justify-between p-4 bg-[#FAF9F7] rounded-xl border border-[#E8E6E1]">
            <div className="text-xs text-gray-500">
              {isDirty ? (
                <span className="text-amber-700 font-medium">You have unsaved changes waiting to be published.</span>
              ) : (
                <span>All changes currently published.</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#2C2B29] text-white rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Save & Publish</span>
            </button>
          </div>

        </div>

        {/* Right Sticky Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl border border-[#E8E6E1] p-5 shadow-xs">
              
              {/* Preview Header with Desktop / Mobile switch */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Eye size={15} className="text-[#C2A17A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2C2B29]">
                    Live Storefront Preview
                  </span>
                </div>

                {/* Device Switcher */}
                <div className="flex items-center p-0.5 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDevicePreview("desktop")}
                    className={`p-1.5 rounded-md transition-all ${
                      devicePreview === "desktop"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="Desktop View"
                  >
                    <Monitor size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevicePreview("mobile")}
                    className={`p-1.5 rounded-md transition-all ${
                      devicePreview === "mobile"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>
              </div>

              {/* Simulated Device Frame */}
              <div className="flex justify-center bg-gray-100/60 p-2 sm:p-3 rounded-xl border border-gray-200">
                <div
                  className={`bg-white transition-all duration-300 shadow-sm overflow-hidden flex flex-col text-center font-serif ${
                    devicePreview === "mobile"
                      ? "w-[320px] rounded-2xl border-4 border-gray-800 my-1"
                      : "w-full rounded-lg border border-gray-200"
                  }`}
                  style={{ maxHeight: "680px" }}
                >
                  {/* Mock Navbar */}
                  <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between bg-white shrink-0">
                    <span className="text-[9px] tracking-widest uppercase text-gray-400">PAUSE PALETTE</span>
                    <span className="text-[9px] font-sans text-gray-400 uppercase tracking-wider">{activeTab === "shipping-and-delivery" ? "Shipping" : "Returns"}</span>
                  </div>

                  {/* Scrollable Content inside Preview */}
                  <div className="overflow-y-auto p-5 sm:p-7 flex-1">
                    
                    {/* Main Title */}
                    <h1 className="font-garamond text-[15px] sm:text-[16px] text-gray-500 font-semibold tracking-[0.2em] uppercase mb-8">
                      {currentData.title || "Policy Heading"}
                    </h1>

                    <div 
                      className="text-gray-600 leading-relaxed text-xs sm:text-[13px] max-w-md mx-auto" 
                      style={{ fontFamily: "'EB Garamond', Garamond, serif" }}
                    >
                      {/* Intro Text */}
                      {currentData.introText && (
                        <div className="mb-8 space-y-3">
                          {currentData.introText.split("\n\n").map((para, i) => (
                            <p key={i} className={currentData.introItalic ? "italic" : ""}>
                              {para}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Sections */}
                      {currentData.sections.map((section, idx) => (
                        <section 
                          key={section.id || idx} 
                          className={`mb-8 p-2 rounded-lg transition-colors ${
                            activeEditingSectionId === section.id
                              ? "bg-amber-50/50 ring-1 ring-amber-300/40"
                              : ""
                          }`}
                        >
                          <h2 className="font-sans text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 uppercase mb-2 font-semibold">
                            {section.title || "SECTION HEADING"}
                          </h2>
                          <div className="space-y-3">
                            {(section.content || "").split("\n\n").map((para, pIdx) => (
                              <p key={pIdx} className="leading-relaxed">
                                {para}
                              </p>
                            ))}
                          </div>
                        </section>
                      ))}

                      {/* Footer Note */}
                      {currentData.footerNote && (
                        <div className="mt-10 pt-4 border-t border-gray-100">
                          <p className={currentData.footerItalic ? "italic" : ""}>
                            {currentData.footerNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mock Footer info */}
                  <div className="border-t border-gray-100 py-2 text-[9px] text-gray-300 uppercase tracking-widest bg-gray-50 shrink-0">
                    Live Storefront Preview
                  </div>
                </div>
              </div>

              {/* Status helper */}
              <div className="mt-3.5 flex items-center justify-between text-[11px] text-gray-400 px-1">
                <span>Auto-updates in real time</span>
                <span>{devicePreview === "desktop" ? "Desktop layout" : "Mobile layout (320px)"}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-gray-900">
                  Reset {currentData.title}?
                </h3>
                <span className="text-[11px] text-gray-400">Restore default policy statements</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
              This will restore all headings, dispatch timelines, and conditions for <strong>{currentData.title}</strong> back to the original brand defaults. Any unsaved custom modifications will be discarded.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                disabled={resetting}
                className="px-5 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {resetting && <RefreshCw size={12} className="animate-spin" />}
                <span>Yes, Reset to Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Save Bar (Accessible at any point of editing) */}
      <StickySaveBar
        onSave={handleSave}
        saving={saving}
        label="Save & Publish"
        isDirty={isDirty}
        secondaryAction={{
          label: "Restore Defaults",
          onClick: () => setShowResetConfirm(true),
          icon: <RotateCcw size={12} />,
        }}
      />

    </div>
  );
}
