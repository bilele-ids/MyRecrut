import { cn } from "@/lib/utils";
import type { Status } from "@/types";
import { STATUS_COLORS } from "@/types";

export function Badge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        STATUS_COLORS[status]
      )}
    >
      {status}
    </span>
  );
}
