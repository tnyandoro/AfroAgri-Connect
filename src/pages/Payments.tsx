import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  getPaymentsByMarket,
  getPaymentsByFarmer,
  getPaymentsByTransporter,
  getEarningsForRecipient,
} from "@/lib/payments";
import { Payment } from "@/types";

export default function PaymentsPage() {
  const { userRole, currentUser } = useApp();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      if (userRole === "market") {
        const { data } = await getPaymentsByMarket(currentUser.id);
        setPayments(data || []);
      } else if (userRole === "farmer") {
        const { data } = await getPaymentsByFarmer(currentUser.id);
        setPayments(data || []);
        const { total } = await getEarningsForRecipient(currentUser.id);
        setTotalEarnings(total);
      } else if (userRole === "transporter") {
        const { data } = await getPaymentsByTransporter(currentUser.id);
        setPayments(data || []);
        const { total } = await getEarningsForRecipient(currentUser.id);
        setTotalEarnings(total);
      }
    })();
  }, [userRole, currentUser]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Payments</h1>
              <p className="text-gray-500">
                History of payments and invoices for your account
              </p>
            </div>
            {totalEarnings !== null && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  Ksh {totalEarnings.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase">
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Order</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-3">
                    {new Date(p.created_at || "").toLocaleString()}
                  </td>
                  <td className="py-3">{p.method}</td>
                  <td className="py-3">Ksh {p.amount?.toFixed(2)}</td>
                  <td className="py-3 capitalize">{p.status}</td>
                  <td className="py-3">{p.order_id}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-gray-500" colSpan={5}>
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
