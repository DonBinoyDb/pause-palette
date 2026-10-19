"use client";

import { useState, useEffect } from "react";
import { Plus, X, Save, Check, Image as ImageIcon, Sliders, DollarSign, Palette, Shirt } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { DEFAULT_PRICING, DEFAULT_SILHOUETTES, DEFAULT_VISIBILITY } from "@/lib/curatorDefaults";

type Mode = "illustration" | "embroidery" | "solid";

export default function CuratorSettingsPage() {
  const [activeTab, setActiveTab] = useState<Mode>("illustration");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Modal State for Silhouette
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSilName, setNewSilName] = useState("");
  const [newSilPrice, setNewSilPrice] = useState("500");
  const [newSilSvg, setNewSilSvg] = useState(`<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full stroke-current">
  <path d="M30 20 L40 28 L50 22 L60 28 L70 20 L85 36 L75 44 L70 34 L70 88 L30 88 L30 34 L25 44 L15 36 Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M50 22 L50 88" stroke-width="1" stroke-dasharray="1 3"/>
  <circle cx="50" cy="40" r="1.2" fill="currentColor"/>
</svg>`);

  // Settings State
  const [settings, setSettings] = useState({
    visibility: DEFAULT_VISIBILITY,
    canvasProductIds: [] as string[],
    silhouettes: DEFAULT_SILHOUETTES as any[],
    pricing: DEFAULT_PRICING,
  });

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/curator-settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          visibility: data.visibility || DEFAULT_VISIBILITY,
          canvasProductIds: data.canvasProductIds || [],
          silhouettes: data.silhouettes?.length ? data.silhouettes : DEFAULT_SILHOUETTES,
          pricing: data.pricing || DEFAULT_PRICING,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/curator-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visibility: settings.visibility,
          canvasProductIds: settings.canvasProductIds,
          silhouettes: settings.silhouettes,
          pricing: settings.pricing,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings & Pricing saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Pricing Helpers
  const handleTechniqueChange = (technique: "printed" | "embroidered", value: number) => {
    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        techniqueValues: {
          ...prev.pricing.techniqueValues,
          [technique]: value,
        },
      },
    }));
  };

  const handleSizeAdjustmentChange = (sizeKey: string, value: number) => {
    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        sizeValues: {
          ...prev.pricing.sizeValues,
          [sizeKey]: value,
        },
      },
    }));
  };

  const handleLinenAdjustmentChange = (colorId: string, adjustment: number) => {
    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        linenColors: prev.pricing.linenColors.map((c) =>
          c.id === colorId ? { ...c, adjustment } : c
        ),
      },
    }));
  };

  const handleSilhouetteBasePriceChange = (silId: string, basePrice: number) => {
    setSettings((prev) => ({
      ...prev,
      silhouettes: prev.silhouettes.map((s) =>
        s.id === silId ? { ...s, basePrice } : s
      ),
    }));
  };

  const handlePiecePriceChange = (technique: "printed" | "embroidered", pieceId: string, basePrice: number) => {
    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        pieces: {
          ...prev.pricing.pieces,
          [technique]: prev.pricing.pieces[technique].map((p) =>
            p.id === pieceId ? { ...p, basePrice } : p
          ),
        },
      },
    }));
  };

  const openAddModal = () => {
    setNewSilName("");
    setNewSilPrice("500");
    setNewSilSvg(`<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full stroke-current">
  <path d="M30 20 L40 28 L50 22 L60 28 L70 20 L85 36 L75 44 L70 34 L70 88 L30 88 L30 34 L25 44 L15 36 Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M50 22 L50 88" stroke-width="1" stroke-dasharray="1 3"/>
  <circle cx="50" cy="40" r="1.2" fill="currentColor"/>
</svg>`);
    setIsModalOpen(true);
  };

  const confirmAddSilhouette = () => {
    if (!newSilName.trim()) {
      toast.error("Please enter a name for the silhouette.");
      return;
    }
    if (!newSilSvg.trim()) {
      toast.error("Please provide the SVG code.");
      return;
    }

    setSettings((prev) => ({
      ...prev,
      silhouettes: [
        ...prev.silhouettes,
        {
          id: newSilName.toLowerCase().replace(/\s+/g, "-"),
          name: newSilName,
          basePrice: Number(newSilPrice) || 500,
          svg: newSilSvg,
        },
      ],
    }));

    setIsModalOpen(false);
  };

  const removeSilhouette = (id: string) => {
    if (confirm("Remove this silhouette?")) {
      setSettings((prev) => ({
        ...prev,
        silhouettes: prev.silhouettes.filter((s) => s.id !== id),
      }));
    }
  };

  if (loading) return <div className="p-8 font-sans text-gray-500">Loading curator backend settings...</div>;

  return (
    <div className="flex-1 overflow-auto bg-[#FDFCFB] font-sans">
      <div className="max-w-5xl mx-auto p-8">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Curator Flow & Pricing Settings</h1>
            <p className="text-sm text-gray-500">Configure backend base prices, adjustment values, silhouettes, and pieces.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 rounded"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Backend Note Banner matching diagram */}
        <div className="p-4 mb-8 bg-[#FFF8F0] border border-[#FAD6A5] rounded-lg text-xs leading-relaxed text-[#7A4B1A]">
          <span className="font-bold uppercase tracking-wider block mb-1">
            ⚙ ALL PRICES SHOWN HERE ARE FOR WEBSITE BACKEND ONLY
          </span>
          Editable by brand owner. Customers will see only the <strong>Final Price</strong> (or starting price for theme-based embroidery) and will <strong>never</strong> see product base prices, silhouette base prices, or individual adjustments.
        </div>

        {/* =========================================================
            SECTION 1: BACKEND TECHNIQUE VALUES
           ========================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-gray-700" />
            <h2 className="font-serif text-lg font-bold text-gray-900">Backend Technique Values (Adjustments)</h2>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Price adjustment added when the customer selects Printed vs Embroidered technique in Original Illustration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/60">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                Printed Technique Value (₹)
              </label>
              <input
                type="number"
                value={settings.pricing.techniqueValues.printed}
                onChange={(e) => handleTechniqueChange("printed", Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:border-gray-900 focus:outline-none"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Default: +₹200</span>
            </div>

            <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/60">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                Embroidered Technique Value (₹)
              </label>
              <input
                type="number"
                value={settings.pricing.techniqueValues.embroidered}
                onChange={(e) => handleTechniqueChange("embroidered", Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:border-gray-900 focus:outline-none"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Default: +₹500</span>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 2: BACKEND SIZE VALUES
           ========================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-gray-700" />
            <h2 className="font-serif text-lg font-bold text-gray-900">Backend Size Values (Adjustments)</h2>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Adjustment values applied per size (can be negative, zero, or positive).
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(settings.pricing.sizeValues).map(([sKey, sVal]) => (
              <div key={sKey} className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 text-center">
                <span className="text-sm font-bold uppercase text-gray-800 block mb-2">{sKey}</span>
                <input
                  type="number"
                  value={sVal as number}
                  onChange={(e) => handleSizeAdjustmentChange(sKey, Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-center text-sm font-mono focus:border-gray-900 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">₹ adjustment</span>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            SECTION 3: BACKEND LINEN COLOUR VALUES
           ========================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-gray-700" />
            <h2 className="font-serif text-lg font-bold text-gray-900">Backend Linen Colours & Adjustments</h2>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Linen color options available for Embroidered, Theme-Based, and Solid Linen.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings.pricing.linenColors.map((color) => (
              <div key={color.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300 shadow-sm shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-800 block">{color.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{color.hex}</span>
                  </div>
                </div>

                <div className="w-24">
                  <label className="text-[9px] uppercase tracking-wider text-gray-400 block mb-1">+ ₹</label>
                  <input
                    type="number"
                    value={color.adjustment}
                    onChange={(e) => handleLinenAdjustmentChange(color.id, Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-mono text-right focus:border-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            SECTION 4: BACKEND SILHOUETTE BASE PRICES
           ========================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Shirt className="w-5 h-5 text-gray-700" />
              <h2 className="font-serif text-lg font-bold text-gray-900">Silhouettes & Base Prices</h2>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-900 px-3.5 py-1.5 text-xs font-medium hover:bg-gray-200 transition-colors rounded"
            >
              <Plus size={14} />
              Add Silhouette
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Base price editable per silhouette (e.g., Classic Point Collar: ₹500, Cuban Collar: ₹600, Mandarin Collar: ₹700).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {settings.silhouettes.map((sil) => (
              <div key={sil.id} className="relative p-5 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center group">
                <button
                  onClick={() => removeSilhouette(sil.id)}
                  className="absolute top-2 right-2 p-1 bg-white border border-gray-200 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} />
                </button>
                <div className="w-24 h-24 mb-3 text-gray-700" dangerouslySetInnerHTML={{ __html: sil.svg }} />
                <span className="text-xs font-bold uppercase text-gray-800 text-center mb-3">{sil.name}</span>

                <div className="w-full flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Base Price:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">₹</span>
                    <input
                      type="number"
                      value={sil.basePrice || 500}
                      onChange={(e) => handleSilhouetteBasePriceChange(sil.id, Number(e.target.value))}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-xs font-mono text-right focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================
            SECTION 5: BACKEND PRODUCT PIECES (CANVASES)
           ========================================================= */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-gray-900 mb-1">Original Illustration Pieces & Base Prices</h2>
          <p className="text-xs text-gray-500 mb-6">
            Configured pieces and base prices for Printed vs Embroidered techniques.
          </p>

          {/* Printed Pieces */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Printed Pieces</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {settings.pricing.pieces?.printed?.map((piece: any) => (
              <div key={piece.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 flex gap-4 items-center">
                <div className="w-14 h-16 relative rounded overflow-hidden bg-gray-200 shrink-0">
                  {piece.image && <Image src={piece.image} alt={piece.name} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-gray-900 block truncate">{piece.name}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-400">₹</span>
                    <input
                      type="number"
                      value={piece.basePrice}
                      onChange={(e) => handlePiecePriceChange("printed", piece.id, Number(e.target.value))}
                      className="w-24 border border-gray-300 rounded px-2 py-0.5 text-xs font-mono focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Embroidered Pieces */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Embroidered Pieces</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings.pricing.pieces?.embroidered?.map((piece: any) => (
              <div key={piece.id} className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 flex gap-4 items-center">
                <div className="w-14 h-16 relative rounded overflow-hidden bg-gray-200 shrink-0">
                  {piece.image && <Image src={piece.image} alt={piece.name} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-gray-900 block truncate">{piece.name}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-400">₹</span>
                    <input
                      type="number"
                      value={piece.basePrice}
                      onChange={(e) => handlePiecePriceChange("embroidered", piece.id, Number(e.target.value))}
                      className="w-24 border border-gray-300 rounded px-2 py-0.5 text-xs font-mono focus:border-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Silhouette Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full shadow-2xl p-6 relative rounded-lg">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>

            <h2 className="font-serif text-2xl text-gray-900 mb-6">Add New Silhouette</h2>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                  Silhouette Name
                </label>
                <input
                  type="text"
                  value={newSilName}
                  onChange={(e) => setNewSilName(e.target.value)}
                  placeholder="e.g. Camp Collar"
                  className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                  Base Price (₹)
                </label>
                <input
                  type="number"
                  value={newSilPrice}
                  onChange={(e) => setNewSilPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded px-4 py-2 text-sm font-mono focus:border-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Custom Icon (SVG Code)
                </label>
                <textarea
                  value={newSilSvg}
                  onChange={(e) => setNewSilSvg(e.target.value)}
                  rows={5}
                  className="w-full border border-gray-300 rounded p-3 text-xs font-mono bg-gray-50 focus:border-gray-900 focus:outline-none resize-none"
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 p-4 flex flex-col items-center justify-center gap-2 rounded">
                <span className="text-xs text-gray-500 font-medium">Icon Preview</span>
                <div className="w-16 h-16 text-gray-700" dangerouslySetInnerHTML={{ __html: newSilSvg || "" }} />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border border-gray-300 rounded py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddSilhouette}
                className="flex-1 bg-gray-900 text-white rounded py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors"
              >
                Add Silhouette
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
