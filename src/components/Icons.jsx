const base = {
  width: 14,
  height: 14,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

/** Arrow pointing up and to the right — the "this leaves the page" mark. */
export const ArrowUpRight = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </svg>
)

export const ArrowDown = (p) => (
  <svg {...base} {...p}>
    <path d="M8 3v10M4 9l4 4 4-4" />
  </svg>
)

export const Plus = (p) => (
  <svg {...base} {...p}>
    <path d="M8 3v10M3 8h10" />
  </svg>
)

export const Sun = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="2.8" />
    <path d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1" />
  </svg>
)

export const Moon = (p) => (
  <svg {...base} {...p}>
    <path d="M13.4 9.6A5.6 5.6 0 0 1 6.4 2.6a5.6 5.6 0 1 0 7 7z" />
  </svg>
)

export const Grid = (p) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <rect x="2" y="2" width="5" height="5" rx="0.6" />
    <rect x="9" y="2" width="5" height="5" rx="0.6" />
    <rect x="2" y="9" width="5" height="5" rx="0.6" />
    <rect x="9" y="9" width="5" height="5" rx="0.6" />
  </svg>
)

export const Close = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
  </svg>
)
