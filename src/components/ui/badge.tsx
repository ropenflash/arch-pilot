import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outline" | "critical" | "high" | "medium" | "low";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variant === "default" && "border-border bg-secondary text-secondary-foreground",
        variant === "outline" && "border-border text-muted-foreground",
        variant === "critical" && "border-red-500/30 bg-red-500/10 text-red-300",
        variant === "high" && "border-orange-500/30 bg-orange-500/10 text-orange-300",
        variant === "medium" && "border-amber-500/30 bg-amber-500/10 text-amber-200",
        variant === "low" &&
          "border-border bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
