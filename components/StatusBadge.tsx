import { STATUS_LABELS, statusBadgeClass } from "@/lib/status";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "type-caption inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-semibold",
        statusBadgeClass(status),
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
