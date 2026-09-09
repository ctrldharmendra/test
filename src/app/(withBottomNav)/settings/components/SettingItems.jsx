
"use client";

import { FaChevronRight } from "react-icons/fa6";

export default function SettingItem({
  icon: Icon,
  title,
  description,
  type = "toggle",
  value = false,
  onToggle,
  onClick,
  danger = false,
}) {
  return (
    <div
      className={`
        flex items-center gap-3.5
        px-4 py-4
        transition
        ${
          onClick
            ? "cursor-pointer active:bg-white/[0.04]"
            : ""
        }
      `}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className={`
          flex h-10 w-10
          shrink-0
          items-center justify-center
          rounded-xl
          ${
            danger
              ? "bg-red-500/10 text-red-500"
              : "bg-white/[0.06] text-white/65"
          }
        `}
      >
        {Icon && <Icon className="text-sm" />}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={`
            text-sm font-semibold
            ${danger ? "text-red-400" : "text-white"}
          `}
        >
          {title}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-relaxed text-white/35">
            {description}
          </p>
        )}
      </div>

      {/* Toggle */}
      {type === "toggle" && (
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          className={`
            relative
            h-7 w-12
            shrink-0
            rounded-full
            p-1
            transition
            duration-200
            ${
              value
                ? "bg-red-500"
                : "bg-white/[0.12]"
            }
          `}
        >
          <span
            className={`
              block
              h-5 w-5
              rounded-full
              bg-white
              shadow-sm
              transition-transform
              duration-200
              ${
                value
                  ? "translate-x-5"
                  : "translate-x-0"
              }
            `}
          />
        </button>
      )}

      {/* Navigation item */}
      {type === "navigation" && (
        <FaChevronRight
          className="
            shrink-0
            text-xs
            text-white/20
          "
        />
      )}
    </div>
  );
}
