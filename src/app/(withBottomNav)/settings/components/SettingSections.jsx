
"use client";

import { useState } from "react";
import {
  FaChevronDown,
} from "react-icons/fa6";

export default function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border border-white/[0.07]
        bg-white/[0.025]
      "
    >
      {/* Parent */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex w-full
          items-center gap-3
          px-4 py-4
          text-left
          transition
          hover:bg-white/[0.025]
          active:bg-white/[0.04]
        "
      >
        {/* Parent icon */}
        <div
          className="
            flex h-11 w-11
            shrink-0
            items-center justify-center
            rounded-xl
            bg-red-500/10
            text-red-500
          "
        >
          {Icon && <Icon className="text-base" />}
        </div>

        {/* Parent text */}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-white">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-xs text-white/30">
              {description}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div
          className={`
            flex h-8 w-8
            items-center justify-center
            rounded-full
            bg-white/[0.05]
            text-white/35
            transition-transform
            duration-200
            ${open ? "rotate-180" : ""}
          `}
        >
          <FaChevronDown className="text-xs" />
        </div>
      </button>

      {/* Children */}
      {open && (
        <div className="border-t border-white/[0.06]">
          {children}
        </div>
      )}
    </section>
  );
}
