"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  href?: string;
  fallbackHref?: string;
  className?: string;
  label?: string;
};

export default function BackButton({
  href,
  fallbackHref = "/",
  className = "",
  label = "Go back",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      suppressHydrationWarning
      aria-label={label}
      onClick={handleClick}
      className={`group p-1 text-gray-500 hover:text-[#79A7D3] inline-flex items-center justify-center transition-colors duration-200 cursor-pointer ${className}`}
    >
      <ArrowLeft
        size={22}
        strokeWidth={1.5}
        className="group-hover:-translate-x-0.5 transition-transform"
      />
    </button>
  );
}
