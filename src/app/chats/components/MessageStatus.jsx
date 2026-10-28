"use client";

import { useEffect, useRef } from "react";
import {
  FaCheck,
  FaCheckDouble,
  FaRegClock,
  FaCircleExclamation,
} from "react-icons/fa6";

const CONFIG = {
  sending:   { Icon: FaRegClock,         color: "text-white/30 animate-pulse", label: "Sending" },
  sent:      { Icon: FaCheck,            color: "text-white/40",               label: "Sent" },
  delivered: { Icon: FaCheckDouble,      color: "text-white/60",               label: "Delivered" },
  read:      { Icon: FaCheckDouble,      color: "text-sky-400 drop-shadow-[0_0_5px_rgba(56,189,248,0.7)]", label: "Seen" },
  failed:    { Icon: FaCircleExclamation, color: "text-red-500",               label: "Failed to send" },
};

export default function MessageStatus({ status = "sent", size = 11 }) {
  const cfg = CONFIG[status] || CONFIG.sent;
  const { Icon } = cfg;

  // pop animation sirf tab jab status badle, history load pe nahi
  const prev = useRef(status);
  const changed = prev.current !== status;
  useEffect(() => {
    prev.current = status;
  }, [status]);

  return (
    <span
      role="img"
      title={cfg.label}
      aria-label={cfg.label}
      className={`inline-flex items-center ${changed ? "tick-pop" : ""}`}
    >
      <Icon size={size} className={cfg.color} />
    </span>
  );
}