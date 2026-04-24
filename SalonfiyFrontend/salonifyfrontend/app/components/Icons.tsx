import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const SparkleIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </svg>
);

export const FlowerIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="2.2" />
    <path d="M12 4a3 3 0 0 1 3 3c0 1.7-1.3 3-3 3s-3-1.3-3-3a3 3 0 0 1 3-3Z" />
    <path d="M12 14c1.7 0 3 1.3 3 3a3 3 0 0 1-6 0c0-1.7 1.3-3 3-3Z" />
    <path d="M4 12a3 3 0 0 1 3-3c1.7 0 3 1.3 3 3s-1.3 3-3 3a3 3 0 0 1-3-3Z" />
    <path d="M14 12c0-1.7 1.3-3 3-3a3 3 0 0 1 0 6c-1.7 0-3-1.3-3-3Z" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const MapPinIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const StarIcon = (p: IconProps) => (
  <svg {...base} {...p} fill="currentColor" strokeWidth={1}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.9L12 16.9 6.7 19.7l1-5.9-4.2-4.1 5.9-.9L12 3.5Z" />
  </svg>
);

export const StarOutlineIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.9L12 16.9 6.7 19.7l1-5.9-4.2-4.1 5.9-.9L12 3.5Z" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="3" />
    <path d="M8 3v4M16 3v4M3.5 10h17" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const PhoneIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 4h3l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const HeartIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);

export const XIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.8-3.5 4.8-5 8-5s6.2 1.5 8 5" />
  </svg>
);

export const ScissorsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <path d="M8 8l12 12M8 16 20 4" />
  </svg>
);

export const BellIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const DashboardIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="7" height="8" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
    <rect x="3.5" y="14" width="7" height="6.5" rx="1.5" />
    <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const InstagramIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r=".6" fill="currentColor" />
  </svg>
);

export const GlobeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
  </svg>
);
