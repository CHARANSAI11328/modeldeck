import type { SVGProps } from "react";
const paths = {
  copy: "M8 8h13v13H8V8ZM16 8V3H3v13h5",
  retry: "M20 8a8 8 0 1 0 0 8M20 3v5h-5",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  up: "M12 19V5m-6 6 6-6 6 6",
  plus: "M12 5v14M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  chat: "M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0ZM7 9h8M7 13h5",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16",
  spark: "m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z",
  key: "M14 14a5 5 0 1 0-4-4L3 17v4h4v-3h3l4-4ZM16 7h.01",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6",
  layers: "m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5",
  search: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 6 6",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
  panel: "M3 4h18v16H3V4Zm5 0v16m6-11-3 3 3 3",
  check: "m5 12 4 4L19 6",
  book: "M12 5v16M3 3c4 0 6 0 9 2 3-2 5-2 9-2v16c-4 0-6 0-9 2-3-2-5-2-9-2V3Z",
  globe:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z",
  stop: "M6 6h12v12H6Z",
  chevron: "m8 5 7 7-7 7",
} as const;
export function DeckIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function DeckLogo() {
  return (
    <span className="deck-logo" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
