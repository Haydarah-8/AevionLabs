"use client";

import { animate, stagger } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/lib/utils";
import { HoverGroup, SlideUpHover } from "@/components/anim/SlideUpHover";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { TransitionLink } from "@/components/chrome/PageTransition";
import { useContactModal } from "@/components/chrome/ContactModal";
import { useLenis } from "lenis/react";
import { splitLines } from "@/components/anim/text";

const NAV_LINKS = [
  { href: "/work", label: "Work", ns: "work" },
  { href: "/services", label: "Services", ns: "services" },
  { href: "/about", label: "About", ns: "about" },
];

const MENU_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "work" },
  { href: "/services", label: "services" },
  { href: "/about", label: "about" },
];

export function Navbar() {
  const pathname = usePathname();
  const { openModal } = useContactModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const animating = useRef(false);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const isHome = pathname === "/";
  const activeNs = pathname.replace("/", "");

  /* body.is-home drives nav link colors (mirrors the original custom CSS) */
  useEffect(() => {
    document.body.classList.toggle("is-home", isHome);
  }, [isHome]);

  const openMenu = () => {
    if (animating.current) return;
    animating.current = true;
    setMenuOpen(true);
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";

    const menu = menuRef.current!;
    menu.style.display = "flex";
    animate(
      menu,
      { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"] },
      { duration: 0.8, ease: EASE.power4inOut }
    ).then(() => (animating.current = false));

    const links = menu.querySelectorAll<HTMLElement>(".nav_menu_link_text");
    links.forEach((link, i) => {
      if (!link.dataset.split) {
        link.dataset.split = "1";
        splitLines(link);
      }
      const lines = link.querySelectorAll<HTMLElement>(".split-line");
      if (!lines.length) return;
      lines.forEach((l) => (l.style.transform = "translateY(120%)"));
      animate(
        lines,
        { transform: ["translateY(120%)", "translateY(0%)"] },
        { duration: 0.8, ease: EASE.power4out, delay: 0.3 + i * 0.08 }
      );
    });
  };

  const closeMenu = (instant = false) => {
    if (animating.current && !instant) return;
    const menu = menuRef.current!;
    setMenuOpen(false);
    if (instant) {
      const links = menu.querySelectorAll<HTMLElement>(".nav_menu_link_text");
      if (!links.length) return;
      animate(links, { opacity: 0 }, { duration: 0.3, ease: EASE.power2in }).then(() => {
        menu.style.display = "none";
        menu.style.clipPath = "inset(0 0 100% 0)";
        links.forEach((l) => (l.style.opacity = "1"));
      });
    } else {
      animating.current = true;
      animate(
        menu,
        { clipPath: ["inset(0 0 0% 0)", "inset(0 0 100% 0)"] },
        { duration: 0.5, ease: EASE.power4inOut }
      ).then(() => {
        menu.style.display = "none";
        animating.current = false;
      });
    }
    lenisRef.current?.start();
    document.documentElement.style.overflow = "";
  };

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && menuOpen) closeMenu();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  return (
    <>
      <div className="navbar_container u-container">
        <div className="navbar_wrap grid-col-12" data-navbar="" style={{ pointerEvents: "auto" }}>
          <TransitionLink href="/" className="nav_logo_link w-inline-block" aria-label="AEVION LABS home">
            <HoverGroup>
              <SlideUpHover>
                <span className="nav_logo" data-hover="slideup">
                  AEVION LABS
                </span>
              </SlideUpHover>
            </HoverGroup>
          </TransitionLink>
          <div className="nav_links">
            {NAV_LINKS.map((l) => (
              <TransitionLink
                key={l.href}
                href={l.href}
                className={`nav_link w-inline-block${activeNs === l.ns ? " is-active" : ""}`}
                data-nav-link={l.ns}
              >
                <HoverGroup>
                  <SlideUpHover>
                    <span className="nav_link_text u-text-base">{l.label}</span>
                  </SlideUpHover>
                </HoverGroup>
              </TransitionLink>
            ))}
          </div>
          <div className="link_btn_wrap navbar">
            <LinkBtn onClick={openModal} lineClassName="navbar">
              Let&apos;s talk
            </LinkBtn>
          </div>
          <div className="mobile_btns_wrap">
            <LinkBtn onClick={openModal} lineClassName="navbar">
              Get in touch
            </LinkBtn>
            <button
              type="button"
              className="btn_btn"
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
            >
              <HoverGroup hovered={menuOpen}>
                <SlideUpHover className="link_btn_text u-text-base" clone={<>Close</>}>
                  Menu
                </SlideUpHover>
              </HoverGroup>
              <div className="link_btn_line navbar" />
              <div className="link_btn_line is-2 navbar" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={menuRef}
        className="nav_menu"
        data-nav-menu=""
        style={{ display: "none", clipPath: "inset(0 0 100% 0)" }}
      >
        <div className="nav_menu_inner_wrap">
          <div className="nav_menu_links">
            {MENU_LINKS.map((l) => (
              <TransitionLink
                key={l.href}
                href={l.href}
                className="nav_menu_link w-inline-block"
                onNavigate={() => closeMenu(true)}
              >
                <div className="nav_menu_link_text u-text-xl">{l.label}</div>
              </TransitionLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
