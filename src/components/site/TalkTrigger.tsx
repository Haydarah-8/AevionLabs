"use client";

import type { ReactNode } from "react";
import { useContactModal } from "@/components/chrome/ContactModal";
import { LinkBtn } from "@/components/anim/LinkBtn";

export function TalkTrigger({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const { openModal } = useContactModal();
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      onClick={openModal}
    >
      {children}
    </button>
  );
}

export function TalkLinkBtn({
  children,
  lineClassName,
  className,
}: {
  children: ReactNode;
  lineClassName?: string;
  className?: string;
}) {
  const { openModal } = useContactModal();
  return (
    <LinkBtn onClick={openModal} lineClassName={lineClassName} className={className}>
      {children}
    </LinkBtn>
  );
}
