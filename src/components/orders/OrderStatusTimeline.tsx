import React from "react";
import { OrderStatusEntry } from "@/types";

export default function OrderStatusTimeline({
  history,
}: {
  history?: OrderStatusEntry[];
}) {
  if (!history || history.length === 0)
    return <div className="text-sm text-gray-500">No status updates yet.</div>;

  return (
    <div className="space-y-2">
      {history.map((h, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
          <div>
            <div className="text-sm font-medium capitalize">
              {h.status.replace("_", " ")}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(h.timestamp).toLocaleString()}
            </div>
            {h.note && <div className="text-xs text-gray-600">{h.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
