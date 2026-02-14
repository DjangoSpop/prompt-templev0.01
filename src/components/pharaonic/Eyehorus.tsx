import React from "react";

type Props = {
	size?: number;
	variant?: string | number;
	glow?: boolean;
	glowIntensity?: "low" | "medium" | "high";
	showLabel?: boolean;
	labelText?: string;
	className?: string;
};

export default function Eyehorus({
	size = 120,
	variant = "1",
	glow = true,
	glowIntensity = "medium",
	showLabel = false,
	labelText = "PromptTemple",
	className = "",
}: Props) {
	const labelSize = Math.max(12, Math.round(size * 0.14));
	const glowStdDeviation = glowIntensity === "high" ? 4 : glowIntensity === "medium" ? 2.5 : 1.5;

	return (
		<div className={`inline-flex flex-col items-center ${className}`}>
			<svg
				width={size}
				height={size}
				viewBox="0 0 120 120"
				role="img"
				aria-label="Eye of Horus - PromptTemple Logo"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					{/* Royal Gold Gradient */}
					<linearGradient id={`royal-gold-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#f4d03f" />
						<stop offset="25%" stopColor="#f6d365" />
						<stop offset="50%" stopColor="#d4af37" />
						<stop offset="75%" stopColor="#c5a028" />
						<stop offset="100%" stopColor="#b8941f" />
					</linearGradient>

					{/* Inner Glow Gradient */}
					<radialGradient id={`inner-glow-${variant}`}>
						<stop offset="0%" stopColor="#ffd700" stopOpacity="0.9" />
						<stop offset="50%" stopColor="#f6d365" stopOpacity="0.5" />
						<stop offset="100%" stopColor="#d4af37" stopOpacity="0.2" />
					</radialGradient>

					{/* Glow Filter - Pharaonic Gold */}
					<filter id={`pharaonic-glow-${variant}`} x="-100%" y="-100%" width="300%" height="300%">
						<feGaussianBlur stdDeviation={glowStdDeviation} result="coloredBlur" />
						<feFlood floodColor="#f4d03f" floodOpacity="0.7" result="glowColor" />
						<feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
						<feMerge>
							<feMergeNode in="softGlow" />
							<feMergeNode in="softGlow" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>

					{/* Shadow Filter */}
					<filter id={`drop-shadow-${variant}`}>
						<feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#d4af37" floodOpacity="0.5"/>
					</filter>
				</defs>

				<g filter={glow ? `url(#pharaonic-glow-${variant})` : undefined}>
					{/* Upper Eye Lid - Iconic Horus Shape */}
					<path
						d="M 20 60 Q 30 35, 60 35 Q 90 35, 100 60"
						fill="none"
						stroke={`url(#royal-gold-${variant})`}
						strokeWidth="3.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* Lower Eye Lid */}
					<path
						d="M 20 60 Q 30 75, 60 75 Q 90 75, 100 60"
						fill="none"
						stroke={`url(#royal-gold-${variant})`}
						strokeWidth="3.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* Eye Fill - Dark Background */}
					<ellipse
						cx="60"
						cy="55"
						rx="35"
						ry="18"
						fill="rgba(15, 15, 20, 0.8)"
					/>

					{/* Iris - Glowing Center */}
					<ellipse
						cx="60"
						cy="55"
						rx="12"
						ry="12"
						fill={`url(#inner-glow-${variant})`}
						filter={`url(#drop-shadow-${variant})`}
					/>

					{/* Pupil - Deep Black */}
					<circle
						cx="60"
						cy="55"
						r="5"
						fill="rgba(10, 10, 10, 0.95)"
					/>

					{/* Inner Eye Highlight */}
					<ellipse
						cx="62"
						cy="53"
						rx="2"
						ry="2.5"
						fill="rgba(255, 255, 255, 0.6)"
					/>

					{/* Horus Markings - Right Side Extension */}
					<path
						d="M 100 60 Q 105 65, 108 72 L 105 75 Q 102 70, 100 65"
						fill={`url(#royal-gold-${variant})`}
						opacity="0.95"
					/>

					{/* Horus Spiral Tail - Bottom Left */}
					<path
						d="M 35 75 Q 38 80, 35 85 Q 32 88, 28 86 Q 25 84, 26 80 Q 27 77, 30 76 Q 32 75.5, 35 75"
						fill={`url(#royal-gold-${variant})`}
						opacity="0.95"
					/>

					{/* Under-Eye Mark */}
					<path
						d="M 60 75 L 60 88 M 55 82 L 65 82"
						stroke={`url(#royal-gold-${variant})`}
						strokeWidth="2.5"
						strokeLinecap="round"
					/>

					{/* Top Eyebrow Extension */}
					<path
						d="M 18 55 Q 15 50, 12 48"
						stroke={`url(#royal-gold-${variant})`}
						strokeWidth="2.5"
						strokeLinecap="round"
					/>

					{/* Additional Detail - Inner Corner */}
					<path
						d="M 20 60 L 15 60"
						stroke={`url(#royal-gold-${variant})`}
						strokeWidth="2.5"
						strokeLinecap="round"
					/>
				</g>
			</svg>

			{showLabel && (
				<div
					style={{
						marginTop: 8,
						fontFamily: "'Playfair Display', serif",
						fontWeight: 700,
						fontSize: labelSize,
						background: "linear-gradient(135deg, #f4d03f 0%, #d4af37 50%, #b8941f 100%)",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						backgroundClip: "text",
						letterSpacing: 1.5,
						textTransform: "uppercase",
						textShadow: glow ? "0 0 20px rgba(212, 175, 55, 0.5)" : "none",
					}}
				>
					{labelText}
				</div>
			)}
		</div>
	);
}

