import type { ReactNode } from "react";

// Shared `t.rich` tags. <em> is the gold highlight of `.title em` and the inline
// `color:var(--acc2)` ems. Not every prototype <em> is gold (the CTA heading's isn't),
// so pass your own `em` where the prototype differs.
export const rich = {
  em: (chunks: ReactNode) => <em className="text-acc2">{chunks}</em>,
  br: () => <br />,
};
