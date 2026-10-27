"use client";

import React from "react";
import { Save, RefreshCw, CheckCircle2 } from "lucide-react";

export interface StickySaveBarProps {
  onSave?: () => void;
  formId?: string;
  saving?: boolean;
  label?: string;
  subtext?: string;
  isDirty?: boolean;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export default function StickySaveBar({
  onSave,
  formId,
  saving = false,
  label = "Save Changes",
  subtext,
  isDirty,
  secondaryAction,
}: StickySaveBarProps) {
  // Global Ctrl+S / Cmd+S shortcut to save anytime while editing
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (saving) return;

        if (formId) {
          const form = document.getElementById(formId) as HTMLFormElement;
          if (form) {
            if (typeof form.requestSubmit === "function") {
              form.requestSubmit();
            } else {
              form.submit();
            }
          }
        } else if (onSave) {
          onSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, formId, saving]);

  const handleSaveClick = () => {
    if (saving) return;
    if (formId) {
      const form = document.getElementById(formId) as HTMLFormElement;
      if (form) {
        if (typeof form.requestSubmit === "function") {
          form.requestSubmit();
        } else {
          form.submit();
        }
        return;
      }
    }
    if (onSave) {
      onSave();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:right-10 z-50 flex items-center gap-2.5 sm:gap-3 bg-[#2C2B29]/95 text-white pl-4 sm:pl-5 pr-2.5 py-2.5 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-white/15 backdrop-blur-md transition-all hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
      {/* Status indicator */}
      <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-white/20 text-xs select-none">
        {isDirty === true ? (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-medium text-amber-200">Unsaved changes</span>
          </>
        ) : isDirty === false ? (
          <>
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="font-medium text-white/80">Published live</span>
          </>
        ) : (
          <span className="font-medium text-white/80">{subtext || "Ready to save"}</span>
        )}
        <span className="text-[10px] text-white/40 ml-1 font-mono hidden md:inline">Ctrl+S</span>
      </div>

      {secondaryAction && (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          {secondaryAction.icon}
          <span>{secondaryAction.label}</span>
        </button>
      )}

      <button
        type={formId ? "submit" : "button"}
        form={formId}
        onClick={handleSaveClick}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2 bg-white text-[#2C2B29] hover:bg-gray-100 active:scale-95 rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm cursor-pointer"
      >
        {saving ? (
          <>
            <RefreshCw size={13} className="animate-spin text-[#2C2B29]" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save size={13} className="text-[#2C2B29]" />
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
}
