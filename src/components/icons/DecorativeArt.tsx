/**
 * Hand-authored vector art used as elegant fallbacks wherever a page section
 * has no admin-uploaded photo yet (fresh install, or a slot the studio
 * hasn't filled in). Deliberately abstract — a photography studio's brand
 * should be carried by the studio's own photos, not by a generic stock or
 * AI-generated image pretending to be sample work. These are pure CSS/SVG,
 * so they need no external files, keep the bundle tiny, and always render
 * crisply at any size.
 *
 * Swap either component out (or delete it) the moment real photography is
 * uploaded through the admin Media Library — that always takes priority,
 * see Hero.tsx / ContentBlock.tsx.
 */

/** Moody, atmospheric backdrop for the homepage Hero when no photo is set. */
export function ApertureHeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ctfi-hero-wash" cx="32%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#C08A4E" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#9C5A34" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#2B2420" stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id="ctfi-hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3E3C6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F3E3C6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ctfi-hero-blade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3E3C6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F3E3C6" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#ctfi-hero-wash)" />

      {/* soft bokeh */}
      <circle cx="1290" cy="190" r="120" fill="url(#ctfi-hero-glow)" opacity="0.5" />
      <circle cx="1410" cy="620" r="70" fill="url(#ctfi-hero-glow)" opacity="0.4" />
      <circle cx="220" cy="700" r="90" fill="url(#ctfi-hero-glow)" opacity="0.35" />
      <circle cx="150" cy="150" r="45" fill="url(#ctfi-hero-glow)" opacity="0.3" />

      {/* aperture iris motif, off-center so it frames rather than competes with headline text */}
      <g transform="translate(1160 450)" opacity="0.55">
        <circle r="260" fill="none" stroke="#F3E3C6" strokeOpacity="0.18" strokeWidth="1.5" />
        <circle r="210" fill="none" stroke="#F3E3C6" strokeOpacity="0.22" strokeWidth="1.5" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <polygon
              key={i}
              points="0,-32 150,-95 150,95 0,32"
              fill="url(#ctfi-hero-blade)"
              stroke="#F3E3C6"
              strokeOpacity="0.2"
              strokeWidth="1"
              transform={`rotate(${angle})`}
            />
          );
        })}
        <circle r="34" fill="none" stroke="#F3E3C6" strokeOpacity="0.4" strokeWidth="1.5" />
      </g>

      {/* fine grain-like scatter for texture */}
      <g fill="#F3E3C6" opacity="0.12">
        {Array.from({ length: 40 }).map((_, i) => (
          <circle key={i} cx={(i * 197) % 1600} cy={(i * 331) % 900} r={i % 5 === 0 ? 2 : 1} />
        ))}
      </g>
    </svg>
  );
}

/** Light, editorial-style filler for content-block image slots (About/Home sections). */
export function AperturePanelArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ctfi-panel-wash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E9DCC5" />
          <stop offset="100%" stopColor="#D9C6A3" />
        </linearGradient>
        <radialGradient id="ctfi-panel-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBF6EF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FBF6EF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill="url(#ctfi-panel-wash)" />
      <circle cx="330" cy="55" r="70" fill="url(#ctfi-panel-glow)" opacity="0.8" />
      <circle cx="55" cy="250" r="50" fill="url(#ctfi-panel-glow)" opacity="0.6" />

      <g transform="translate(200 150)">
        <circle r="86" fill="none" stroke="#9C5A34" strokeOpacity="0.25" strokeWidth="1.5" />
        <circle r="68" fill="none" stroke="#9C5A34" strokeOpacity="0.3" strokeWidth="1.5" />
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i * 360) / 7;
          return (
            <polygon
              key={i}
              points="0,-12 46,-30 46,30 0,12"
              fill="#9C5A34"
              fillOpacity="0.08"
              stroke="#9C5A34"
              strokeOpacity="0.28"
              strokeWidth="1"
              transform={`rotate(${angle})`}
            />
          );
        })}
        <circle r="12" fill="none" stroke="#9C5A34" strokeOpacity="0.45" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
