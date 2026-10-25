import styles from "./HomeHero.module.css";

/** Ilustración del eclipse: esfera oscura, creciente de luz, halo, órbita y estrellas */
export function EclipseArt() {
  return (
    <svg
      className={styles.art}
      viewBox="0 0 900 700"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="eclipse-halo" cx="450" cy="330" r="250" gradientUnits="userSpaceOnUse">
          <stop offset="0.45" stopColor="#d6bc86" stopOpacity="0" />
          <stop offset="0.62" stopColor="#d6bc86" stopOpacity="0.22" />
          <stop offset="0.8" stopColor="#d6bc86" stopOpacity="0.06" />
          <stop offset="1" stopColor="#d6bc86" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="eclipse-sphere" cx="415" cy="290" r="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5a403b" />
          <stop offset="0.35" stopColor="#2c2321" />
          <stop offset="0.75" stopColor="#10181a" />
          <stop offset="1" stopColor="#0a100f" />
        </radialGradient>
        <linearGradient id="eclipse-crescent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efe6d6" stopOpacity="0.2" />
          <stop offset="1" stopColor="#f2d9a0" stopOpacity="0.9" />
        </linearGradient>
        <mask id="eclipse-crescent-mask" maskUnits="userSpaceOnUse" x="450" y="130" width="400" height="400">
          <rect x="450" y="130" width="400" height="400" fill="#fff" />
          <circle cx="560" cy="291" r="106" fill="#000" />
        </mask>
        <clipPath id="eclipse-orbit-front">
          <rect x="-420" y="0" width="840" height="200" />
        </clipPath>
      </defs>

      <circle className={styles.halo} cx="450" cy="330" r="250" fill="url(#eclipse-halo)" />

      <g transform="translate(450 365) rotate(-18)">
        <ellipse rx="400" ry="132" fill="none" stroke="#efe6d6" strokeOpacity="0.22" strokeWidth="1" />
        <circle cx="-372" cy="48" r="5" fill="#f2d9a0" />
      </g>

      <circle cx="450" cy="330" r="128" fill="url(#eclipse-sphere)" />
      <circle cx="450" cy="330" r="127.5" fill="none" stroke="#efe6d6" strokeOpacity="0.16" strokeWidth="1" />

      <g transform="translate(450 365) rotate(-18)">
        <ellipse
          rx="400"
          ry="132"
          fill="none"
          stroke="#efe6d6"
          strokeOpacity="0.28"
          strokeWidth="1"
          clipPath="url(#eclipse-orbit-front)"
        />
      </g>

      <g mask="url(#eclipse-crescent-mask)">
        <circle cx="568" cy="300" r="108" fill="url(#eclipse-crescent)" />
      </g>

      <g fill="#f2d9a0">
        <circle cx="152" cy="190" r="1.6" opacity="0.7" />
        <circle cx="806" cy="236" r="2" opacity="0.8" />
        <circle cx="228" cy="560" r="1.4" opacity="0.6" />
        <circle cx="690" cy="600" r="1.6" opacity="0.6" />
        <circle cx="96" cy="400" r="1.2" opacity="0.5" />
      </g>

      <path
        className={styles.sparkle}
        d="M532 250 L535 259 L544 262 L535 265 L532 274 L529 265 L520 262 L529 259 Z"
        fill="#efe6d6"
        fillOpacity="0.85"
      />
    </svg>
  );
}
