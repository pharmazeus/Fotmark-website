import type { ReactNode } from "react";

// Service icons, copied verbatim from the prototype (`.svc-ic svg`). Decorative: the
// card's h3 names the service. Stroke settings = prototype `.svc-ic svg{…}`.
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-full"
    >
      {children}
    </svg>
  );
}

// 01 camera
export function CameraIcon() {
  return (
    <Icon>
      <circle cx="16" cy="17" r="8.5" />
      <path d="M9 8l2-3h10l2 3" />
      <path d="M4 8h24a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
    </Icon>
  );
}

// 02 video camera
export function VideoIcon() {
  return (
    <Icon>
      <rect x="3" y="8" width="18" height="16" rx="2" />
      <path d="M21 13l8-4v14l-8-4z" />
      <path d="M9 13l5 3-5 3z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

// 03 drone
export function DroneIcon() {
  return (
    <Icon>
      <circle cx="16" cy="16" r="3" />
      <path d="M13 13l-4-4M19 13l4-4M13 19l-4 4M19 19l4 4" />
      <circle cx="7" cy="7" r="3.2" />
      <circle cx="25" cy="7" r="3.2" />
      <circle cx="7" cy="25" r="3.2" />
      <circle cx="25" cy="25" r="3.2" />
    </Icon>
  );
}

// 04 network graph
export function NetworkIcon() {
  return (
    <Icon>
      <circle cx="8" cy="10" r="3.2" />
      <circle cx="24" cy="8" r="3.2" />
      <circle cx="22" cy="23" r="3.2" />
      <circle cx="9" cy="22" r="3.2" />
      <path d="M10.8 11.5l10.5-2.2M22.5 10.8l.4 9.4M20 22l-8.5.4M9.5 19.3l-.8-6" />
    </Icon>
  );
}

// 05 target
export function TargetIcon() {
  return (
    <Icon>
      <circle cx="16" cy="16" r="13" />
      <circle cx="16" cy="16" r="8" />
      <circle cx="16" cy="16" r="3" />
      <path d="M16 3v5M16 24v5M3 16h5M24 16h5" />
    </Icon>
  );
}

// 06 star
export function StarIcon() {
  return (
    <Icon>
      <path
        d="M16 3l4 9 9 1-6.5 6 2 9-8.5-4.8L9.5 33l2-9L5 18l9-1z"
        transform="scale(0.82) translate(3.5 1)"
      />
    </Icon>
  );
}
