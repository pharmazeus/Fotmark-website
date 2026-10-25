import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main
      id="contenido"
      className="wrap min-h-[70vh] pt-[clamp(150px,20vh,220px)] pb-section"
    >
      <p className="text-eyebrow tracking-[.42em] text-acc uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-6 max-w-sh text-title font-light">{title}</h1>
      <div className="mt-9 max-w-[700px] text-lead text-ink2">{children}</div>
    </main>
  );
}
