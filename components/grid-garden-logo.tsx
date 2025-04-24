interface LogoProps {
  className?: string
  size?: "small" | "medium" | "large"
}

export function GridGardenLogo({ className = "", size = "medium" }: LogoProps) {
  // Size mapping
  const sizeMap = {
    small: {
      container: "h-8",
      logoHeight: 32,
      fontSize: "text-lg",
      spacing: "gap-1.5",
    },
    medium: {
      container: "h-12",
      logoHeight: 48,
      fontSize: "text-2xl",
      spacing: "gap-2",
    },
    large: {
      container: "h-16",
      logoHeight: 64,
      fontSize: "text-3xl",
      spacing: "gap-3",
    },
  }

  const { container, logoHeight, fontSize, spacing } = sizeMap[size]

  return (
    <div className={`flex items-center ${spacing} ${className}`}>
      {/* Logo Mark */}
      <div className="relative">
        <svg width={logoHeight} height={logoHeight} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid Square Background */}
          <rect x="4" y="4" width="56" height="56" rx="8" fill="#F3F4F6" stroke="#4B5563" strokeWidth="2" />

          {/* Grid Lines */}
          <line x1="22" y1="4" x2="22" y2="60" stroke="#4B5563" strokeWidth="1" />
          <line x1="42" y1="4" x2="42" y2="60" stroke="#4B5563" strokeWidth="1" />
          <line x1="4" y1="22" x2="60" y2="22" stroke="#4B5563" strokeWidth="1" />
          <line x1="4" y1="42" x2="60" y2="42" stroke="#4B5563" strokeWidth="1" />

          {/* Leaf */}
          <path
            d="M42 22C42 22 50 14 56 18C62 22 56 42 42 42C28 42 22 22 28 18C34 14 42 22 42 22Z"
            fill="#4ADE80"
            stroke="#166534"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Leaf Vein */}
          <path d="M42 22C42 22 42 32 42 42" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Logo Text */}
      <div className={`font-sans font-bold ${fontSize} flex items-center`}>
        <span className="text-gray-700">Grid</span>
        <span className="text-green-600">Garden</span>
      </div>
    </div>
  )
}
