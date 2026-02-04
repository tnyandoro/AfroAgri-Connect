import React, { useState, useEffect } from "react";
import { Order } from "@/types";
import OrderStatusTimeline from "./OrderStatusTimeline";
import { useApp } from "@/context/AppContext";
import {
  getPaymentsByOrder,
  getInvoiceByPayment,
  processPayment,
} from "@/lib/payments";
import { Payment } from "@/types";

export default function OrderDetail({
  order,
  onAction,
}: {
  order: Order | null;
  onAction?: (action: { type: string; note?: string }) => void;
}) {
  const { userRole, currentUser } = useApp();
  const [note, setNote] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!order?.id) return;
    (async () => {
      const { data } = await getPaymentsByOrder(order.id);
      setPayments(data || []);
    })();
  }, [order?.id]);

  if (!order)
    return (
      <div className="p-4 text-sm text-gray-500">
        Select an order to view details.
      </div>
    );

  const canAccept =
    userRole === "farmer" &&
    order.status === "pending" &&
    currentUser?.id === order.farmer_id;
  const canReject =
    userRole === "farmer" &&
    order.status === "pending" &&
    currentUser?.id === order.farmer_id;
  const canPickup =
    userRole === "transporter" &&
    order.status === "confirmed" &&
    currentUser?.id === order.transporter_id;
  const canInTransit =
    userRole === "transporter" &&
    order.status === "picked_up" &&
    currentUser?.id === order.transporter_id;
  const canDeliver =
    userRole === "transporter" &&
    order.status === "in_transit" &&
    currentUser?.id === order.transporter_id;

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">Order {order.id}</h3>
          <div className="text-sm text-gray-500">
            {order.market?.business_name ?? order.market_id} →{" "}
            {order.farmer?.name ?? order.farmer_id}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Status</div>
          <div className="font-medium capitalize">
            {order.status.replace("_", " ")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <h4 className="text-sm font-semibold">Items</h4>
          <div className="mt-2 space-y-2">
            {order.items?.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between border rounded p-2"
              >
                <div>
                  <div className="text-sm font-medium">
                    {i.produce?.name ?? i.produce_id}
                  </div>
                  <div className="text-xs text-gray-500">
                    {i.quantity} x {i.produce?.unit ?? "unit"}
                  </div>
                </div>
                <div className="text-sm">Ksh {i.total_price?.toFixed(2)}</div>
              </div>
            ))}
            <div className="text-right text-sm font-medium">
              Total: Ksh {order.total_amount?.toFixed(2)}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold">Delivery</h4>
            <div className="text-sm text-gray-700">
              Address: {order.delivery_address ?? "—"}
            </div>
            <div className="text-sm text-gray-700">
              Pickup: {order.pickup_address ?? "—"}
            </div>
            <div className="text-sm text-gray-700">
              Date: {order.delivery_date ?? "—"} {order.delivery_time ?? ""}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold">Transport</h4>
            <div className="text-sm text-gray-700">
              Transporter:{" "}
              {order.transporter?.company_name ?? order.transporter_id ?? "—"}
            </div>
            <div className="text-sm text-gray-700">
              Distance: {order.distance_km ?? "—"} km
            </div>
            <div className="text-sm text-gray-700">
              Transport cost: Ksh {order.transport_cost?.toFixed(2) ?? "—"}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Status Timeline</h4>
          <div className="mt-2">
            <OrderStatusTimeline history={order.status_history} />
          </div>

          <div className="mt-4 space-y-2">
            {/* Payments / Invoices */}
            <div className="p-3 border rounded-md bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="text-sm font-medium">Payments</h5>
                  <p className="text-xs text-gray-500">
                    Invoices & payment history for this order
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Order Total</div>
                  <div className="font-medium">
                    Ksh {order.total_amount?.toFixed(2)}
                  </div>
                </div>
              </div>

              {payments.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No payments recorded for this order.
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <div className="font-medium">
                          Ksh {p.amount?.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.method} •{" "}
                          {new Date(p.created_at || "").toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${p.status === "paid" ? "bg-green-100 text-green-700" : p.status === "unpaid" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {p.status}
                        </div>
                        {userRole === "market" && p.status === "unpaid" && (
                          <button
                            onClick={async () => {
                              setIsPaying(true);
                              const { data, error } = await processPayment(
                                p.id,
                              );
                              setIsPaying(false);
                              if (error) {
                                alert("Payment failed: " + error);
                              } else {
                                alert("Payment processed successfully");
                                const { data: updatedPayments } =
                                  await getPaymentsByOrder(order.id);
                                setPayments(updatedPayments || []);
                              }
                            }}
                            disabled={isPaying}
                            className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded text-sm"
                          >
                            {isPaying ? "Processing..." : "Pay Now"}
                          </button>
                        )}

                        {p.status === "paid" && (
                          <button
                            onClick={async () => {
                              const { data: inv } = await getInvoiceByPayment(
                                p.id,
                              );
                              if (inv?.invoice_number) {
                                alert(`Invoice: ${inv.invoice_number}`);
                              } else {
                                alert("Invoice will be available shortly.");
                              }
                            }}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          >
                            View Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(canAccept || canReject) && (
              <>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note"
                  className="w-full border rounded p-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => onAction?.({ type: "accept", note })}
                    className="px-3 py-2 bg-green-600 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onAction?.({ type: "reject", note })}
                    className="px-3 py-2 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              </>
            )}

            {(canPickup || canInTransit || canDeliver) && (
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note"
                  className="w-full border rounded p-2 text-sm"
                />
                {canPickup && (
                  <button
                    onClick={() => onAction?.({ type: "picked_up", note })}
                    className="px-3 py-2 bg-amber-500 text-white rounded w-full"
                  >
                    Mark Picked Up
                  </button>
                )}
                {canInTransit && (
                  <button
                    onClick={() => onAction?.({ type: "in_transit", note })}
                    className="px-3 py-2 bg-blue-600 text-white rounded w-full"
                  >
                    Mark In Transit
                  </button>
                )}
                {canDeliver && (
                  <button
                    onClick={() => onAction?.({ type: "delivered", note })}
                    className="px-3 py-2 bg-green-700 text-white rounded w-full"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
