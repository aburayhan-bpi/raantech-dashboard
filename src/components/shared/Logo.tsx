import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

const Logo = ({ className, iconOnly = false }: LogoProps) => {
  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 200 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Main Icon Mark */}
        <rect x="10" y="10" width="12" height="30" rx="2" fill="#3B82F6" />

        {/* Accent Mark - Should adapt to background */}
        <rect
          x="25"
          y="15"
          width="8"
          height="20"
          rx="1.5"
          fill="currentColor"
          className="opacity-40"
        />

        {!iconOnly && (
          <text
            x="45"
            y="35"
            fill="currentColor"
            style={{
              font: "bold 28px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            Integris
          </text>
        )}
      </svg>
    </div>
  );
};

export default Logo;
