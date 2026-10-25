"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type NavLink = { id: string; label: string };

type Props = {
  brand: ReactNode;
  controls: ReactNode;
  links: NavLink[];
  menuFoot: string[];
  labels: { home: string; nav: string; open: string; close: string };
};

// Fixed header (blurs after 30px of scroll) + full-screen mobile menu.
// The menu is a sibling of <header>, not a child: the header's backdrop-filter would
// otherwise become the containing block of the fixed menu.
export function HeaderClient({
  brand,
  controls,
  links,
  menuFoot,
  labels,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const burger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        burger.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !menu.current) return;
      const items = Array.from(
        menu.current.querySelectorAll<HTMLElement>("a, button:not([disabled])"),
      );
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 951px)");
    const onChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <header
        id="hd"
        data-section="header"
        className={cn(
          "fixed inset-x-0 top-0 flex items-center justify-between border-b px-gut [transition:padding_.5s_var(--ease-fotmark),background_.5s,border-color_.5s]",
          scrolled
            ? "border-line bg-header-bg py-[15px] backdrop-blur-[16px] backdrop-saturate-[1.2]"
            : "border-transparent py-[26px]",
          // Above the open menu so the ✕ stays reachable (the prototype hid it).
          open ? "z-1060" : "z-1000",
        )}
      >
        <a
          href="#top"
          aria-label={labels.home}
          className="flex items-center gap-3"
        >
          {brand}
        </a>

        <div className="max-head:hidden head:flex head:items-center head:gap-3">
          <nav aria-label={labels.nav}>
            <ul className="flex items-center gap-4 wide:gap-9">
              {links.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={cn(
                      "link-underline text-nav text-ink2 uppercase hover:text-ink",
                      id === "contacto"
                        ? // prototype `nav.main .btn`: nav-link type and colours on the button
                          "btn [--btn-fg-hover:var(--ink)] [--btn-fg:var(--ink2)] [--btn-px:24px] [--btn-py:12px] [--btn-size:11.5px] [--btn-track:.18em]"
                        : "py-1",
                    )}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {controls}
        </div>

        <button
          ref={burger}
          type="button"
          aria-label={open ? labels.close : labels.open}
          aria-expanded={open}
          aria-controls="mn"
          onClick={() => setOpen((v) => !v)}
          className="z-1100 flex cursor-pointer touch-manipulation flex-col gap-1.5 p-2 head:hidden"
        >
          {[
            "[transform:translateY(7.5px)_rotate(45deg)]",
            "opacity-0",
            "[transform:translateY(-7.5px)_rotate(-45deg)]",
          ].map((openClass, i) => (
            <span
              key={i}
              className={cn(
                "block h-[1.5px] w-[26px] bg-ink [transition:transform_.4s_var(--ease-fotmark),opacity_.3s]",
                open && openClass,
              )}
            />
          ))}
        </button>
      </header>

      <nav
        ref={menu}
        id="mn"
        aria-label={labels.nav}
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={cn(
          "fixed inset-0 z-1050 flex flex-col justify-center overscroll-contain bg-bg1 px-gut [transition:opacity_.5s_var(--ease-fotmark),visibility_.5s] head:hidden",
          // Visible at once on open (focus can move in); fades out before hiding on close.
          open
            ? "visible opacity-100 [transition:opacity_.5s_var(--ease-fotmark),visibility_0s]"
            : "invisible opacity-0",
        )}
      >
        {links.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={close}
            className="group border-b border-line py-3 text-menu text-ink transition-colors duration-300 hover:text-acc"
          >
            <span className="inline-block [transition:transform_.4s_var(--ease-fotmark)] group-hover:translate-x-[14px]">
              {label}
            </span>
          </a>
        ))}
        <div className="mt-11 flex flex-wrap gap-[26px] text-menu-foot text-mut uppercase">
          {menuFoot.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="mt-7">{controls}</div>
      </nav>
    </>
  );
}
