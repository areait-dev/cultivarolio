import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { "aria-hidden": true, focusable: false } as const;

export const IconaFreccia = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...base} {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const IconaFrecciaIndietro = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...base} {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconaPlay = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
  </svg>
);

export const IconaYouTube = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
  </svg>
);

export const IconaInstagram = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconaFacebook = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path fill="currentColor" d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.4 1.5-1.4h1.5V4.5a20 20 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8v2.3H8v3h2.6V21z" />
  </svg>
);

export const IconaTikTok = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path fill="currentColor" d="M16.6 3h-3v12.1a2.6 2.6 0 1 1-2.6-2.6 2.5 2.5 0 0 1 .8.1V9.5a5.6 5.6 0 1 0 4.8 5.6V9.2a7 7 0 0 0 4 1.3v-3a4 4 0 0 1-4-4.5z" />
  </svg>
);
