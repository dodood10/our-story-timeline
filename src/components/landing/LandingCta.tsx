import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plan = "basic" | "premium";

interface LandingCtaProps {
  children: React.ReactNode;
  plan?: Plan;
  size?: "default" | "lg";
  className?: string;
  showArrow?: boolean;
}

export function LandingCta({
  children,
  plan = "premium",
  size = "lg",
  className,
  showArrow = true,
}: LandingCtaProps) {
  return (
    <Button asChild size={size} className={cn("text-base", className)}>
      <Link to="/surprise" search={{ plan }}>
        {children}
        {showArrow && <ArrowRight className="h-4 w-4 ml-1.5" />}
      </Link>
    </Button>
  );
}
