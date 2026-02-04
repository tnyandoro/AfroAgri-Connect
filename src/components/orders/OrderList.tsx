import React from "react";
import { Order } from "@/types";

export default function OrderList({
  orders,
  onSelect,
}: {
  orders: Order[];
  onSelect?: (o: Order) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Market / Farmer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Updated
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {order.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {order.market?.business_name ?? order.market_id} /{" "}
                {order.farmer?.name ?? order.farmer_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                  {order.status.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                Ksh {order.total_amount?.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.status_history?.length
                  ? new Date(
                      order.status_history[order.status_history.length - 1]
                        .timestamp,
                    ).toLocaleString()
                  : "—"}
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <button
                  onClick={() => onSelect?.(order)}
                  className="text-blue-600 hover:underline"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
