import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-4 py-2",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground border border-transparent hover:opacity-90 active:opacity-95",
        outline:
          "bg-surface text-foreground border border-border-control hover:bg-surface-subtle active:bg-surface-subtle",
        subtle:
          "bg-surface-subtle text-foreground border border-border-control hover:bg-surface active:bg-surface",
        danger:
          "bg-loss-bg text-loss-text border border-loss-border hover:opacity-90 active:opacity-95",
      },
      size: {
        default: "min-h-[44px] px-4 py-2",
        sm: "min-h-[44px] px-3 py-1.5 text-xs",
        icon: "min-h-[44px] min-w-[44px] p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
