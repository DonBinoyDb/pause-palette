"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Upload, X, Trash2, Check, Eye, EyeOff, Info, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditProductForm({ 
  product, 
  collections 
}: { 
  product: any, 
  collections: any[] 
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const productId = product.id;
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  
  // Form Data
  const [name, setName] = useState(product.name || "");
  const [slug, setSlug] = useState(product.slug || "");
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(product.price?.toString() || "");
  const [collectionId, setCollectionId] = useState(product.collectionId || "");
  
  const [gender, setGender] = useState<string[]>(product.gender || []);
  const [sizes, setSizes] = useState<string[]>(product.sizes || []);
  const [images, setImages] = useState<string[]>(product.images || []);
  const [isPublished, setIsPublished] = useState(product.isPublished || false);

  // Fits
  const [hasSilhouette, setHasSilhouette] = useState(product.hasSilhouette || false);
  const [fits, setFits] = useState<{name: string, iconUrl: string}[]>(
    Array.isArray(product.fits) ? product.fits : []
  );
  
  // Accordions
  const defaultAccordions = [
    { title: "Size & Fit", content: "" },
    { title: "The Fabric", content: "" },
    { title: "Care", content: "" },
    { title: "Returns & Exchanges", content: "" },
  ];
  const [accordions, setAccordions] = useState<{title: string, content: string}[]>(
    Array.isArray(product.accordions) && product.accordions.length > 0 
      ? product.accordions 
      : defaultAccordions
  );
  
  // UI State
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [isSilhouetteModalOpen, setIsSilhouetteModalOpen] = useState(false);
  const [newFitName, setNewFitName] = useState("");
  const [newFitIconUrl, setNewFitIconUrl] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const data = await res.json();
        if (data.success) {
          setImages(prev => [...prev, data.url]);
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIconUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setNewFitIconUrl(data.url);
      }
    } catch (error) {
      console.error("Icon upload failed", error);
    } finally {
      setIconUploading(false);
      if (iconInputRef.current) iconInputRef.current.value = "";
    }
  };

  const addFit = () => {
    if (!newFitName.trim() || !newFitIconUrl) {
      alert("Please provide both a name and an uploaded icon for the new fit.");
      return;
    }
    setFits([...fits, { name: newFitName.trim(), iconUrl: newFitIconUrl }]);
    setNewFitName("");
    setNewFitIconUrl("");
  };

  const removeFit = (index: number) => {
    setFits(fits.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleGender = (g: string) => {
    if (gender.includes(g)) {
      setGender(gender.filter(item => item !== g));
    } else {
      setGender([...gender, g]);
    }
  };

  const toggleSize = (s: string) => {
    if (sizes.includes(s)) {
      setSizes(sizes.filter(item => item !== s));
    } else {
      setSizes([...sizes, s]);
    }
  };

  const updateAccordion = (index: number, field: 'title' | 'content', value: string) => {
    const newAcc = [...accordions];
    newAcc[index][field] = value;
    setAccordions(newAcc);
  };

  const removeAccordion = (index: number) => {
    setAccordions(accordions.filter((_, i) => i !== index));
  };

  const addAccordion = () => {
    setAccordions([...accordions, { title: "New Detail", content: "" }]);
    setOpenAccordion(accordions.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          price,
          collectionId: collectionId || null,
          hasSilhouette,
          fits,
          accordions,
          gender,
          sizes,
          isPublished,
          images
        }),
      });

      if (res.ok) {
        router.push("/admin/products");
      } else {
        alert("Failed to update product");
      }
    } catch (error) {
      console.error("Failed to submit", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this piece?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/products");
      } else {
        alert("Failed to delete product");
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to delete", error);
      setLoading(false);
    }
  };

  const displayImages = images.length > 0 ? images : [""]; 

  return (
    <form onSubmit={handleSubmit} className="w-full">
      
      {/* Admin Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 bg-white flex items-center justify-center text-gray-500 hover:text-black transition-colors border border-gray-200 rounded-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-gray-900 tracking-tight">WYSIWYG Editor</h1>
            <p className="text-gray-500 text-[10px] tracking-widest uppercase mt-1">Live Storefront Preview</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 px-6 py-3 text-[10px] tracking-[0.15em] uppercase text-gray-500 hover:text-red-500 hover:bg-white border border-transparent hover:border-red-200 transition-all rounded-sm"
          >
            <Trash2 size={14} /> Delete
          </button>
          <button 
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-8 py-3 text-[10px] tracking-[0.15em] uppercase text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors rounded-sm"
          >
            Cancel
          </button>
          <div className="flex items-center bg-white border border-gray-200 rounded-sm overflow-hidden">
            <button 
              type="button"
              onClick={() => setIsPublished(true)}
              className={`px-4 py-3 text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors ${isPublished ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Eye size={14} /> Active
            </button>
            <div className="w-px h-full bg-gray-200" />
            <button 
              type="button"
              onClick={() => setIsPublished(false)}
              className={`px-4 py-3 text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors ${!isPublished ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <EyeOff size={14} /> Draft
            </button>
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="bg-white shadow-2xl rounded-md border border-gray-100 overflow-hidden mb-24 relative">
        
        {/* Fake Browser Header */}
        <div className="bg-gray-50 border-b border-gray-200 py-3 px-6 flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 bg-white border border-gray-200 rounded-md py-1.5 px-4 text-[10px] text-gray-400 font-mono flex items-center gap-2 max-w-sm mx-auto">
             <span>pause-palette.com/product/</span>
             <input 
               type="text" 
               value={slug} 
               onChange={(e) => setSlug(e.target.value)}
               className="bg-transparent border-none outline-none text-gray-700 w-full"
             />
          </div>
        </div>

        <div className="pt-16 pb-24 px-6 md:px-12 lg:px-16 w-full">
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            
            {/* Left: Images Section */}
            <div className="w-full lg:w-7/12 flex gap-4 md:gap-8">
              <div className="hidden md:flex flex-col gap-4 w-20 shrink-0 h-fit">
                {displayImages.map((src, idx) => (
                  <div key={idx} className="aspect-[3/4] w-full relative bg-gray-100 cursor-pointer overflow-hidden border border-gray-200 group">
                    {src ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="Thumb" className="object-cover w-full h-full" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-white/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Upload size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex-1 flex flex-col gap-4">
                {displayImages.map((src, idx) => (
                  <div key={idx} className="aspect-[3/4] w-full relative bg-gray-50 border border-gray-200 border-dashed group">
                    {src ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="Main" className="object-cover w-full h-full" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-4 right-4 bg-white p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 hover:text-red-500"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        {uploading ? (
                          <span className="text-[10px] tracking-[0.2em] uppercase">Uploading...</span>
                        ) : (
                          <>
                            <Upload size={24} className="mb-4" />
                            <span className="text-[10px] tracking-[0.2em] uppercase">Click to add hero image</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}

                {images.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/4] w-full relative bg-gray-50 border border-gray-200 border-dashed flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    {uploading ? (
                      <span className="text-[10px] tracking-[0.2em] uppercase">Uploading...</span>
                    ) : (
                      <>
                        <Upload size={24} className="mb-4" />
                        <span className="text-[10px] tracking-[0.2em] uppercase">Add another image</span>
                      </>
                    )}
                  </button>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="w-full lg:w-5/12 py-4">
              
              <input 
                type="text" 
                value={name}
                onChange={handleNameChange}
                placeholder="Product Name..."
                className="w-full font-serif text-3xl md:text-4xl text-gray-800 mb-2 border-b border-transparent hover:border-gray-200 focus:border-gray-400 focus:outline-none transition-colors bg-transparent p-0"
                required
              />

              <div className="flex items-center gap-3 mb-6 bg-gray-50 p-2 rounded-md border border-gray-100">
                 <select 
                   value={collectionId}
                   onChange={(e) => setCollectionId(e.target.value)}
                   className="text-[10px] tracking-widest uppercase text-gray-600 bg-transparent border-none outline-none cursor-pointer"
                 >
                   <option value="">+ SELECT COLLECTION</option>
                   {collections.map(col => (
                     <option key={col.id} value={col.id}>{col.name.toUpperCase()}</option>
                   ))}
                 </select>
                 
                 <span className="text-gray-300">|</span>
                 
                 <div className="flex items-center gap-2">
                   <button 
                     type="button"
                     onClick={() => toggleGender("MEN")}
                     className={`px-3 py-1 text-[10px] tracking-widest uppercase transition-colors rounded-sm ${gender.includes("MEN") ? 'bg-[#2C2B29] text-white' : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}
                   >
                     Men
                   </button>
                   <button 
                     type="button"
                     onClick={() => toggleGender("WOMEN")}
                     className={`px-3 py-1 text-[10px] tracking-widest uppercase transition-colors rounded-sm ${gender.includes("WOMEN") ? 'bg-[#2C2B29] text-white' : 'bg-transparent text-gray-500 hover:bg-gray-200'}`}
                   >
                     Women
                   </button>
                 </div>
              </div>
              
              <div className="relative mb-8 w-max">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 font-serif text-lg text-gray-700">₹</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="font-serif text-lg text-gray-700 border-b border-transparent hover:border-gray-200 focus:border-gray-400 focus:outline-none bg-transparent pl-6 w-32 pb-0.5 transition-colors"
                  required
                />
              </div>

              {/* Sizes Selection */}
              <div className="flex justify-between items-end mb-6">
                <div className="flex gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                    <button 
                      type="button"
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`w-9 h-9 flex items-center justify-center text-xs border transition-colors ${sizes.includes(size) ? 'border-[#2C2B29] bg-[#2C2B29] text-white font-medium shadow-md' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-gray-500 cursor-not-allowed">Fit Guide &gt;</span>
              </div>

              {/* Silhouette Editor */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-gray-500 italic">Prefer this illustration in another form? Choose from our available silhouettes.</p>
                  <label className="relative inline-flex items-center cursor-pointer scale-75">
                    <input type="checkbox" checked={hasSilhouette} onChange={(e) => setHasSilhouette(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                  </label>
                </div>
                
                {hasSilhouette && (
                  <button 
                    type="button"
                    onClick={() => setIsSilhouetteModalOpen(true)}
                    className="w-full border border-gray-800 bg-white py-3 px-4 flex justify-between items-center text-sm text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <span className="mx-auto tracking-wide font-medium">
                      CONFIGURE SILHOUETTES ({fits.length})
                    </span>
                  </button>
                )}
              </div>

              {/* Save Button */}
              <button 
                type="submit"
                disabled={loading || uploading}
                className="w-full border border-gray-800 bg-gray-800 text-white font-serif tracking-widest uppercase py-4 mb-4 hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
              >
                {loading ? "SAVING..." : "SAVE & PUBLISH PRODUCT"}
              </button>
              
              <p className="text-[10px] text-gray-400 italic text-center mb-10">Thoughtfully made to order - Dispatches in 12-15 business days.</p>

              {/* Description Input */}
              <div className="relative mb-10">
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the piece, the fabric, the feel..."
                  className="w-full text-[13px] text-gray-600 leading-relaxed border border-transparent hover:border-gray-200 focus:border-gray-300 focus:bg-gray-50 focus:outline-none p-4 -ml-4 transition-all min-h-[160px] resize-y rounded-md bg-transparent"
                />
                {!description && <div className="absolute top-4 left-0 text-[13px] text-gray-400 pointer-events-none">Thoughtfully designed, slowly crafted...</div>}
              </div>

              {/* Accordions Editor */}
              <div className="border-t border-gray-200">
                {accordions.map((item, idx) => (
                  <div key={idx} className="border-b border-gray-200 group relative">
                    <button 
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                      className="w-full py-4 flex justify-between items-center text-left hover:bg-gray-50"
                    >
                      <input 
                        type="text"
                        value={item.title}
                        onChange={(e) => updateAccordion(idx, 'title', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[12px] tracking-wide text-gray-800 font-medium bg-transparent border-none outline-none focus:ring-1 focus:ring-gray-300 px-1 py-0.5 rounded-sm"
                        placeholder="Accordion Title"
                      />
                      <div className="flex items-center gap-4">
                        <span onClick={(e) => { e.stopPropagation(); removeAccordion(idx); }} className="text-red-500 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all">
                          <Trash2 size={14} />
                        </span>
                        <span className="text-gray-400 text-sm font-light w-4 text-center">{openAccordion === idx ? '−' : '+'}</span>
                      </div>
                    </button>
                    {openAccordion === idx && (
                      <div className="pb-4 pr-8">
                        <textarea
                          value={item.content}
                          onChange={(e) => updateAccordion(idx, 'content', e.target.value)}
                          placeholder={`Enter details for ${item.title}...`}
                          className="w-full text-[12px] text-gray-500 leading-relaxed bg-gray-50 border border-gray-200 rounded-md p-3 min-h-[100px] outline-none focus:border-gray-400 resize-y"
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={addAccordion}
                  className="w-full py-4 flex items-center justify-center gap-2 text-[11px] text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-b border-gray-200 border-dashed"
                >
                  <Plus size={14} /> Add Detail Section
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Silhouette Selection Modal (Admin Experience) */}
      {isSilhouetteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSilhouetteModalOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-[#FBF9F6] rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <button type="button" onClick={() => setIsSilhouetteModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 bg-white/50 rounded-full p-1">
              <X size={20} strokeWidth={1.5} />
            </button>
            
            <div className="px-8 py-10 flex-1">
              <h2 className="text-center font-serif text-xl tracking-widest text-gray-800 mb-2">CONFIGURE SILHOUETTES</h2>
              <p className="text-center text-sm text-gray-600 mb-10">Add or remove available fits and illustrations for this piece.</p>

              {/* Add New Fit Form */}
              <div className="mb-10 bg-white p-6 border border-gray-200 rounded-md shadow-sm">
                <h3 className="text-[10px] font-medium tracking-widest text-gray-500 mb-4 uppercase">Add New Fit</h3>
                <div className="flex items-start gap-6">
                  
                  {/* Icon Uploader */}
                  <div className="shrink-0">
                    <button 
                      type="button"
                      onClick={() => iconInputRef.current?.click()}
                      className="w-24 h-24 bg-gray-50 border border-gray-200 border-dashed flex flex-col items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-colors relative overflow-hidden"
                    >
                      {newFitIconUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={newFitIconUrl} alt="Icon" className="w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Upload size={16} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          {iconUploading ? (
                            <span className="text-[10px] uppercase text-gray-400">Wait...</span>
                          ) : (
                            <>
                              <Upload size={16} className="text-gray-400 mb-2" />
                              <span className="text-[9px] uppercase tracking-wider text-gray-400">Upload Icon</span>
                            </>
                          )}
                        </>
                      )}
                    </button>
                    <input type="file" ref={iconInputRef} onChange={handleIconUpload} accept="image/*" className="hidden" />
                  </div>
                  
                  {/* Name Input & Submit */}
                  <div className="flex-1 flex flex-col gap-4">
                    <input 
                      type="text" 
                      value={newFitName}
                      onChange={(e) => setNewFitName(e.target.value)}
                      placeholder="e.g. Drop-Shoulder Shirt"
                      className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-gray-800 focus:outline-none focus:border-gray-800 transition-colors placeholder:text-gray-400 font-serif"
                    />
                    <button 
                      type="button" 
                      onClick={addFit}
                      className="bg-[#2C2B29] text-white py-2 px-6 text-[10px] uppercase tracking-widest hover:bg-black self-start rounded-sm"
                    >
                      Add Fit
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Fits List */}
              <div>
                <h3 className="text-[10px] font-medium tracking-widest text-gray-500 mb-4 uppercase">Available Fits ({fits.length})</h3>
                {fits.length === 0 ? (
                  <div className="text-center py-10 border border-gray-200 border-dashed text-gray-400 text-sm">
                    No fits added yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fits.map((fitItem, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center relative group shadow-sm">
                        <button 
                          type="button" 
                          onClick={() => removeFit(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
                        >
                          <Trash2 size={12} />
                        </button>
                        <div className="w-20 h-20 bg-gray-50 border border-gray-100 flex items-center justify-center rounded-sm mb-4 mt-2 p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={fitItem.iconUrl} alt={fitItem.name} className="w-full h-full object-contain" />
                        </div>
                        <p className="font-serif text-gray-800 text-sm text-center leading-tight mb-1">{fitItem.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="px-8 pb-8 pt-4 bg-[#FBF9F6] sticky bottom-0 border-t border-gray-200 mt-auto">
              <div className="flex items-start justify-center gap-2 mb-6">
                <Info size={14} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.5} />
                <p className="text-xs text-gray-600 text-center max-w-sm">This is exactly how fits will appear to your customers.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsSilhouetteModalOpen(false)}
                className="w-full bg-[#2C2B29] hover:bg-black text-white py-4 font-serif tracking-widest text-sm transition-colors rounded-sm shadow-md"
              >
                DONE
              </button>
            </div>
            
          </div>
        </div>
      )}

    </form>
  );
}
