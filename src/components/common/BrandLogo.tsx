import { useTheme } from "next-themes";
import logoDark from "@/assets/logo-dark.svg";
import logoWhite from "@/assets/logo-white.svg";

interface BrandLogoProps {
    className?: string;
    width?: number;
    height?: number;
}

export function BrandLogo({ className, width = 120, height = 40 }: BrandLogoProps) {
    return (
        <div className={`relative ${className}`} style={{ width, height }}>
            {/* Light Mode Logo (Dark Text/Icon) - Visible only in light mode */}
            <img
                src={logoDark}
                alt="Make Friends & Socialize"
                width={width}
                height={height}
                className="absolute inset-0 h-full w-auto object-contain dark:hidden"
            />
            {/* Dark Mode Logo (White Text/Icon) - Visible only in dark mode */}
            <img
                src={logoWhite}
                alt="Make Friends & Socialize"
                width={width}
                height={height}
                className="absolute inset-0 h-full w-auto object-contain hidden dark:block"
            />
        </div>
    );
}
