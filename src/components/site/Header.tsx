"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { useLenis } from "lenis/react";
import { EASE } from "@/lib/utils";
import { HoverGroup, SlideUpHover } from "@/components/anim/SlideUpHover";
import { LinkBtn } from "@/components/anim/LinkBtn";
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
    document.body.classList.add("nav-menu-open");

    const menu = menuRef.current;
    if (!menu) {
      animating.current = false;
      return;
    }
    menu.style.display = "flex";
    animate(
      menu,
      { opacity: [0, 1] },
      { duration: 0.35, ease: EASE.power2out },
    ).then(() => {
      animating.current = false;
    });
  };

  const closeMenu = (instant = false) => {
    const menu = menuRef.current;
    if (!menu) return;
    if (animating.current && !instant) return;
    setMenuOpen(false);
    document.body.classList.remove("nav-menu-open");
    if (instant) {
      menu.style.display = "none";
      menu.style.opacity = "0";
      animating.current = false;
    } else {
      animating.current = true;
      animate(
        menu,
        { opacity: [1, 0] },
        { duration: 0.28, ease: EASE.power2inOut },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close on route change only
  }, [pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && menuOpen) closeMenu(true);
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
    <div className={`site-chrome${menuOpen ? " is-menu-open" : ""}`}>
      <div className="navbar_container u-container">
        <div className="navbar_wrap grid-col-12" data-navbar="">
          <Link
            href="/"
            className="nav_logo_link w-inline-block"
            aria-label="Aevion Labs home"
            onClick={() => closeMenu(true)}
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
                    <span className="nav_link_text u-text-base">
                      {item.label}
                    </span>
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
            <button
              type="button"
              className={`nav_burger${menuOpen ? " is-open" : ""}`}
              aria-expanded={menuOpen}
              aria-controls="site-nav-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => (menuOpen ? closeMenu() : openMenu())}
            >
              <span className="nav_burger_lines" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={menuRef}
        id="site-nav-menu"
        className="nav_menu"
        style={{ display: "none", opacity: 0 }}
        aria-hidden={!menuOpen}
      >
        <div className="nav_menu_inner_wrap">
          <p className="nav_menu_kicker">Menu</p>
          <nav className="nav_menu_links" aria-label="Mobile">
            {menuLinks.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav_menu_link${navActive(pathname, item.href) ? " is-active" : ""}`}
                onClick={() => closeMenu(true)}
              >
                <span className="nav_menu_index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="nav_menu_link_text">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="nav_menu_footer">
            <button type="button" className="nav_menu_cta" onClick={goTalk}>
              Let&apos;s talk
            </button>
            <p className="nav_menu_place">Manchester · Sites, SaaS, tools</p>
          </div>
        </div>
      </div>
    </div>
  );
}
