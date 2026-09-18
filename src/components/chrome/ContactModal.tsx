"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { EASE } from "@/lib/utils";
import { CONTACT_EMAIL } from "@/lib/site";
import { MODAL_BODY, MODAL_HEADING, MODAL_NOTE } from "@/data/copy";
import { BtnLines } from "@/components/anim/LinkBtn";
import { ModalBtnSvg } from "@/components/svg/generated";

type ModalContextValue = { openModal: () => void; closeModal: () => void };

const ModalContext = createContext<ModalContextValue>({
  openModal: () => {},
  closeModal: () => {},
});

export function useContactModal() {
  return useContext(ModalContext);
}

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const router = useRouter();
  const lenis = useLenis();

  const goToBrief = useCallback(() => {
    setOpen(false);
    router.push("/talk");
  }, [router]);

  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open, lenis]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {open && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="talk-modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.375, ease: EASE.power2out },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.3, ease: EASE.power2in },
                  }}
                  onClick={() => setOpen(false)}
                >
                  <DialogPrimitive.Content
                    asChild
                    forceMount
                    onClick={(event) => event.stopPropagation()}
                  >
                    <motion.div
                      className="talk-modal-wrap"
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
                      <div className="talk-modal">
                        <p className="talk-modal-kicker">Let&apos;s talk</p>
                        <DialogPrimitive.Title asChild>
                          <h2 className="talk-modal-heading">
                            {MODAL_HEADING}
                          </h2>
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description asChild>
                          <p className="talk-modal-lede">{MODAL_BODY}</p>
                        </DialogPrimitive.Description>
                        <p className="talk-modal-note">{MODAL_NOTE}</p>
                        <div className="talk-modal-action">
                          <motion.span
                            initial="rest"
                            whileHover="hover"
                            animate="rest"
                            className="inline-block"
                          >
                            <button
                              type="button"
                              className="link_btn w-inline-block"
                              onClick={goToBrief}
                            >
                              <div className="link_btn_text u-text-base">
                                Send a brief →
                              </div>
                              <BtnLines />
                            </button>
                          </motion.span>
                        </div>
                        <p className="talk-modal-mail">
                          Or{" "}
                          <a href={`mailto:${CONTACT_EMAIL}`}>
                            {CONTACT_EMAIL}
                          </a>
                        </p>
                        <DialogPrimitive.Close asChild>
                          <button
                            type="button"
                            className="talk-modal-close"
                            aria-label="Close"
                          >
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
