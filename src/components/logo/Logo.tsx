import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logomarkSvg from "./logomark01.svg";
import logomarkDarkSvg from "./logomark01-dark.svg";

const Logomark = ({ className, variant = "light" }: { className?: string; variant?: "light" | "dark" }) => (
  <img src={variant === "dark" ? logomarkDarkSvg : logomarkSvg} alt="Family Shapes Logo" className={className} />
);

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
  linkTo?: string;
  variant?: "light" | "dark";
}

const Logo = ({ 
  size = "md", 
  showText = true, 
  showIcon = true,
  className,
  linkTo = "/",
  variant = "light"
}: LogoProps) => {
  const sizeClasses = {
    sm: {
      container: "w-7 h-7",
      icon: "w-4 h-4",
      iconOnly: "w-12 h-12",
      text: "text-sm"
    },
    md: {
      container: "w-10 h-10",
      icon: "w-5 h-5",
      iconOnly: "w-15 h-15",
      text: "text-base"
    },
    lg: {
      container: "w-12 h-12",
      icon: "w-6 h-6",
      iconOnly: "w-18 h-18",
      text: "text-lg"
    },
    xl: {
      container: "w-14 h-14",
      icon: "w-7 h-7",
      iconOnly: "w-21 h-21",
      text: "text-xl"
    }
  };

  const { container, icon, iconOnly, text } = sizeClasses[size];
  const iconSize = showText ? icon : iconOnly;

  const logoContent = (
    <div className={cn("flex items-center ", className)}>
      {showIcon && (
        <div className={cn(
          "flex items-center justify-center",
          container
        )}>
          <Logomark className={cn(iconSize)} variant={variant} />
        </div>
      )}
      {showText && (
        <span className={cn("font-medium tracking-normal -ml-1", text, className)}>
          <span>Family</span>
          <span className="text-coral-600">Shapes</span>
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo; 