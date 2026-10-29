
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaLocationCrosshairs,
  FaQuestion,
  FaXmark,
} from "react-icons/fa6";

export default function HelpPopover({
  title = "Help",
  children = "Here is some helpful information.",
  trigger,
  bg, 
  textColor
}) {
    // inside HelpPopover:
const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait until the component mounts in the browser.
  useEffect(() => {
    setMounted(true);
  }, []);

    useEffect(() => {
  const el = triggerRef.current;
  if (!el) return;

  const stop = (e) => e.stopPropagation();
  el.addEventListener("pointerdown", stop);

  return () => el.removeEventListener("pointerdown", stop);
}, []);
  // Close with Escape.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };


    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const stopInteraction = (event) => {
    event.stopPropagation();
  };

  return (
    <>
      {/* Trigger: safe to use inside draggable components */}

<button
  ref={triggerRef}
  type="button"
  onClick={(event) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  }}
  aria-label={`Open ${title}`}
  aria-expanded={open}
  className={`pointer-events-auto relative z-50 inline-flex p-1 shrink-0
    items-center justify-center rounded-full
     hover:bg-white/20 ${textColor} ${bg}`}
>
  <FaQuestion />
</button>

      {/* Portal renders outside the draggable card */}
      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center
              justify-center overflow-y-auto bg-black/60 p-4"
            onPointerDown={stopInteraction}
            onTouchStart={stopInteraction}
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="help-popover-title"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={stopInteraction}
              onTouchStart={stopInteraction}
              className="my-auto w-full max-w-sm rounded-2xl
                bg-white p-6 text-slate-900 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2
                  id="help-popover-title"
                  className="flex items-center gap-2 font-bold"
                >
                  {/* <FaLocationCrosshairs className="shrink-0 text-blue-600" /> */}
                  {title}
                </h2>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close popup"
                  className="rounded-full p-2 hover:bg-slate-100"
                >
                  <FaXmark />
                </button>
              </div>

              <div className="text-sm leading-6 text-slate-600">
                {children}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-5 w-full rounded-xl bg-indigo-600
                  px-4 py-3 text-sm font-semibold text-white
                  transition hover:bg-indigo-700"
              >
                Okay
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}


// uSAGE 
//   <HelpPopover title="Enable your location" bg="bg-white" textColor="text-red-500">
//     <p>
//       Please turn on your location so the app can detect
//       your current location.
//     </p>

//     <p className="mt-2 text-red-500">
//       If GPS doesn't work, search for your village, town,
//       or city manually.
//     </p>
//   </HelpPopover>