import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
  linkTo?: string;
}

const Logo = ({ 
  size = "md", 
  showText = true, 
  showIcon = true,
  className,
  linkTo = "/"
}: LogoProps) => {
  const sizeClasses = {
    sm: {
      container: "w-6 h-6",
      icon: "w-3 h-3",
      text: "text-sm"
    },
    md: {
      container: "w-8 h-8",
      icon: "w-4 h-4",
      text: "text-base"
    },
    lg: {
      container: "w-10 h-10",
      icon: "w-5 h-5",
      text: "text-lg"
    },
    xl: {
      container: "w-12 h-12",
      icon: "w-6 h-6",
      text: "text-xl"
    }
  };

  const { container, icon, text } = sizeClasses[size];

  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <div className={cn(
          "rounded-full bg-gradient-to-br from-coral-400 to-dusty-500 flex items-center justify-center",
          container
        )}>
          <Heart className={cn("text-white", icon)} />
        </div>
      )}
      {showText && (
        <span className={cn("font-medium tracking-normal", text, className)}>
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