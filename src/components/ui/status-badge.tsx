import { cn } from "@/lib/utils";
import { Status } from "@/types";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  open: "status-open",
  hold: "status-hold",
  completed: "status-completed",
};

const statusLabels: Record<Status, string> = {
  open: "Open",
  hold: "On Hold",
  completed: "Completed",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}