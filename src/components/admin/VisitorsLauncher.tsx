"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/Modal";
import { RecentVisitors } from "@/components/admin/RecentVisitors";

/**
 * Recent visitors, on call from anywhere in the admin.
 *
 * It sits in the bottom-left corner rather than the nav because it is not a
 * place you go — it is something you glance at while working somewhere else.
 * The Audit Stream remains the page for studying traffic properly; this is the
 * over-the-shoulder look at who is here right now.
 *
 * Opening it uses the same full-screen dialog as everything else on the desk,
 * so the visitor panels it contains stack on top of it correctly: the shared
 * Escape stack closes the visitor first and the list second, rather than
 * collapsing the tower on one keypress.
 *
 * Nothing is fetched until it is opened. Building the profiles reads thousands
 * of page views and groups them into sessions, which is not a cost every admin
 * page should pay for an icon.
 */
export function VisitorsLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open recent visitors"
        title="Recent visitors"
        className="group fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-[#131318] text-[#737373] shadow-lg shadow-black/40 transition-colors hover:border-[#ffffff]/50 hover:bg-[#ffffff] hover:text-black"
      >
        {/* Two figures: the page is about people, not page views. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
          <circle cx="10" cy="8" r="3.2" />
          <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4" />
          <path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6" />
        </svg>
      </button>

      {open ? (
        <Modal
          open
          onClose={() => setOpen(false)}
          eyebrow="Everyone who has been on the site"
          title="Recent visitors"
        >
          <RecentVisitors embedded />
        </Modal>
      ) : null}
    </>
  );
}
