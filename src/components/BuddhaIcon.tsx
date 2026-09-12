import React from "react";

interface BuddhaIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Minimalistisches Buddha-Icon im Lucide-Stil für den Sicherheits-Topf (Peace of Mind / Gelassenheit).
 */
export function BuddhaIcon({ className = "w-4 h-4", size, ...props }: BuddhaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      {...props}
    >
      {/* Ushnisha / Krone */}
      <path d="M12 2v1.5" />
      {/* Kopf */}
      <circle cx="12" cy="6.5" r="2.5" />
      {/* Schultern und Oberkörper */}
      <path d="M7 14c0-2.4 2.2-4 5-4s5 1.6 5 4" />
      {/* Hände in Meditationshaltung (Dhyana-Mudra) */}
      <path d="M9.5 15c1.4.7 3.6.7 5 0" />
      {/* Lotussitz / Gekreuzte Beine & Knie */}
      <path d="M3.5 19.5c.7-1.4 3-2.5 5.5-2.5 1 .5 2 .7 3 .7s2-.2 3-.7c2.5 0 4.8 1.1 5.5 2.5-1.6 1.4-4.6 2-8.5 2s-6.9-.6-8.5-2z" />
    </svg>
  );
}
