"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  Save, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  Search, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  PackageCheck
} from "lucide-react";
import { DEFAULT_NEW_ARRIVALS_DATA, NewArrivalsData } from "@/lib/newArrivalsDefaults";
import StickySaveBar from "@/components/admin/StickySaveBar";

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[];
  isPublished: boolean;
  isNew: boolean;
  collection?: { name: string } | null;
}

export default function NewArrivalsAdminPage() {
  const [data, setData] = useState<NewArrivalsData>(DEFAULT_NEW_ARRIVALS_DATA);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [curationMode, setCurationMode] = useState<"auto" | "curated">("auto");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [settingsRes, productsRes] = await Promise.all([
        fetch("/api/new-arrivals-settings"),
        fetch("/api/products"),
      ]);

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setData({
          isEnabled: settings.isEnabled ?? true,
          tagline: settings.tagline || DEFAULT_NEW_ARRIVALS_DATA.tagline,
          title: settings.title ?? "",
          subtitle: settings.subtitle ?? "",
          buttonText: settings.buttonText || DEFAULT_NEW_ARRIVALS_DATA.buttonText,
          buttonLink: settings.buttonLink || DEFAULT_NEW_ARRIVALS_DATA.buttonLink,
          limit: typeof settings.limit === "number" ? settings.limit : DEFAULT_NEW_ARRIVALS_DATA.limit,
          productIds: Array.isArray(settings.productIds) ? settings.productIds : [],
        });

        if (Array.isArray(settings.productIds) && settings.productIds.length > 0) {
          setCurationMode("curated");
        } else {
          setCurationMode("auto");
        }
      }

      if (productsRes.ok) {
        const prods = await productsRes.json();
        setProducts(Array.isArray(prods) ? prods : []);
      }
    } catch (err) {
      console.error("Failed to load new arrivals settings", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: NewArrivalsData = {
        ...data,
        productIds: curationMode === "curated" ? data.productIds : [],
      };

      const res = await fetch("/api/new-arrivals-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      toast.success("New Arrivals section updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error saving settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setData((prev) => {
      const exists = prev.productIds.includes(productId);
      let updated: string[];
      if (exists) {
        updated = prev.productIds.filter((id) => id !== productId);
      } else {
        updated = [...prev.productIds, productId];
      }
      return { ...prev, productIds: updated };
    });
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.collection?.name && p.collection.name.toLowerCase().includes(query))
    );
  });

  const previewProducts = curationMode === "curated" && data.productIds.length > 0
    ? data.productIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as Product[]
    : products
        .filter((p) => p.isPublished && p.isNew)
        .slice(0, data.limit || 4);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#8B8985]" />
        <p className="text-xs uppercase tracking-[0.2em] text-[#8B8985]">Loading section settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header Banner (Normal flow, not sticky) */}
      <div className="pb-6 mb-8 border-b border-[#E8E6E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#8B8985] font-semibold">Homepage Section</span>
            <span className="text-gray-300">•</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#8B8985] font-semibold">Storefront</span>
          </div>
          <h1 className="text-3xl font-serif text-[#2C2B29] tracking-tight">New Arrivals Section</h1>
          <p className="text-xs text-[#8B8985] mt-1">
            Control the visibility, heading copy, and product display of the New In section on your homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E8E6E1] bg-white text-xs font-medium text-[#2C2B29] hover:bg-[#F2F0ED] transition-colors"
          >
            <Eye size={14} />
            <span>View Storefront</span>
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#2C2B29] text-white text-xs tracking-wider uppercase font-semibold hover:bg-[#403E3B] transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Section 1: ON / OFF Master Switch */}
      <div className={`p-6 md:p-8 rounded-2xl border transition-all ${
        data.isEnabled 
          ? "bg-[#FDFCFB] border-[#2C2B29]/20 shadow-sm" 
          : "bg-[#F4F3F0] border-[#E8E6E1]"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                data.isEnabled 
                  ? "bg-emerald-100 text-emerald-800" 
                  : "bg-stone-200 text-stone-600"
              }`}>
                {data.isEnabled ? (
                  <>
                    <Eye size={12} />
                    <span>Live on Homepage</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={12} />
                    <span>Section Disabled & Hidden</span>
                  </>
                )}
              </span>
              <span className="text-xs text-[#8B8985]">
                {data.isEnabled ? "Visible to all visitors" : "Completely hidden on homepage"}
              </span>
            </div>
            <h2 className="text-lg font-serif text-[#2C2B29]">Display Section on Homepage</h2>
            <p className="text-xs text-[#8B8985] max-w-2xl">
              Turn this section off to temporarily hide New Arrivals from the homepage without losing any of your configuration.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={data.isEnabled}
              onChange={(e) => setData({ ...data, isEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#2C2B29]"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Content & Products */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Customization Card */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-[#E8E6E1] pb-4">
              <h3 className="font-serif text-lg text-[#2C2B29]">Section Header & Typography</h3>
              <p className="text-xs text-[#8B8985] mt-0.5">
                Customize titles and tags. The previous text &ldquo;Latest arrivals, crafted for slow living&rdquo; has been removed by default.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Tagline */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#8B8985] font-semibold mb-2">
                  Tagline / Badge
                </label>
                <input
                  type="text"
                  value={data.tagline}
                  onChange={(e) => setData({ ...data, tagline: e.target.value })}
                  placeholder="e.g. NEW IN"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8E6E1] bg-[#FDFCFB] text-sm text-[#2C2B29] focus:outline-none focus:border-[#2C2B29]"
                />
                <p className="text-[10px] text-[#8B8985] mt-1">Small uppercase header above the section</p>
              </div>

              {/* Main Heading (Optional) */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#8B8985] font-semibold mb-2">
                  Main Title <span className="font-normal text-gray-400 lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="Leave empty to keep header clean"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8E6E1] bg-[#FDFCFB] text-sm text-[#2C2B29] focus:outline-none focus:border-[#2C2B29]"
                />
                <p className="text-[10px] text-[#8B8985] mt-1">Rendered in EB Garamond serif font if provided</p>
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#8B8985] font-semibold mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={data.buttonText}
                  onChange={(e) => setData({ ...data, buttonText: e.target.value })}
                  placeholder="e.g. Explore All"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8E6E1] bg-[#FDFCFB] text-sm text-[#2C2B29] focus:outline-none focus:border-[#2C2B29]"
                />
              </div>

              {/* Button Link */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#8B8985] font-semibold mb-2">
                  Button Destination Link
                </label>
                <input
                  type="text"
                  value={data.buttonLink}
                  onChange={(e) => setData({ ...data, buttonLink: e.target.value })}
                  placeholder="e.g. /shop/new-in"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8E6E1] bg-[#FDFCFB] text-sm text-[#2C2B29] focus:outline-none focus:border-[#2C2B29]"
                />
              </div>

              {/* Subtitle */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-[#8B8985] font-semibold mb-2">
                  Description / Subtitle <span className="font-normal text-gray-400 lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={data.subtitle}
                  onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                  placeholder="Leave empty if not needed"
                  className="w-full px-4 py-2.5 rounded-lg border border-[#E8E6E1] bg-[#FDFCFB] text-sm text-[#2C2B29] focus:outline-none focus:border-[#2C2B29]"
                />
              </div>

            </div>
          </div>

          {/* Product Feed & Selection Card */}
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6E1] pb-4">
              <div>
                <h3 className="font-serif text-lg text-[#2C2B29]">Product Source & Selection</h3>
                <p className="text-xs text-[#8B8985] mt-0.5">
                  Choose how products are populated in the New Arrivals carousel.
                </p>
              </div>

              {/* Limit selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8B8985] uppercase tracking-wider font-semibold">Display Count:</span>
                <select
                  value={data.limit}
                  onChange={(e) => setData({ ...data, limit: parseInt(e.target.value) || 4 })}
                  className="px-3 py-1.5 rounded-lg border border-[#E8E6E1] bg-[#FDFCFB] text-xs font-semibold text-[#2C2B29] focus:outline-none"
                >
                  <option value={4}>4 Products</option>
                  <option value={8}>8 Products</option>
                  <option value={12}>12 Products</option>
                </select>
              </div>
            </div>

            {/* Mode selection tabs */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-[#F4F3F0] rounded-xl">
              <button
                type="button"
                onClick={() => setCurationMode("auto")}
                className={`py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  curationMode === "auto"
                    ? "bg-white text-[#2C2B29] shadow-sm"
                    : "text-[#8B8985] hover:text-[#2C2B29]"
                }`}
              >
                <Sparkles size={14} />
                <span>Automatic (Latest &quot;New In&quot;)</span>
              </button>
              <button
                type="button"
                onClick={() => setCurationMode("curated")}
                className={`py-2.5 px-4 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  curationMode === "curated"
                    ? "bg-white text-[#2C2B29] shadow-sm"
                    : "text-[#8B8985] hover:text-[#2C2B29]"
                }`}
              >
                <Sliders size={14} />
                <span>Custom Curation ({data.productIds.length} selected)</span>
              </button>
            </div>

            {curationMode === "auto" ? (
              <div className="p-5 rounded-xl bg-[#FDFCFB] border border-[#E8E6E1] space-y-3">
                <div className="flex items-start gap-3">
                  <PackageCheck className="w-5 h-5 text-[#2C2B29] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2C2B29]">
                      Automatic Feed Active
                    </h4>
                    <p className="text-xs text-[#8B8985] mt-1 leading-relaxed">
                      The homepage will automatically show the latest published products that have the <strong>&quot;Mark as New In&quot;</strong> badge enabled in your Product catalog.
                    </p>
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-1.5 text-xs text-[#2C2B29] font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity"
                  >
                    <span>Manage Products &amp; New In Badges</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search Bar for products */}
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8985]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter products by name or collection..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#E8E6E1] bg-[#FDFCFB] text-xs text-[#2C2B29] focus:outline-none focus:border-[#2C2B29]"
                  />
                </div>

                {/* Product Selection Grid */}
                <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <p className="text-xs text-center py-8 text-[#8B8985]">No products found matching your search.</p>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = data.productIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProductSelection(p.id)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected ? "bg-[#F2F0ED]" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 bg-gray-100 rounded overflow-hidden relative shrink-0">
                              {p.images && p.images[0] ? (
                                <Image
                                  src={p.images[0]}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[#2C2B29]">{p.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[#8B8985]">₹{p.price.toLocaleString("en-IN")}</span>
                                {p.collection?.name && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-[10px] text-[#8B8985]">{p.collection.name}</span>
                                  </>
                                )}
                                {p.isNew && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-medium">New</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isSelected 
                              ? "bg-[#2C2B29] border-[#2C2B29] text-white" 
                              : "border-[#D0CECA] bg-white"
                          }`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column (1 Col): Live Homepage Preview Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 space-y-5 sticky top-28 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E8E6E1] pb-3">
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#8B8985]">Live Preview</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                data.isEnabled ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
              }`}>
                {data.isEnabled ? "ACTIVE" : "HIDDEN"}
              </span>
            </div>

            {/* Preview Box simulating storefront */}
            <div className={`rounded-xl border p-4 bg-white transition-opacity ${
              data.isEnabled ? "opacity-100" : "opacity-40"
            }`}>
              {/* Header Preview */}
              <div className="flex items-end justify-between border-b border-gray-100 pb-3 mb-4">
                <div>
                  {data.tagline?.trim() && (
                    <span className="text-[9px] tracking-[0.2em] uppercase text-gray-400 font-semibold block">
                      {data.tagline}
                    </span>
                  )}
                  {data.title?.trim() ? (
                    <p 
                      className="text-base text-gray-900 leading-snug mt-1"
                      style={{ fontFamily: "'EB Garamond', Garamond, serif" }}
                    >
                      {data.title}
                    </p>
                  ) : null}
                  {data.subtitle?.trim() && (
                    <p className="text-[10px] text-gray-500 mt-1">{data.subtitle}</p>
                  )}
                </div>
                <span className="text-[9px] tracking-wider uppercase text-gray-500 font-semibold shrink-0">
                  {data.buttonText || "Explore All"} &rarr;
                </span>
              </div>

              {/* Mini Products Grid Preview */}
              <div className="grid grid-cols-2 gap-2">
                {previewProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="bg-gray-50 rounded overflow-hidden p-1.5 flex flex-col">
                    <div className="aspect-3/4 relative bg-gray-200 rounded overflow-hidden mb-1.5">
                      {p.images && p.images[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No img</div>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-gray-800 truncate">{p.name}</span>
                    <span className="text-[9px] text-gray-500">₹{p.price.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              {!data.isEnabled && (
                <div className="mt-3 text-center bg-stone-100 py-1.5 rounded text-[10px] text-stone-600 font-medium">
                  Section is disabled and hidden from customers.
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E8E6E1]">
              <div className="flex items-center gap-2 text-xs text-[#8B8985]">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>EB Garamond typography supported</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8B8985]">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Responsive on Desktop, Tablet &amp; Mobile</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8B8985]">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Instant toggle with zero downtime</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-lg bg-[#2C2B29] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#403E3B] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? "Saving..." : "Save Configuration"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating Sticky Save Bar */}
      <StickySaveBar
        onSave={handleSave}
        saving={saving}
        label="Save Changes"
        subtext={data.isEnabled ? "Section Active" : "Section Hidden"}
      />

    </div>
  );
}
