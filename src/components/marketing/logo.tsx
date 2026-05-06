import Image from "next/image";

const sizes = {
  sm: 80,
  md: 110,
  lg: 160,
  xl: 220,
};

export function VivZLogo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const px = sizes[size];

  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/viv-z-logo.png"
        alt="VIV-Z"
        width={px}
        height={px}
        className="object-contain"
        priority
      />
    </span>
  );
}

const wordmarkSizes = {
  sm: { fontSize: "1.25rem", gap: 8 },
  md: { fontSize: "1.6rem", gap: 10 },
  lg: { fontSize: "2.2rem", gap: 14 },
  xl: { fontSize: "3rem", gap: 18 },
};

export function VivZWordmark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const { fontSize, gap } = wordmarkSizes[size];
  return (
    <span
      className={`inline-flex items-center select-none ${className}`}
      style={{ gap }}
    >
      {/* Icon mark */}
      <svg
        width={parseInt(fontSize) * 1.1}
        height={parseInt(fontSize) * 1.1}
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden
      >
        <rect width="28" height="28" rx="7" fill="#ff5b04" />
        <path
          d="M7 8l4 8 4-8M19 8v12M15 14h6"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Wordmark */}
      <span
        style={{
          fontSize,
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: "#f5f5f7",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        VIV<span style={{ color: "#ff5b04" }}>-Z</span>
      </span>
    </span>
  );
}
