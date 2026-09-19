"use client";

import { useState, useEffect } from "react";
import { Plus, X, Upload, Save, Check, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

type Mode = "illustration" | "embroidery" | "solid";

export default function CuratorSettingsPage() {
  const [activeTab, setActiveTab] = useState<Mode>("illustration");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSilName, setNewSilName] = useState("");
  const [newSilSvg, setNewSilSvg] = useState(`<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <path d="M40 20 L60 20 L80 40 L70 90 L30 90 L20 40 Z" stroke="black" stroke-width="2" fill="none" />
</svg>`);
  
  const [settings, setSettings] = useState({
    visibility: {
      illustration: { showAudience: true, showTechnique: true, showCanvas: true, showSilhouette: true, showSize: true, showColor: true, showTheme: false },
      embroidery: { showAudience: true, showTechnique: false, showCanvas: false, showSilhouette: true, showSize: true, showColor: true, showTheme: true },
      solid: { showAudience: true, showTechnique: false, showCanvas: false, showSilhouette: true, showSize: true, showColor: true, showTheme: false },
    },
    canvasProductIds: [] as string[],
    silhouettes: [] as any[],
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
          visibility: data.visibility,
          canvasProductIds: data.canvasProductIds,
          silhouettes: data.silhouettes,
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
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = (field: string) => {
    setSettings((prev: any) => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [activeTab]: {
          ...prev.visibility[activeTab],
          [field]: !prev.visibility[activeTab][field]
        }
      }
    }));
  };

  const toggleCanvasProduct = (productId: string) => {
    setSettings(prev => {
      const isSelected = prev.canvasProductIds.includes(productId);
      return {
        ...prev,
        canvasProductIds: isSelected 
          ? prev.canvasProductIds.filter(id => id !== productId)
          : [...prev.canvasProductIds, productId]
      };
    });
  };

  const openAddModal = () => {
    setNewSilName("");
    setNewSilSvg(`<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <path d="M40 20 L60 20 L80 40 L70 90 L30 90 L20 40 Z" stroke="black" stroke-width="2" fill="none" />
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

    setSettings(prev => ({
      ...prev,
      silhouettes: [...prev.silhouettes, { 
        id: newSilName.toLowerCase().replace(/\s+/g, "-"), 
        name: newSilName, 
        svg: newSilSvg 
      }]
    }));
    
    setIsModalOpen(false);
  };

  const removeSilhouette = (id: string) => {
    if (confirm("Remove this silhouette?")) {
      setSettings(prev => ({
        ...prev,
        silhouettes: prev.silhouettes.filter(s => s.id !== id)
      }));
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  const currentVisibility = (settings.visibility as any)[activeTab];

  return (
    <div className="flex-1 overflow-auto bg-[#FDFCFB]">
      <div className="max-w-4xl mx-auto p-8">
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-serif text-3xl text-gray-900 mb-2">Curator Settings</h1>
            <p className="text-sm text-gray-500">Manage the dynamic options on the "Curate Your Piece" page.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-gray-200 mb-8">
          {(["illustration", "embroidery", "solid"] as Mode[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize tracking-wide transition-colors relative ${
                activeTab === tab ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-gray-900" />
              )}
            </button>
          ))}
        </div>

        {/* Visibility Toggles */}
        <div className="bg-white border border-gray-200 p-6 mb-8">
          <h2 className="font-serif text-xl mb-4">Section Visibility</h2>
          <p className="text-sm text-gray-500 mb-6">Toggle which configuration options are available when a customer selects this mode.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(currentVisibility).map((field) => (
              <label key={field} className="flex items-center justify-between p-4 border border-gray-100 bg-gray-50/50 hover:bg-gray-50 cursor-pointer">
                <span className="text-sm font-medium capitalize">{field.replace('show', '')}</span>
                <input 
                  type="checkbox" 
                  checked={currentVisibility[field]} 
                  onChange={() => toggleVisibility(field)}
                  className="w-5 h-5 accent-gray-900 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Dynamic Canvases (Only for Illustration usually, but available everywhere) */}
        <div className="bg-white border border-gray-200 p-6 mb-8">
          <h2 className="font-serif text-xl mb-4">Choose Our Piece (Canvases)</h2>
          <p className="text-sm text-gray-500 mb-6">Select which existing products should appear as selectable canvases in the configurator.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-2">
            {products.map(product => {
              const isSelected = settings.canvasProductIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => toggleCanvasProduct(product.id)}
                  className={`relative flex flex-col items-center gap-2 border-2 p-2 transition-all ${
                    isSelected ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="relative w-full aspect-[3/4] bg-gray-100">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon /></div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-center truncate w-full px-1">{product.name}</span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-gray-900 text-white rounded-full p-1">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Silhouettes */}
        <div className="bg-white border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-serif text-xl mb-1">Silhouettes</h2>
              <p className="text-sm text-gray-500">Manage the available shirt styles.</p>
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-gray-100 text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Plus size={16} />
              Add Silhouette
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.silhouettes.map((sil: any) => (
              <div key={sil.id} className="relative flex flex-col items-center justify-center w-full aspect-[3/4] border border-gray-200 p-4 bg-gray-50 group">
                <button 
                  onClick={() => removeSilhouette(sil.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={14} />
                </button>
                <div className="w-20 h-24 mb-4 opacity-70" dangerouslySetInnerHTML={{ __html: sil.svg }} />
                <span className="text-xs font-medium text-center uppercase">{sil.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Silhouette Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
            
            <h2 className="font-serif text-2xl text-gray-900 mb-6">Add New Silhouette</h2>
            
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Silhouette Name</label>
                <input 
                  type="text"
                  value={newSilName}
                  onChange={(e) => setNewSilName(e.target.value)}
                  placeholder="e.g., Oversized T-Shirt"
                  className="w-full border border-gray-300 px-4 py-2 text-sm focus:border-gray-900 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Custom Icon (SVG Code)</label>
                <p className="text-xs text-gray-500 mb-2">Paste raw SVG code here. Make sure it has no background.</p>
                <textarea 
                  value={newSilSvg}
                  onChange={(e) => setNewSilSvg(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 p-4 text-xs font-mono bg-gray-50 focus:border-gray-900 focus:outline-none resize-none"
                />
              </div>
              
              <div className="bg-gray-50 border border-gray-200 p-4 flex flex-col items-center justify-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Icon Preview</span>
                <div className="w-16 h-16 opacity-70" dangerouslySetInnerHTML={{ __html: newSilSvg || '' }} />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAddSilhouette}
                className="flex-1 bg-gray-900 text-white py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
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
