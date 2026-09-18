"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { SITE_IMAGES } from "@/lib/images";
import { animate, AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { EASE } from "@/lib/utils";
import { CONTACT_EMAIL } from "@/lib/site";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { ModalBtnSvg } from "@/components/svg/generated";

type ModalContextValue = { openModal: () => void };

const ModalContext = createContext<ModalContextValue>({ openModal: () => {} });

export function useContactModal() {
  return useContext(ModalContext);
}

/**
 * The site-wide "Let's talk" modal (shadcn/radix dialog primitives with the
 * original's motion: overlay fade, card rises 4% with power4.out).
 */
export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);

  /* The backdrop is the `.overlay` element in `.wrapper`, dimmed to 0.5 -
     `.modal_overlay` itself is transparent in the stylesheet. */
  useEffect(() => {
    const wash = document.querySelector<HTMLElement>(".wrapper > .overlay");
    if (!wash) return;
    animate(
      wash,
      { opacity: open ? 0.5 : 0 },
      open
        ? { duration: 0.375, ease: EASE.power2out }
        : { duration: 0.3, ease: EASE.power2in }
    );
  }, [open]);

  return (
    <ModalContext.Provider value={{ openModal }}>
      {children}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {open && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="modal_overlay grid-col-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.375, ease: EASE.power2out } }}
                  exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE.power2in } }}
                  onClick={() => setOpen(false)}
                >
                  <DialogPrimitive.Content asChild forceMount onClick={(e) => e.stopPropagation()}>
                    <motion.div
                      className="modal_wrap"
                      initial={{ y: "4%", opacity: 0 }}
                      animate={{
                        y: "0%",
                        opacity: 1,
                        transition: { duration: 0.5, ease: EASE.power4out },
                      }}
                      exit={{
                        y: "4%",
                        opacity: 0,
                        transition: { duration: 0.3, ease: EASE.power2in },
                      }}
                    >
                      <div className="modal">
                        <div className="modal_content">
                          <DialogPrimitive.Title asChild>
                            <div className="modal_heading u-text-lg">
                              Tell us what you&apos;re building.
                            </div>
                          </DialogPrimitive.Title>
                          <div className="modal_content_bottom">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              className="modal_content_image"
                              src={SITE_IMAGES.modal.src}
                              alt={SITE_IMAGES.modal.alt}
                            />
                            <div className="modal_content_text_wrap">
                              <DialogPrimitive.Description asChild>
                                <div className="modal_content_text u-text-base">
                                  Send us a note with what you&apos;re working on, roughly
                                  when you need it, and where you&apos;re starting from.
                                </div>
                              </DialogPrimitive.Description>
                              <div className="modal_content_text u-text-base is-2">
                                We read every enquiry ourselves and reply with honest next
                                steps, even when we&apos;re not the right fit.
                              </div>
                              <div className="modal_content_text_bottom">
                                <LinkBtn href={`mailto:${CONTACT_EMAIL}`}>
                                  {CONTACT_EMAIL}
                                </LinkBtn>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogPrimitive.Close asChild>
                          <button type="button" className="modal_btn" aria-label="Close">
                            <ModalBtnSvg />
                          </button>
                        </DialogPrimitive.Close>
                      </div>
                    </motion.div>
                  </DialogPrimitive.Content>
                </motion.div>
              </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </ModalContext.Provider>
  );
}
