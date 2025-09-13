import { cn } from "@/lib/utils";
import { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityStyles: Record<Priority, string> = {
  critical: "priority-critical",
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

const priorityLabels: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
        priorityStyles[priority],
        className
      )}
    >
      {priorityLabels[priority]}
    </span>
  );
}