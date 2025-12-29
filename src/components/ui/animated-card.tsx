import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, hoverScale = 1.02, hoverY = -4, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl border border-border bg-card text-card-foreground shadow-lg",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{
          y: hoverY,
          scale: hoverScale,
          transition: { duration: 0.2, ease: "easeOut" },
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

interface AnimatedCardHeaderProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

const AnimatedCardHeader = React.forwardRef<HTMLDivElement, AnimatedCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-8", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);

AnimatedCardHeader.displayName = "AnimatedCardHeader";

interface AnimatedCardContentProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

const AnimatedCardContent = React.forwardRef<HTMLDivElement, AnimatedCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn("px-8 pb-8", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);

AnimatedCardContent.displayName = "AnimatedCardContent";

export { AnimatedCard, AnimatedCardHeader, AnimatedCardContent };
