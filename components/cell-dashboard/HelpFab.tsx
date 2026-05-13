"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type HelpFabProps = {
  onClick?: () => void;
  className?: string;
};

export function HelpFab({ onClick, className = "" }: HelpFabProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // document.body is only available after mount; defer portal until post-hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- single client-only gate for createPortal(document.body)
    setMounted(true);
  }, []);

  const node = (
    <button
      type="button"
      aria-label="Help"
      className={`fixed bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-[45] min-h-12 min-w-12 touch-manipulation rounded-full bg-[#0B0E14] p-0 text-white shadow-lg ring-1 ring-black/20 transition hover:bg-[#141922] active:scale-95 ${className}`}
      onClick={() => onClick?.()}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center">
        <span className="pointer-events-none text-lg font-semibold leading-none">?</span>
      </span>
    </button>
  );

  if (!mounted) return null;
  return createPortal(node, document.body);
}
