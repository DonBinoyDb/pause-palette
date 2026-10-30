"use client";

import { useState, useEffect } from "react";
import { Plus, X, Save, Palette, Shirt, Sparkles, Scissors, Check, Trash2, ShoppingBag, Upload } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { DEFAULT_PRICING, DEFAULT_SILHOUETTES, DEFAULT_VISIBILITY, DEFAULT_MODES } from "@/lib/curatorDefaults";
import StickySaveBar from "@/components/admin/StickySaveBar";

type Tab = "illustration" | "embroidery" | "solid";

function getSilhouetteSizes(
  sil: any,
  globalSizeValues?: Record<string, number>
) {
  if (sil?.sizes && Array.isArray(sil.sizes) && sil.sizes.length > 0) {
    return sil.sizes.map((s: any) => ({
      size: String(s.size),
      price: Number(s.price) || 0,
      enabled: s.enabled !== false,
    }));
  }
  const fallback = globalSizeValues || DEFAULT_PRICING.sizeValues;
  const base = Number(sil?.basePrice) || 500;
  return Object.entries(fallback).map(([sz, adj]) => ({
    size: sz,
    price: base + Number(adj || 0),
    enabled: true,
  }));
}

export default function CuratorSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("illustration");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store products list for picking
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");

  // Modal State for Silhouette
  const [isSilModalOpen, setIsSilModalOpen] = useState(false);
  const [newSilName, setNewSilName] = useState("");
  const [newSilPrice, setNewSilPrice] = useState("500");
  const [newSilSvg, setNewSilSvg] = useState(`<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full stroke-current">
  <path d="M30 20 L40 28 L50 22 L60 28 L70 20 L85 36 L75 44 L70 34 L70 88 L30 88 L30 34 L25 44 L15 36 Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M50 22 L50 88" stroke-width="1" stroke-dasharray="1 3"/>
  <circle cx="50" cy="40" r="1.2" fill="currentColor"/>
</svg>`);
  const [uploadingSilId, setUploadingSilId] = useState<string | null>(null);
  const [newSilUploading, setNewSilUploading] = useState(false);

  // Modal State for Store Product Picker
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"printed" | "embroidered">("printed");

  // Modal State for adding custom Piece
  const [isPieceModalOpen, setIsPieceModalOpen] = useState(false);
  const [newPieceTechnique, setNewPieceTechnique] = useState<"printed" | "embroidered">("printed");
  const [newPieceName, setNewPieceName] = useState("");
  const [newPiecePrice, setNewPiecePrice] = useState("1800");
  const [newPieceImage, setNewPieceImage] = useState("/images/Coverpic1.jpeg");

  // Modal State for adding new linen color
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#8A9A86");
  const [newColorAdjustment, setNewColorAdjustment] = useState("0");

  // Modal State for Customizing Silhouette Sizes & Pricing
  const [isSilSizesModalOpen, setIsSilSizesModalOpen] = useState(false);
  const [editingSilId, setEditingSilId] = useState<string | null>(null);
  const [editingSilSizes, setEditingSilSizes] = useState<Array<{ size: string; price: number; enabled: boolean }>>([]);
  const [editingSilBasePrice, setEditingSilBasePrice] = useState<number>(500);
  const [newCustomSizeName, setNewCustomSizeName] = useState("");
  const [newCustomSizePrice, setNewCustomSizePrice] = useState("500");

  // Two tabs inside Original Illustration: Printed vs Embroidered
  const [illustrationTab, setIllustrationTab] = useState<"printed" | "embroidered">("printed");

  // Settings State
  const [settings, setSettings] = useState<{
    visibility: any;
    modes: any;
    canvasProductIds: string[];
    silhouettes: any[];
    pricing: {
      techniqueValues: { printed: number; embroidered: number };
      sizeValues: Record<string, number>;
      linenColors: Array<{ id: string; name: string; hex: string; adjustment: number }>;
      pieces: { printed: any[]; embroidered: any[] };
    };
  }>({
    visibility: DEFAULT_VISIBILITY,
    modes: DEFAULT_MODES,
    canvasProductIds: [] as string[],
    silhouettes: DEFAULT_SILHOUETTES as any[],
    pricing: DEFAULT_PRICING,
  });

  useEffect(() => {
    fetchSettings();
    fetchStoreProducts();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/curator-settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          visibility: data.visibility || DEFAULT_VISIBILITY,
          modes: data.modes || DEFAULT_MODES,
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

  const fetchStoreProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setStoreProducts(data);
      }
    } catch (error) {
      console.error("Error loading store products:", error);
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
          modes: settings.modes,
          canvasProductIds: settings.canvasProductIds,
          silhouettes: settings.silhouettes,
          pricing: settings.pricing,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("All curator settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Helper to update specific mode config
  const updateModeConfig = (mode: "illustration" | "embroidery" | "solid", field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      modes: {
        ...prev.modes,
        [mode]: {
          ...prev.modes[mode],
          [field]: value,
        },
      },
    }));
  };

  // Silhouette toggle per mode
  const toggleModeSilhouette = (mode: "illustration" | "embroidery" | "solid", silId: string) => {
    const current = settings.modes[mode]?.silhouettes || [];
    const updated = current.includes(silId) ? current.filter((id: string) => id !== silId) : [...current, silId];
    updateModeConfig(mode, "silhouettes", updated);
  };

  // Linen color toggle per mode
  const toggleModeColor = (mode: "embroidery" | "solid", colorId: string) => {
    const current = settings.modes[mode]?.linenColors || [];
    const updated = current.includes(colorId) ? current.filter((id: string) => id !== colorId) : [...current, colorId];
    updateModeConfig(mode, "linenColors", updated);
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

  const renderSilIcon = (sil: any) => {
    const isUrl = sil.image || (sil.svg && (sil.svg.startsWith("http") || sil.svg.startsWith("/") || sil.svg.startsWith("data:")));
    if (isUrl) {
      return (
        <img
          src={sil.image || sil.svg}
          alt={sil.name}
          className="w-16 h-16 object-contain"
        />
      );
    }
    if (sil.svg && sil.svg.includes("<svg")) {
      return (
        <div
          className="w-16 h-16 flex items-center justify-center text-gray-800"
          dangerouslySetInnerHTML={{ __html: sil.svg }}
        />
      );
    }
    return (
      <div className="w-16 h-16 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
        <Shirt className="w-8 h-8 stroke-[1.2]" />
      </div>
    );
  };

  const handleUploadSilhouetteIcon = async (silId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSilId(silId);
      toast.loading("Uploading silhouette icon...", { id: `sil-upload-${silId}` });

      let newSvgOrUrl = "";

      if (file.name.endsWith(".svg") || file.type.includes("svg")) {
        try {
          const text = await file.text();
          if (text.includes("<svg")) {
            newSvgOrUrl = text;
          }
        } catch {}
      }

      if (!newSvgOrUrl) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (json.success && json.url) {
          newSvgOrUrl = json.url;
        } else {
          throw new Error(json.message || "Failed to upload icon");
        }
      }

      setSettings((prev) => ({
        ...prev,
        silhouettes: prev.silhouettes.map((s: any) =>
          s.id === silId ? { ...s, svg: newSvgOrUrl, image: newSvgOrUrl } : s
        ),
      }));

      toast.success("Silhouette icon updated! Click 'Save Changes' to apply.", { id: `sil-upload-${silId}` });
    } catch (err: any) {
      console.error("Error uploading silhouette icon:", err);
      toast.error(err.message || "Failed to upload icon", { id: `sil-upload-${silId}` });
    } finally {
      setUploadingSilId(null);
      e.target.value = "";
    }
  };

  const handleNewSilUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setNewSilUploading(true);
      toast.loading("Uploading icon...", { id: "new-sil-upload" });

      if (file.name.endsWith(".svg") || file.type.includes("svg")) {
        try {
          const text = await file.text();
          if (text.includes("<svg")) {
            setNewSilSvg(text);
            toast.success("SVG icon loaded!", { id: "new-sil-upload" });
            return;
          }
        } catch {}
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setNewSilSvg(json.url);
        toast.success("Icon uploaded successfully!", { id: "new-sil-upload" });
      } else {
        throw new Error(json.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload icon", { id: "new-sil-upload" });
    } finally {
      setNewSilUploading(false);
      e.target.value = "";
    }
  };

  const handlePiecePriceChange = (technique: "printed" | "embroidered", pieceId: string, basePrice: number) => {
    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        pieces: {
          ...prev.pricing.pieces,
          [technique]: prev.pricing.pieces[technique].map((p: any) =>
            p.id === pieceId ? { ...p, basePrice } : p
          ),
        },
      },
    }));
  };

  const removePiece = (technique: "printed" | "embroidered", pieceId: string) => {
    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        pieces: {
          ...prev.pricing.pieces,
          [technique]: prev.pricing.pieces[technique].filter((p: any) => p.id !== pieceId),
        },
      },
    }));
    toast.success("Piece removed.");
  };

  // Add piece directly from store products
  const selectStoreProductAsPiece = (product: any) => {
    const defaultPrice = pickerTarget === "printed" ? 1800 : 2200;
    const newPiece = {
      id: `prod-${product.id}`,
      name: product.name,
      basePrice: product.price || defaultPrice,
      image: product.images?.[0] || "/images/Coverpic1.jpeg",
    };

    setSettings((prev) => {
      const existing = prev.pricing.pieces[pickerTarget] || [];
      if (existing.some((p: any) => p.id === newPiece.id || p.name === newPiece.name)) {
        toast.error("This product is already in the pieces list.");
        return prev;
      }
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          pieces: {
            ...prev.pricing.pieces,
            [pickerTarget]: [...existing, newPiece],
          },
        },
      };
    });

    setIsStorePickerOpen(false);
    toast.success(`Added "${product.name}" to ${pickerTarget} pieces!`);
  };

  const confirmAddPiece = () => {
    if (!newPieceName.trim()) {
      toast.error("Please enter a piece name.");
      return;
    }
    const newPiece = {
      id: newPieceName.toLowerCase().replace(/\s+/g, "-"),
      name: newPieceName,
      basePrice: Number(newPiecePrice) || 1800,
      image: newPieceImage || "/images/Coverpic1.jpeg",
    };
    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        pieces: {
          ...prev.pricing.pieces,
          [newPieceTechnique]: [...(prev.pricing.pieces[newPieceTechnique] || []), newPiece],
        },
      },
    }));
    setIsPieceModalOpen(false);
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

    const id = newSilName.toLowerCase().replace(/\s+/g, "-");
    const basePriceNum = Number(newSilPrice) || 500;
    const initialSizes = getSilhouetteSizes({ basePrice: basePriceNum }, settings.pricing.sizeValues);

    setSettings((prev) => ({
      ...prev,
      silhouettes: [
        ...prev.silhouettes,
        {
          id,
          name: newSilName.trim(),
          basePrice: basePriceNum,
          sizes: initialSizes,
          svg: newSilSvg,
          ...(newSilSvg.startsWith("http") || newSilSvg.startsWith("/") ? { image: newSilSvg } : {}),
        },
      ],
      modes: {
        ...prev.modes,
        illustration: {
          ...prev.modes.illustration,
          silhouettes: [...(prev.modes.illustration?.silhouettes || []), id],
        },
        embroidery: {
          ...prev.modes.embroidery,
          silhouettes: [...(prev.modes.embroidery?.silhouettes || []), id],
        },
        solid: {
          ...prev.modes.solid,
          silhouettes: [...(prev.modes.solid?.silhouettes || []), id],
        },
      },
    }));

    setIsSilModalOpen(false);
    setNewSilName("");
    setNewSilPrice("500");
    setNewSilSvg("");
    toast.success("Silhouette added! Click 'Save Changes' to apply.");
  };

  const openSilSizesModal = (sil: any) => {
    setEditingSilId(sil.id);
    const currentSizes = getSilhouetteSizes(sil, settings.pricing.sizeValues);
    setEditingSilSizes(JSON.parse(JSON.stringify(currentSizes)));
    setEditingSilBasePrice(Number(sil.basePrice) || 500);
    setNewCustomSizeName("");
    setNewCustomSizePrice(String(sil.basePrice || 500));
    setIsSilSizesModalOpen(true);
  };

  const toggleEditingSilSizeEnabled = (sz: string) => {
    setEditingSilSizes((prev) =>
      prev.map((item) =>
        item.size === sz ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleEditingSilSizePriceChange = (sz: string, price: number) => {
    setEditingSilSizes((prev) =>
      prev.map((item) =>
        item.size === sz ? { ...item, price } : item
      )
    );
  };

  const handleAddCustomSizeToSil = () => {
    if (!newCustomSizeName.trim()) {
      toast.error("Please enter a size name (e.g. S, XL, 3XL).");
      return;
    }
    const cleanName = newCustomSizeName.trim().toUpperCase();
    if (editingSilSizes.some((item) => item.size.toUpperCase() === cleanName)) {
      toast.error(`Size ${cleanName} already exists in this silhouette.`);
      return;
    }
    const priceNum = Number(newCustomSizePrice) || editingSilBasePrice;
    setEditingSilSizes((prev) => [
      ...prev,
      { size: cleanName, price: priceNum, enabled: true },
    ]);
    setNewCustomSizeName("");
    toast.success(`Added size ${cleanName} to silhouette.`);
  };

  const handleRemoveSizeFromSil = (sz: string) => {
    setEditingSilSizes((prev) => prev.filter((item) => item.size !== sz));
  };

  const handleSaveSilSizes = () => {
    if (!editingSilId) return;
    setSettings((prev) => ({
      ...prev,
      silhouettes: prev.silhouettes.map((s: any) =>
        s.id === editingSilId
          ? {
              ...s,
              basePrice: editingSilBasePrice,
              sizes: editingSilSizes,
            }
          : s
      ),
    }));
    setIsSilSizesModalOpen(false);
    toast.success("Silhouette sizes updated! Remember to click 'Save Changes' to apply.");
  };

  const quickSetSilSizes = (preset: "all" | "sl" | "s_m_l_xl") => {
    if (preset === "all") {
      setEditingSilSizes((prev) => prev.map((s) => ({ ...s, enabled: true })));
    } else if (preset === "sl") {
      setEditingSilSizes((prev) =>
        prev.map((s) => ({
          ...s,
          enabled: s.size.toUpperCase() === "S" || s.size.toUpperCase() === "L",
        }))
      );
    } else if (preset === "s_m_l_xl") {
      setEditingSilSizes((prev) =>
        prev.map((s) => ({
          ...s,
          enabled: ["S", "M", "L", "XL"].includes(s.size.toUpperCase()),
        }))
      );
    }
  };

  const renderSilhouetteCard = (sil: any, modeKey: "illustration" | "embroidery" | "solid") => {
    const isEnabled = (settings.modes[modeKey]?.silhouettes || []).includes(sil.id);
    const silSizes = getSilhouetteSizes(sil, settings.pricing.sizeValues);
    const activeSizes = silSizes.filter((s: any) => s.enabled);

    return (
      <div
        key={sil.id}
        className={`p-4 rounded-xl border transition-all flex flex-col justify-between bg-white ${
          isEnabled ? "border-gray-300 ring-1 ring-gray-200 shadow-sm" : "border-gray-200 opacity-60"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={() => toggleModeSilhouette(modeKey, sil.id)}
              className="rounded border-gray-300 text-[#79A7D3] focus:ring-[#79A7D3] cursor-pointer"
            />
            <span className="font-garamond text-xs uppercase tracking-wider font-semibold text-gray-900">
              {sil.name}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-3 text-gray-700">
          {renderSilIcon(sil)}
          <label className="text-[11px] text-[#79A7D3] hover:text-[#5b84ac] flex items-center gap-1 cursor-pointer font-medium mt-2">
            <Upload className="w-3 h-3" />
            <span>{uploadingSilId === sil.id ? "Uploading..." : "Upload / Replace Icon"}</span>
            <input
              type="file"
              accept="image/*,.svg"
              disabled={uploadingSilId === sil.id}
              className="hidden"
              onChange={(e) => handleUploadSilhouetteIcon(sil.id, e)}
            />
          </label>
        </div>

        {/* Sizes & Pricing Summary Badge */}
        <div className="my-2.5 p-2 bg-gray-50/90 border border-gray-200/80 rounded-lg">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-gray-500 font-medium">Available Sizes:</span>
            <span className="text-[10px] font-bold text-gray-700 bg-white px-1.5 py-0.5 rounded border border-gray-200">
              {activeSizes.length} active
            </span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {activeSizes.length > 0 ? (
              activeSizes.map((s: any) => (
                <span
                  key={s.size}
                  className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-800 font-medium whitespace-nowrap shadow-2xs"
                >
                  <strong className="text-gray-900">{s.size}</strong>: ₹{s.price}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-red-500 italic">No sizes enabled</span>
            )}
          </div>
        </div>

        {/* Customize Sizes & Prices Button */}
        <button
          type="button"
          onClick={() => openSilSizesModal(sil)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#EEF4FA] hover:bg-[#E0ECF8] text-[#3B6D9E] border border-[#CCDFF2] rounded-lg text-xs font-semibold transition-colors cursor-pointer mb-2.5 shadow-2xs"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Customize Sizes & Prices</span>
        </button>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">Base Price:</span>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">₹</span>
            <input
              type="number"
              value={sil.basePrice}
              onChange={(e) => handleSilhouetteBasePriceChange(sil.id, Number(e.target.value))}
              className="w-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded text-right font-semibold text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#79A7D3] outline-none"
            />
          </div>
        </div>
      </div>
    );
  };

  const confirmAddColor = () => {
    if (!newColorName.trim()) {
      toast.error("Please enter a color name.");
      return;
    }
    const id = newColorName.toLowerCase().replace(/\s+/g, "-");
    const newColor = {
      id,
      name: newColorName,
      hex: newColorHex || "#000000",
      adjustment: Number(newColorAdjustment) || 0,
    };

    setSettings((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        linenColors: [...prev.pricing.linenColors, newColor],
      },
      modes: {
        ...prev.modes,
        embroidery: {
          ...prev.modes.embroidery,
          linenColors: [...(prev.modes.embroidery?.linenColors || []), id],
        },
        solid: {
          ...prev.modes.solid,
          linenColors: [...(prev.modes.solid?.linenColors || []), id],
        },
      },
    }));

    setIsColorModalOpen(false);
    toast.success("Linen color added!");
  };

  const removeColor = (colorId: string) => {
    if (confirm("Remove this linen colour?")) {
      setSettings((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          linenColors: prev.pricing.linenColors.filter((c) => c.id !== colorId),
        },
      }));
      toast.success("Linen color removed.");
    }
  };

  const filteredStoreProducts = storeProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header Banner (Normal flow, not sticky) */}
      <div className="pb-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 font-garamond">
            Curate Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize the step-by-step choices, product pieces, silhouettes, sizes, and pricing formulas.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* 3 Main Tabs: Original Illustration, Theme-Based Embroidery, Solid Linen */}
      <div className="flex border-b border-gray-200 space-x-2 overflow-x-auto pb-px">
        
        {/* Tab 1 */}
        <button
          onClick={() => setActiveTab("illustration")}
          className={`flex items-center gap-2 py-3 px-4 sm:px-5 border-b-2 font-medium text-xs sm:text-sm transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "illustration"
              ? "border-[#79A7D3] text-gray-900 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/flower.svg" alt="" className="w-4 h-4 object-contain inline" />
          <span>Original Illustration</span>
        </button>

        {/* Tab 2 */}
        <button
          onClick={() => setActiveTab("embroidery")}
          className={`flex items-center gap-2 py-3 px-4 sm:px-5 border-b-2 font-medium text-xs sm:text-sm transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "embroidery"
              ? "border-[#79A7D3] text-gray-900 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/needle.png" alt="" className="w-4 h-4 object-contain inline" />
          <span>Theme-Based Embroidery</span>
        </button>

        {/* Tab 3 */}
        <button
          onClick={() => setActiveTab("solid")}
          className={`flex items-center gap-2 py-3 px-4 sm:px-5 border-b-2 font-medium text-xs sm:text-sm transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === "solid"
              ? "border-[#79A7D3] text-gray-900 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
          }`}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-[#7C9D86] inline-block" />
          <span>Solid Linen</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORIGINAL ILLUSTRATION                                             */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 1: ORIGINAL ILLUSTRATION                                             */}
      {/* ========================================================================= */}
      {activeTab === "illustration" && (
        <div className="space-y-6">

          {/* TWO TABS FOR ORIGINAL ILLUSTRATION */}
          <div className="flex border-b border-gray-200 gap-3">
            <button
              type="button"
              onClick={() => {
                setIllustrationTab("printed");
                setPickerTarget("printed");
              }}
              className={`flex items-center gap-2.5 py-3 px-6 border-b-2 font-medium text-sm transition-all cursor-pointer ${
                illustrationTab === "printed"
                  ? "border-gray-900 text-gray-900 font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="font-garamond text-base">Printed</span>
              <span className="text-[10px] bg-blue-50 text-[#79A7D3] border border-blue-200 px-2.5 py-0.5 rounded-full font-sans font-medium">
                {settings.pricing.pieces?.printed?.length || 0} Pieces
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIllustrationTab("embroidered");
                setPickerTarget("embroidered");
              }}
              className={`flex items-center gap-2.5 py-3 px-6 border-b-2 font-medium text-sm transition-all cursor-pointer ${
                illustrationTab === "embroidered"
                  ? "border-gray-900 text-gray-900 font-semibold"
                  : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="font-garamond text-base">Embroidered</span>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-sans font-medium">
                {settings.pricing.pieces?.embroidered?.length || 0} Pieces
              </span>
            </button>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* SUB-TAB A: PRINTED FLOW                                               */}
          {/* --------------------------------------------------------------------- */}
          {illustrationTab === "printed" && (
            <div className="space-y-7">
              {/* Intro Banner */}
              <div className="bg-[#FAF9F7] border border-gray-200/90 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-garamond font-medium text-base text-gray-900 uppercase tracking-wider">
                    ORIGINAL ILLUSTRATION — PRINTED
                  </h3>
                  <p className="text-xs text-gray-500 font-garamond mt-0.5">
                    Configure the flow for digital art print pieces. Linen colour is omitted since print uses the base garment canvas.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm block">
                    Final Price = Product Base + Technique (+₹{settings.pricing.techniqueValues?.printed ?? 200}) + Silhouette Base + Size Value
                  </span>
                </div>
              </div>

              {/* Step 1: Who is it for? */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">1</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Who is it for? (Audience)</h4>
                    <p className="text-xs text-gray-500">Gender fit options available for printed pieces.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="px-5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Men&apos;s
                  </div>
                  <div className="px-5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Women&apos;s
                  </div>
                </div>
              </div>

              {/* Step 2: Technique Value (Printed) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">2</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Technique (Backend Technique Value for Printed)</h4>
                    <p className="text-xs text-gray-500">Adjustment amount added for the Printed technique.</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/60 flex items-center justify-between max-w-md">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Printed Adjustment</span>
                    <span className="text-xs text-gray-400 block">Digital art print interpretation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">+₹</span>
                    <input
                      type="number"
                      value={settings.pricing.techniqueValues?.printed ?? 200}
                      onChange={(e) => handleTechniqueChange("printed", Number(e.target.value))}
                      className="w-24 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-right font-medium focus:ring-1 focus:ring-[#79A7D3] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Choose from our pieces (Printed) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">3</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Choose from our pieces (Printed Pieces)</h4>
                      <p className="text-xs text-gray-500">
                        Select which artwork designs appear for Printed pieces, with editable Base Prices.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget("printed");
                        setIsStorePickerOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#79A7D3] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add from Store Products
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPieceTechnique("printed");
                        setIsPieceModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Custom Piece
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(settings.pricing.pieces?.printed || []).map((piece: any) => (
                    <div
                      key={piece.id}
                      className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col gap-3 group relative shadow-sm hover:border-gray-300 transition-all"
                    >
                      <div className="relative w-full h-36 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                        {piece.image && (
                          <Image src={piece.image} alt={piece.name} fill className="object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removePiece("printed", piece.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 hover:bg-red-50 shadow-sm transition-colors cursor-pointer"
                          title="Remove piece"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="font-garamond font-medium text-sm text-gray-900 truncate">
                          {piece.name}
                        </span>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Backend Base Price:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">₹</span>
                            <input
                              type="number"
                              value={piece.basePrice}
                              onChange={(e) =>
                                handlePiecePriceChange("printed", piece.id, Number(e.target.value))
                              }
                              className="w-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded text-right font-semibold text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#79A7D3] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: Choose your Silhouette */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">4</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Choose your Silhouette (Drawings & Base Prices)</h4>
                      <p className="text-xs text-gray-500">
                        Silhouettes and editable Base Prices for printed pieces.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSilModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Silhouette
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {settings.silhouettes.map((sil: any) => renderSilhouetteCard(sil, "illustration"))}
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* SUB-TAB B: EMBROIDERED FLOW                                           */}
          {/* --------------------------------------------------------------------- */}
          {illustrationTab === "embroidered" && (
            <div className="space-y-7">
              {/* Intro Banner */}
              <div className="bg-[#FAF9F7] border border-gray-200/90 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-garamond font-medium text-base text-gray-900 uppercase tracking-wider">
                    ORIGINAL ILLUSTRATION — EMBROIDERED
                  </h3>
                  <p className="text-xs text-gray-500 font-garamond mt-0.5">
                    Configure the flow for thread embroidery pieces. Includes linen colour selection.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm block">
                    Final Price = Product Base + Technique (+₹{settings.pricing.techniqueValues?.embroidered ?? 500}) + Silhouette Base + Size Value + Linen Colour Value
                  </span>
                </div>
              </div>

              {/* Step 1: Who is it for? */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">1</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Who is it for? (Audience)</h4>
                    <p className="text-xs text-gray-500">Gender fit options available for embroidered pieces.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="px-5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Men&apos;s
                  </div>
                  <div className="px-5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Women&apos;s
                  </div>
                </div>
              </div>

              {/* Step 2: Technique Value (Embroidered) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">2</div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Technique (Backend Technique Value for Embroidered)</h4>
                    <p className="text-xs text-gray-500">Adjustment amount added for the Embroidered technique.</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/60 flex items-center justify-between max-w-md">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Embroidered Adjustment</span>
                    <span className="text-xs text-gray-400 block">Thread embroidery interpretation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">+₹</span>
                    <input
                      type="number"
                      value={settings.pricing.techniqueValues?.embroidered ?? 500}
                      onChange={(e) => handleTechniqueChange("embroidered", Number(e.target.value))}
                      className="w-24 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-right font-medium focus:ring-1 focus:ring-[#79A7D3] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Choose from our pieces (Embroidered) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">3</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Choose from our pieces (Embroidered Pieces)</h4>
                      <p className="text-xs text-gray-500">
                        Select which artwork designs appear for Embroidered pieces, with editable Base Prices.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget("embroidered");
                        setIsStorePickerOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#79A7D3] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add from Store Products
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPieceTechnique("embroidered");
                        setIsPieceModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Custom Piece
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(settings.pricing.pieces?.embroidered || []).map((piece: any) => (
                    <div
                      key={piece.id}
                      className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col gap-3 group relative shadow-sm hover:border-gray-300 transition-all"
                    >
                      <div className="relative w-full h-36 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                        {piece.image && (
                          <Image src={piece.image} alt={piece.name} fill className="object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removePiece("embroidered", piece.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 hover:bg-red-50 shadow-sm transition-colors cursor-pointer"
                          title="Remove piece"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="font-garamond font-medium text-sm text-gray-900 truncate">
                          {piece.name}
                        </span>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Backend Base Price:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">₹</span>
                            <input
                              type="number"
                              value={piece.basePrice}
                              onChange={(e) =>
                                handlePiecePriceChange("embroidered", piece.id, Number(e.target.value))
                              }
                              className="w-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded text-right font-semibold text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#79A7D3] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: Choose your Silhouette */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">4</div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Choose your Silhouette (Drawings & Base Prices)</h4>
                      <p className="text-xs text-gray-500">
                        Silhouettes and editable Base Prices for embroidered pieces.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSilModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Silhouette
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {settings.silhouettes.map((sil: any) => renderSilhouetteCard(sil, "illustration"))}
                </div>
              </div>

              {/* Step 5: Choose your Linen colour */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">5</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900">Choose your Linen colour</h4>
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-purple-100 text-purple-800 rounded">
                          Embroidered Only
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Set surcharge adjustments per colour for embroidered pieces.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsColorModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Colour
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                  {settings.pricing.linenColors.map((color) => (
                    <div
                      key={color.id}
                      className="p-3 rounded-xl border border-gray-200 bg-white flex flex-col items-center gap-2 relative shadow-sm"
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-gray-300 shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs font-garamond uppercase tracking-wider font-medium text-gray-800">
                        {color.name}
                      </span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-400">+₹</span>
                        <input
                          type="number"
                          value={color.adjustment}
                          onChange={(e) => handleLinenAdjustmentChange(color.id, Number(e.target.value))}
                          className="w-16 px-1.5 py-1 bg-gray-50 border border-gray-300 rounded text-center font-medium focus:bg-white focus:ring-1 focus:ring-[#79A7D3] outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeColor(color.id)}
                        className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Remove colour"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: THEME-BASED EMBROIDERY                                            */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 2: THEME-BASED EMBROIDERY                                            */}
      {/* ========================================================================= */}
      {activeTab === "embroidery" && (
        <div className="space-y-7">

          {/* Intro Card */}
          <div className="bg-[#FAF9F7] border border-gray-200/90 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/needle.png" alt="" className="h-8 w-auto object-contain" />
              </div>
              <div>
                <h3 className="font-garamond font-medium text-base text-gray-900 uppercase tracking-wider">
                  THEME-BASED EMBROIDERY
                </h3>
                <p className="text-xs text-gray-500 font-garamond">
                  Your idea, our illustration. 6-step flow (Audience → Silhouette → Size → Linen Colour → Theme → Submit).
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm block">
                Starting Price = Base Fee (+₹{settings.modes.embroidery?.startingPrice ?? 2000}) + Silhouette Base + Size Value + Linen Colour Value
              </span>
            </div>
          </div>

          {/* Step 1: Who is it for? */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">1</div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Who is it for? (Audience)</h4>
                <p className="text-xs text-gray-500">Gender fit options available for custom embroidery.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="px-5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Men&apos;s
              </div>
              <div className="px-5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Women&apos;s
              </div>
            </div>
          </div>

          {/* Step 2: Choose your Silhouette */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">2</div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Choose your Silhouette (Drawings & Base Prices)</h4>
                  <p className="text-xs text-gray-500">
                    Check allowed silhouettes for custom embroidery and edit their Silhouette Base Price (e.g. Classic ₹500, Cuban ₹600, Mandarin ₹700).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSilModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Silhouette
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {settings.silhouettes.map((sil: any) => renderSilhouetteCard(sil, "embroidery"))}
            </div>
          </div>

          {/* Step 3: Choose your Linen colour */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">3</div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Choose your Linen colour (Backend Linen Colour Value)</h4>
                  <p className="text-xs text-gray-500">
                    Linen colours available for embroidery and their price adjustments (Black: ₹0, Olive: +₹100, Brown: +₹100, Beige: ₹0).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsColorModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Colour
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {settings.pricing.linenColors.map((color) => {
                const isEnabled = (settings.modes.embroidery?.linenColors || []).includes(color.id);
                return (
                  <div
                    key={color.id}
                    className={`p-3 rounded-xl border transition-all bg-white flex flex-col items-center gap-2 relative shadow-sm ${
                      isEnabled ? "border-gray-300 ring-1 ring-gray-200" : "border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleModeColor("embroidery", color.id)}
                        className="rounded border-gray-300 text-[#79A7D3] focus:ring-[#79A7D3] cursor-pointer"
                        title="Enable colour for embroidery"
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(color.id)}
                        className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                        title="Remove colour"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div
                      className="w-8 h-8 rounded-full border border-gray-300 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-garamond uppercase tracking-wider font-medium text-gray-800">
                      {color.name}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-400">+₹</span>
                      <input
                        type="number"
                        value={color.adjustment}
                        onChange={(e) => handleLinenAdjustmentChange(color.id, Number(e.target.value))}
                        className="w-16 px-1.5 py-1 bg-gray-50 border border-gray-300 rounded text-center font-medium focus:bg-white focus:ring-1 focus:ring-[#79A7D3] outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 5 & 6: Share your theme & Request Configuration */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">5</div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Share your theme (Customer Prompt & Price Base)</h4>
                <p className="text-xs text-gray-500">Configure base embroidery fee, prompt textarea placeholder, and review notices.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 flex flex-col justify-between">
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">Base Embroidery Fee (₹)</label>
                  <p className="text-[11px] text-gray-500 mb-2">Base fee added to silhouette + size + colour (e.g. ₹2,000).</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-700">₹</span>
                  <input
                    type="number"
                    value={settings.modes.embroidery?.startingPrice ?? 2000}
                    onChange={(e) => updateModeConfig("embroidery", "startingPrice", Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-bold text-gray-900 focus:ring-1 focus:ring-[#79A7D3] outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 md:col-span-2 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">Prompt Textarea Placeholder</label>
                  <input
                    type="text"
                    value={settings.modes.embroidery?.placeholder || ""}
                    onChange={(e) => updateModeConfig("embroidery", "placeholder", e.target.value)}
                    placeholder="Tell us about your theme, idea or inspiration..."
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-800 focus:ring-1 focus:ring-[#79A7D3] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-900 block mb-1">Review Notice Text (Below Starting Price)</label>
                  <input
                    type="text"
                    value={settings.modes.embroidery?.reviewNotice || ""}
                    onChange={(e) => updateModeConfig("embroidery", "reviewNotice", e.target.value)}
                    placeholder="Final embroidery/design charge will be confirmed after review."
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-800 focus:ring-1 focus:ring-[#79A7D3] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SOLID LINEN                                                       */}
      {/* ========================================================================= */}
      {activeTab === "solid" && (
        <div className="space-y-6">

          {/* Intro Card */}
          <div className="bg-[#FAF9F7] border border-gray-200/90 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#EAF0F6] border border-[#D5E0EB] flex items-center justify-center p-2">
                <div className="relative w-7 h-7 flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#7C9D86] absolute top-0.5 right-0.5 shadow-sm" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#B57864] absolute bottom-0.5 left-0.5 shadow-sm" />
                </div>
              </div>
              <div>
                <h3 className="font-garamond font-semibold text-lg text-gray-900 uppercase tracking-wide">
                  SOLID LINEN
                </h3>
                <p className="text-xs text-gray-500 font-garamond italic">
                  No print, no embroidery
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs">
                Formula: Base Shirt (₹2,000) + Silhouette + Size + Colour = Final Price (₹2,700)
              </span>
            </div>
          </div>

          {/* Step 1: Who is it for? */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#4E7185] text-white flex items-center justify-center text-xs font-semibold">1</div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Who is it for? (Audience)</h4>
                <p className="text-xs text-gray-500">Gender fit options available for pure solid linen orders.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="px-5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Men
              </div>
              <div className="px-5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-800 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Women
              </div>
            </div>
          </div>

          {/* Step 2: Choose your Silhouette */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#4E7185] text-white flex items-center justify-center text-xs font-semibold">2</div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Choose your Silhouette (Drawings & Base Prices)</h4>
                  <p className="text-xs text-gray-500">
                    Check allowed silhouettes for Solid Linen and edit their Silhouette Base Price (e.g. Classic ₹500, Cuban ₹600, Mandarin ₹700).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSilModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Silhouette
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {settings.silhouettes.map((sil: any) => renderSilhouetteCard(sil, "solid"))}
            </div>
          </div>

          {/* Step 3: Choose your Linen colour */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#4E7185] text-white flex items-center justify-center text-xs font-semibold">3</div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Choose your Linen colour (Backend Linen Colour Value)</h4>
                  <p className="text-xs text-gray-500">
                    Linen colours available for Solid Linen and their adjustments (Black: ₹0, Olive: +₹100, Brown: +₹100, Beige: ₹0).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsColorModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Colour
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {settings.pricing.linenColors.map((color) => {
                const isChecked = (settings.modes.solid?.linenColors || []).includes(color.id);
                return (
                  <div
                    key={color.id}
                    className={`p-3 rounded-xl border transition-all bg-white flex flex-col items-center gap-2 relative shadow-sm ${
                      isChecked ? "border-gray-300 ring-1 ring-gray-200" : "border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleModeColor("solid", color.id)}
                        className="rounded border-gray-300 text-[#79A7D3] focus:ring-[#79A7D3] cursor-pointer"
                        title="Enable colour for solid linen"
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(color.id)}
                        className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                        title="Remove colour"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div
                      className="w-8 h-8 rounded-full border border-gray-300 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-garamond uppercase tracking-wider font-medium text-gray-800">
                      {color.name}
                    </span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-400">+₹</span>
                      <input
                        type="number"
                        value={color.adjustment}
                        onChange={(e) => handleLinenAdjustmentChange(color.id, Number(e.target.value))}
                        className="w-16 px-1.5 py-1 bg-gray-50 border border-gray-300 rounded text-center font-medium focus:bg-white focus:ring-1 focus:ring-[#79A7D3] outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 5: Base Solid Linen Fee */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#4E7185] text-white flex items-center justify-center text-xs font-semibold">5</div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Base Solid Linen Price</h4>
                <p className="text-xs text-gray-500">Base shirt price before silhouette, size, and linen colour adjustments (e.g. ₹2,000).</p>
              </div>
            </div>
            <div className="max-w-xs p-4 rounded-lg border border-gray-200 bg-gray-50/70 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Base Linen Fee:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-700">₹</span>
                <input
                  type="number"
                  value={settings.modes.solid?.basePrice ?? 2000}
                  onChange={(e) => updateModeConfig("solid", "basePrice", Number(e.target.value))}
                  className="w-24 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-bold text-gray-900 focus:ring-1 focus:ring-[#79A7D3] outline-none"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SELECT FROM STORE PRODUCTS                                        */}
      {/* ========================================================================= */}
      {isStorePickerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-garamond">
                  Choose from Store Products
                </h3>
                <p className="text-xs text-gray-500">
                  Select a product from your catalog to add as a {pickerTarget} artwork piece.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStorePickerOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search products by title..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredStoreProducts.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  No products found.
                </div>
              ) : (
                filteredStoreProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        {prod.images?.[0] ? (
                          <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block truncate max-w-xs">{prod.name}</span>
                        <span className="text-[11px] text-gray-500">Store Price: ₹{prod.price}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => selectStoreProductAsPiece(prod)}
                      className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs font-medium hover:bg-black transition-colors cursor-pointer"
                    >
                      Add as Piece
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM PIECE                                                   */}
      {/* ========================================================================= */}
      {isPieceModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-garamond">
                Add Custom Artwork Piece
              </h3>
              <button
                type="button"
                onClick={() => setIsPieceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Technique Category</label>
                <select
                  value={newPieceTechnique}
                  onChange={(e) => setNewPieceTechnique(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
                >
                  <option value="printed">Printed Piece</option>
                  <option value="embroidered">Embroidered Piece</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Piece / Artwork Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tropical Dawn"
                  value={newPieceName}
                  onChange={(e) => setNewPieceName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Backend Base Price (₹)</label>
                <input
                  type="number"
                  placeholder="1800"
                  value={newPiecePrice}
                  onChange={(e) => setNewPiecePrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Image URL / Local Path</label>
                <input
                  type="text"
                  placeholder="/images/Coverpic1.jpeg"
                  value={newPieceImage}
                  onChange={(e) => setNewPieceImage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsPieceModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddPiece}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-black cursor-pointer"
              >
                Add Piece
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD SILHOUETTE                                                     */}
      {/* ========================================================================= */}
      {isSilModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-garamond">
                Add Silhouette Drawing
              </h3>
              <button
                type="button"
                onClick={() => setIsSilModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Silhouette Name</label>
                <input
                  type="text"
                  placeholder="e.g. Band Collar"
                  value={newSilName}
                  onChange={(e) => setNewSilName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Backend Base Price (₹)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={newSilPrice}
                  onChange={(e) => setNewSilPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Silhouette Icon (Upload SVG / PNG / WebP / JPG)
                </label>
                <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                    {newSilSvg ? (
                      renderSilIcon({ svg: newSilSvg, name: newSilName || "Preview" })
                    ) : (
                      <Shirt className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{newSilUploading ? "Uploading..." : "Choose Icon File..."}</span>
                      <input
                        type="file"
                        accept="image/*,.svg"
                        disabled={newSilUploading}
                        onChange={handleNewSilUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Upload an SVG drawing or PNG / WebP image from your computer.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Or SVG Code (Optional)</label>
                <textarea
                  rows={4}
                  value={newSilSvg}
                  onChange={(e) => setNewSilSvg(e.target.value)}
                  placeholder="<svg ...> or image URL"
                  className="w-full font-mono text-[11px] p-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-[#79A7D3]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsSilModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddSilhouette}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-black cursor-pointer"
              >
                Save Silhouette
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOMIZE SILHOUETTE SIZES & PRICING                                */}
      {/* ========================================================================= */}
      {isSilSizesModalOpen && editingSilId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-start justify-between bg-gray-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#79A7D3]" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 font-garamond">
                    Customize Silhouette Sizes & Pricing
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Configure available sizes and individual prices for{" "}
                  <strong className="text-gray-800">
                    {settings.silhouettes.find((s: any) => s.id === editingSilId)?.name || "Silhouette"}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSilSizesModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
              {/* Quick Presets */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-xs font-medium text-gray-600">Quick Size Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => quickSetSilSizes("sl")}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                    title="Enable only S and L sizes"
                  >
                    Only S & L
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSetSilSizes("s_m_l_xl")}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                    title="Enable S, M, L, XL sizes"
                  >
                    S, M, L, XL
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSetSilSizes("all")}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                  >
                    Enable All
                  </button>
                </div>
              </div>

              {/* Sizes List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500 px-1">
                  <span>Available / Size</span>
                  <span>Price (₹)</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {editingSilSizes.map((item) => (
                    <div
                      key={item.size}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        item.enabled
                          ? "bg-white border-gray-300 shadow-2xs"
                          : "bg-gray-50/70 border-gray-200 opacity-60"
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => toggleEditingSilSizeEnabled(item.size)}
                          className="w-4 h-4 rounded border-gray-300 text-[#79A7D3] focus:ring-[#79A7D3] cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-900 font-garamond">
                            {item.size}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">
                            {item.enabled ? (
                              <span className="text-green-700 text-[11px] font-semibold">Available</span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Disabled</span>
                            )}
                          </span>
                        </div>
                      </label>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 focus-within:ring-1 focus-within:ring-[#79A7D3] focus-within:bg-white">
                          <span className="text-xs text-gray-400">₹</span>
                          <input
                            type="number"
                            value={item.price}
                            disabled={!item.enabled}
                            onChange={(e) => handleEditingSilSizePriceChange(item.size, Number(e.target.value))}
                            className="w-20 bg-transparent text-right text-xs font-semibold text-gray-900 outline-none disabled:text-gray-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeFromSil(item.size)}
                          className="text-gray-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                          title="Remove size from this silhouette"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Custom Size */}
              <div className="p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 space-y-2">
                <span className="text-xs font-semibold text-gray-700 block">Add New Size to Silhouette</span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder="Size (e.g. 3XL, Free Size)"
                    value={newCustomSizeName}
                    onChange={(e) => setNewCustomSizeName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
                  />
                  <div className="flex items-center gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded-lg w-full sm:w-28">
                    <span className="text-xs text-gray-400">₹</span>
                    <input
                      type="number"
                      placeholder="Price"
                      value={newCustomSizePrice}
                      onChange={(e) => setNewCustomSizePrice(e.target.value)}
                      className="w-full text-right text-xs font-semibold outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomSizeToSil}
                    className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
                  >
                    Add Size
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50/70 flex items-center justify-between gap-3">
              <span className="text-[11px] text-gray-500">
                {editingSilSizes.filter((s) => s.enabled).length} sizes will be available
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSilSizesModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSilSizes}
                  className="px-5 py-2 bg-[#79A7D3] text-white rounded-lg text-xs font-semibold hover:bg-[#6092c2] transition-colors cursor-pointer shadow-xs"
                >
                  Apply Sizes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isColorModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-garamond">
                Add Linen Colour Swatch
              </h3>
              <button
                type="button"
                onClick={() => setIsColorModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Colour Name</label>
                <input
                  type="text"
                  placeholder="e.g. Terracotta"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Hex Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-[#79A7D3]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Price Adjustment (+₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newColorAdjustment}
                  onChange={(e) => setNewColorAdjustment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#79A7D3]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsColorModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAddColor}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-black cursor-pointer"
              >
                Add Colour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD SIZE (OBSOLETE - REMOVED)                                       */}
      {/* ========================================================================= */}

      {/* Floating Sticky Save Bar */}
      <StickySaveBar
        onSave={handleSave}
        saving={saving}
        label="Save All Changes"
        subtext="Curator Settings"
      />

    </div>
  );
}
