"use client";

import { useState, useEffect } from "react";
import { X, Search, Check, Layers, Image as ImageIcon, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export interface ExistingProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  collection?: { name: string } | null;
  colors?: any;
}

interface AddProductVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProductId?: string;
  currentProductName?: string;
  currentProductImages?: string[];
  currentProductSlug?: string;
  existingVariantNames?: string[];
  onAddVariant: (
    variant: {
      name: string;
      hex: string;
      images: string[];
      existingProductId?: string;
      productSlug?: string;
    },
    twoWayLinkProduct?: { id: string; name: string } | null
  ) => void;
}

export default function AddProductVariantModal({
  isOpen,
  onClose,
  currentProductId,
  currentProductName,
  currentProductImages = [],
  currentProductSlug,
  existingVariantNames = [],
  onAddVariant,
}: AddProductVariantModalProps) {
  const [products, setProducts] = useState<ExistingProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ExistingProductItem | null>(null);
  const [variantName, setVariantName] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [twoWayLink, setTwoWayLink] = useState(Boolean(currentProductId));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setSelectedProduct(null);
      setVariantName("");
      setSearchQuery("");
      setTwoWayLink(Boolean(currentProductId));
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data: ExistingProductItem[] = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products for variant selection", error);
      toast.error("Failed to load catalog products");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (prod: ExistingProductItem) => {
    setSelectedProduct(prod);
    setVariantName(prod.name);
    setSelectedImages(Array.isArray(prod.images) ? [...prod.images] : []);
  };

  const handleToggleImage = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleConfirm = async () => {
    if (!selectedProduct) return;
    if (!variantName.trim()) {
      toast.error("Please enter a variant name");
      return;
    }
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image for the variant");
      return;
    }

    setSubmitting(true);
    try {
      // If two-way linking requested and current product has an id
      if (twoWayLink && currentProductId && currentProductName) {
        try {
          await fetch(`/api/products/${selectedProduct.id}/link-variant`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              variant: {
                name: currentProductName,
                hex: "#000000",
                images: currentProductImages,
                existingProductId: currentProductId,
                productSlug: currentProductSlug,
              },
            }),
          });
        } catch (e) {
          console.error("Two-way link error", e);
        }
      }

      onAddVariant(
        {
          name: variantName.trim(),
          hex: "#000000",
          images: selectedImages,
          existingProductId: selectedProduct.id,
          productSlug: selectedProduct.slug,
        },
        twoWayLink ? { id: selectedProduct.id, name: selectedProduct.name } : null
      );

      toast.success(
        `Variant "${variantName.trim()}" added with ${selectedImages.length} images!`
      );
      onClose();
    } catch (error) {
      console.error("Add variant failed", error);
      toast.error("Failed to add variant");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filter available products
  const availableProducts = products.filter((p) => {
    if (currentProductId && p.id === currentProductId) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = p.name?.toLowerCase().includes(q);
    const matchSlug = p.slug?.toLowerCase().includes(q);
    const matchCol = p.collection?.name?.toLowerCase().includes(q);
    return matchName || matchSlug || matchCol;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full border border-gray-200 shadow-2xl flex flex-col max-h-[90vh] rounded-sm overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF9F7]">
          <div>
            <h3 className="font-garamond text-xl text-gray-900 font-medium">
              Add Variant from Existing Product
            </h3>
            <p className="text-[11px] tracking-wider uppercase text-gray-400 mt-0.5">
              Import images and styling from an existing product
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 p-1.5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedProduct ? (
            /* STEP 1: Select an existing product */
            <div className="space-y-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name or collection..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-gray-600" />
                  <span className="text-xs uppercase tracking-widest">Loading catalog...</span>
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-sm">No products found matching your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {availableProducts.map((prod) => {
                    const isAlreadyAdded = existingVariantNames.some(
                      (n) => n.toLowerCase() === prod.name.toLowerCase()
                    );
                    const coverImg = prod.images?.[0];

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod)}
                        className={`p-3 border rounded-sm flex gap-3 cursor-pointer transition-all ${
                          isAlreadyAdded
                            ? "border-gray-200 bg-gray-50/60 opacity-80"
                            : "border-gray-200 hover:border-gray-900 hover:shadow-xs bg-white"
                        }`}
                      >
                        <div className="w-14 h-18 bg-gray-100 rounded-2xs overflow-hidden shrink-0 relative">
                          {coverImg ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={coverImg}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={18} />
                            </div>
                          )}
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 py-0.2 rounded-2xs font-mono">
                            {prod.images?.length || 0}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {prod.collection?.name && (
                                <span className="text-[9px] tracking-wider uppercase text-gray-400 font-medium">
                                  {prod.collection.name}
                                </span>
                              )}
                              {isAlreadyAdded && (
                                <span className="text-[8px] uppercase tracking-wider text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-2xs">
                                  Already Added
                                </span>
                              )}
                            </div>
                            <h4 className="font-garamond text-base text-gray-900 font-medium truncate mt-0.5">
                              {prod.name}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="font-mono text-gray-600 font-medium">
                              ₹{prod.price?.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-gray-400 group-hover:text-gray-900 flex items-center gap-0.5">
                              Select <ArrowRight size={10} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: Configure the variant details */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Selected Product Card Banner */}
              <div className="p-4 bg-[#FAF9F7] border border-gray-200 rounded-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-16 bg-gray-100 rounded-2xs overflow-hidden shrink-0">
                    {selectedProduct.images?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={20} className="text-gray-300 m-auto mt-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-gray-400 font-medium">
                      Selected Existing Product
                    </span>
                    <h4 className="font-garamond text-lg text-gray-900 font-medium">
                      {selectedProduct.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono">
                      ₹{selectedProduct.price?.toLocaleString("en-IN")} • {selectedProduct.images?.length || 0} images available
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-4"
                >
                  Change
                </button>
              </div>

              {/* Variant Name Input */}
              <div>
                <label className="block text-[11px] tracking-wider uppercase text-gray-700 font-medium mb-1.5">
                  Variant Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="e.g. Midnight Moss, Option B, etc."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none rounded-sm bg-white"
                />
                <p className="text-[10px] text-gray-400 mt-1 italic">
                  This name will appear on the variant swatch on the storefront.
                </p>
              </div>

              {/* Image Selection Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] tracking-wider uppercase text-gray-700 font-medium">
                    Images to Import ({selectedImages.length} of {selectedProduct.images?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedImages.length === selectedProduct.images?.length) {
                        setSelectedImages([]);
                      } else {
                        setSelectedImages([...selectedProduct.images]);
                      }
                    }}
                    className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-gray-900 underline underline-offset-4"
                  >
                    {selectedImages.length === selectedProduct.images?.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {selectedProduct.images?.map((url, idx) => {
                    const isChecked = selectedImages.includes(url);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleImage(url)}
                        className={`aspect-[3/4] relative rounded-xs overflow-hidden border cursor-pointer transition-all ${
                          isChecked
                            ? "border-gray-900 ring-2 ring-gray-900/40"
                            : "border-gray-200 opacity-50 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <div
                          className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-colors ${
                            isChecked ? "bg-gray-900 text-white" : "bg-white/80 border border-gray-300 text-transparent"
                          }`}
                        >
                          <Check size={10} strokeWidth={3} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optional Two-Way Link Checkbox */}
              {currentProductId && currentProductName && (
                <div className="pt-3 border-t border-gray-100">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={twoWayLink}
                      onChange={(e) => setTwoWayLink(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-gray-900 rounded-xs cursor-pointer"
                    />
                    <div>
                      <span className="text-xs text-gray-800 font-medium">
                        Two-Way Link (Recommended)
                      </span>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        Also add &quot;{currentProductName}&quot; as a variant to &quot;{selectedProduct.name}&quot; so both products display each other in their swatches.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-[#FAF9F7] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>

          {selectedProduct && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs uppercase tracking-widest font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Confirm & Add as Variant</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
