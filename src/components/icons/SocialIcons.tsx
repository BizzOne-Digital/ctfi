/**
 * Minimal inline brand icons. lucide-react removed brand/social icons, so we
 * ship small hand-drawn SVGs here instead of adding a new dependency.
 */
import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.9h2.65l.4-3.08H13.5V8.05c0-.89.25-1.5 1.52-1.5h1.63V3.8C16.34 3.75 15.4 3.68 14.3 3.68c-2.3 0-3.87 1.4-3.87 3.98v2.36H7.77v3.08h2.66V21h3.07z" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 2h-3.2v13.4c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .5 0 .8.1V9.7c-.3 0-.5-.1-.8-.1-3.1 0-5.7 2.5-5.7 5.7S8 21 11.1 21s5.7-2.5 5.7-5.7V8.4c1.2.9 2.7 1.4 4.3 1.4V6.6c-2.4 0-4.5-1.9-4.5-4.3V2z" />
    </svg>
  );
}
