"use client";

import { useState, type ReactNode } from "react";
import { reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { GalleryImage } from "./GalleryImage";
import { Lightbox, type LightboxLabels } from "./Lightbox";
import { layoutColumns } from "./layout";
import type { GalleryCategory, GalleryPhoto } from "./types";
import { useContainerWidth } from "./useContainerWidth";

// Container width assumed for the server render (a 1440px viewport). The grid stays hidden
// (`reveal`) until the client has hydrated and measured, so nothing visibly jumps.
const SERVER_WIDTH = 1176;

type Props = {
  items: readonly GalleryPhoto[];
  categories: readonly GalleryCategory[];
  labels: LightboxLabels & { all: string; filters: string };
  // The section heading, rendered by the server beside the filters (`.pf-head`).
  head: ReactNode;
};

// Prototype `#proyectos` below the heading: category filters, the balanced masonry grid
// (columns from `layout.ts`) and the lightbox. Cells are buttons.
export function Gallery({ items, categories, labels, head }: Props) {
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [grid, setGrid] = useState<HTMLDivElement | null>(null);

  // The layout holds still while the lightbox covers the page (the page scrollbar
  // disappearing would otherwise re-balance the columns behind it).
  const width = useContainerWidth(grid, SERVER_WIDTH, lightbox.open);

  const visible = items.filter(
    (item) => filter === "all" || item.category === filter,
  );
  const columns = layoutColumns(visible, width);

  return (
    <>
      <div className="mb-[44px] flex flex-wrap items-end justify-between gap-[30px]">
        {head}
        <div
          role="group"
          aria-label={labels.filters}
          {...reveal(1)}
          className="flex flex-wrap gap-2"
        >
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            {labels.all}
          </FilterButton>
          {categories.map((category) => (
            <FilterButton
              key={category.key}
              active={filter === category.key}
              onClick={() => setFilter(category.key)}
            >
              {category.label}
            </FilterButton>
          ))}
        </div>
      </div>

      <div
        ref={setGrid}
        {...reveal(1)}
        // 14px = GALLERY_GAP in layout.ts: the gap the columns are balanced for.
        className="flex items-start gap-[14px]"
      >
        {columns.map((column, c) => (
          <div key={c} className="flex min-w-0 flex-1 flex-col gap-[14px]">
            {column.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() =>
                  setLightbox({ open: true, index: visible.indexOf(photo) })
                }
                className="group relative block w-full cursor-pointer overflow-hidden text-left before:pointer-events-none before:absolute before:inset-0 before:z-2 before:border-acc before:content-[''] before:[transition:border-width_.4s_var(--ease-fotmark)] hover:before:border-[1px]"
              >
                <GalleryImage photo={photo} variant="cell" />
                {/* `.cell .cap`: a one-off gradient into the `--cap-shade` token. */}
                <span className="absolute inset-0 z-3 flex items-end bg-[linear-gradient(180deg,transparent_55%,var(--cap-shade))] p-[18px] opacity-0 transition-opacity duration-500 ease-fotmark group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="[transform:translateY(8px)] text-micro tracking-[.24em] text-ink uppercase [transition:transform_.5s_var(--ease-fotmark)] group-hover:[transform:none] group-focus-visible:[transform:none]">
                    {photo.caption}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <Lightbox
        open={lightbox.open}
        photos={visible}
        index={lightbox.index}
        labels={labels}
        onIndexChange={(index) => setLightbox({ open: true, index })}
        onClose={() => setLightbox((state) => ({ ...state, open: false }))}
      />
    </>
  );
}

// Prototype `.fb`: hairline pill, gold border on hover, filled gold when on. A button's own
// UA font settings apply in the prototype (weight 400, `line-height: normal`).
function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "cursor-pointer border px-[17px] py-[9px] text-micro leading-[normal] font-normal tracking-label uppercase transition-all duration-[400ms] ease-fotmark",
        active
          ? "border-acc bg-acc text-on-acc"
          : "border-line2 text-mut hover:border-acc hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
