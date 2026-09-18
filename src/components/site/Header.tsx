"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { useLenis } from "lenis/react";
import { EASE } from "@/lib/utils";
import { HoverGroup, SlideUpHover } from "@/components/anim/SlideUpHover";
import { LinkBtn } from "@/components/anim/LinkBtn";
import { splitLines } from "@/components/anim/text";
import { useContactModal } from "@/components/chrome/ContactModal";
import { FALLBACK_NAV } from "@/lib/cms/constants";
import type { NavItem } from "@/lib/cms/types";

function navActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLabel(label: string) {
  const value = label.trim();
  if (/^blogs?$/i.test(value)) return "Insights";
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function navNs(href: string) {
  return href.replace(/^\//, "") || "home";
}

export function Header({ items }: { items?: NavItem[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const animating = useRef(false);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  const { openModal } = useContactModal();

  const nav = (items?.length ? items : FALLBACK_NAV).map((item) => ({
    ...item,
    label: navLabel(item.label),
  }));
  const menuLinks = [{ href: "/", label: "Home" }, ...nav];
  const isHome = pathname === "/";

  const goTalk = () => {
    closeMenu(true);
    openModal();
  };

  const openMenu = () => {
    if (animating.current) return;
    animating.current = true;
    setMenuOpen(true);
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";

    const menu = menuRef.current;
    if (!menu) return;
    menu.style.display = "flex";
    animate(
      menu,
      { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"] },
      { duration: 0.8, ease: EASE.power4inOut },
    ).then(() => {
      animating.current = false;
    });

    const links = menu.querySelectorAll<HTMLElement>(".nav_menu_link_text");
    links.forEach((link, i) => {
      if (!link.dataset.split) {
        link.dataset.split = "1";
        splitLines(link);
      }
      const lines = link.querySelectorAll<HTMLElement>(".split-line");
      if (!lines.length) return;
      lines.forEach((line) => {
        line.style.transform = "translateY(120%)";
      });
      animate(
        lines,
        { transform: ["translateY(120%)", "translateY(0%)"] },
        { duration: 0.8, ease: EASE.power4out, delay: 0.3 + i * 0.08 },
      );
    });
  };

  const closeMenu = (instant = false) => {
    const menu = menuRef.current;
    if (!menu) return;
    if (animating.current && !instant) return;
    setMenuOpen(false);
    if (instant) {
      menu.style.display = "none";
      menu.style.clipPath = "inset(0 0 100% 0)";
    } else {
      animating.current = true;
      animate(
        menu,
        { clipPath: ["inset(0 0 0% 0)", "inset(0 0 100% 0)"] },
        { duration: 0.5, ease: EASE.power4inOut },
      ).then(() => {
        menu.style.display = "none";
        animating.current = false;
      });
    }
    lenisRef.current?.start();
    document.documentElement.style.overflow = "";
  };

  useEffect(() => {
    document.body.classList.toggle("is-home", isHome);
    return () => document.body.classList.remove("is-home");
  }, [isHome]);

  useEffect(() => {
    closeMenu(true);
  }, [pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && menuOpen) closeMenu();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="site-chrome">
      <div className="navbar_container u-container">
        <div className="navbar_wrap grid-col-12" data-navbar="">
          <Link
            href="/"
            className="nav_logo_link w-inline-block"
            aria-label="Aevion Labs home"
          >
            <HoverGroup>
              <SlideUpHover>
                <span className="nav_logo" data-hover="slideup">
                  AEVION LABS
                </span>
              </SlideUpHover>
            </HoverGroup>
          </Link>

          <nav className="nav_links" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav_link w-inline-block${navActive(pathname, item.href) ? " is-active" : ""}`}
                data-nav-link={navNs(item.href)}
              >
                <HoverGroup>
                  <SlideUpHover>
                    <span className="nav_link_text u-text-base">{item.label}</span>
                  </SlideUpHover>
                </HoverGroup>
              </Link>
            ))}
          </nav>

          <div className="link_btn_wrap navbar">
            <LinkBtn onClick={goTalk} lineClassName="navbar">
              Let&apos;s talk
            </LinkBtn>
          </div>

          <div className="mobile_btns_wrap">
            <LinkBtn onClick={goTalk} lineClassName="navbar">
              Get in touch
            </LinkBtn>
            <button
              type="button"
              className="btn_btn"
              aria-expanded={menuOpen}
              aria-controls="site-nav-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
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
        id="site-nav-menu"
        className="nav_menu"
        style={{ display: "none", clipPath: "inset(0 0 100% 0)" }}
      >
        <div className="nav_menu_inner_wrap">
          <nav className="nav_menu_links" aria-label="Mobile">
            {menuLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav_menu_link"
                onClick={() => closeMenu(true)}
              >
                <div className="nav_menu_link_text">{item.label}</div>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
