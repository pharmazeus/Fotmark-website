import type { ReactNode } from "react";

// Line icons of the approved `/qr` mockup: 24px grid, stroked with currentColor.
function Icon({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

type Props = { className: string };

export const GlobeIcon = ({ className }: Props) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5s1.2-6.1 3.6-8.5z" />
  </Icon>
);

export const PhoneIcon = ({ className }: Props) => (
  <Icon className={className}>
    <path d="M5 3.5h3.5l1.6 4.2-2.2 1.5a11 11 0 0 0 6.9 6.9l1.5-2.2 4.2 1.6V19a1.6 1.6 0 0 1-1.7 1.6C10.5 20.1 3.9 13.5 3.4 5.2A1.6 1.6 0 0 1 5 3.5z" />
  </Icon>
);

export const InstagramIcon = ({ className }: Props) => (
  <Icon className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r=".6" />
  </Icon>
);

export const WhatsAppIcon = ({ className }: Props) => (
  <Icon className={className}>
    <path d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.4 18.6z" />
    <path d="M9.2 8.6c.3 2.6 2.4 5 5.3 5.9l1.1-1.2 1.9.8-.3 1.6c-3.9.4-8.2-3.6-8.4-7.6l1.6-.4.9 1.8z" />
  </Icon>
);

export const MailIcon = ({ className }: Props) => (
  <Icon className={className}>
    <rect x="3" y="5.5" width="18" height="13" />
    <path d="M3.5 6l8.5 7 8.5-7" />
  </Icon>
);

export const AddContactIcon = ({ className }: Props) => (
  <Icon className={className}>
    <circle cx="10" cy="8" r="4" />
    <path d="M3 20c.6-3.6 3.4-6 7-6 1.7 0 3.2.5 4.4 1.4M18 14v6M15 17h6" />
  </Icon>
);
