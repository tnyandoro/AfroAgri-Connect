import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStripeSessionStatus } from "@/lib/payments";
import { Payment } from "@/types";

export default function CheckoutSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  type PaymentWithInvoices = Payment & {
    invoices?: { invoice_number?: string; url?: string }[];
  };
  const [payment, setPayment] = useState<PaymentWithInvoices | null>(null);
  const [session, setSession] = useState<unknown>(null);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id") || params.get("sessionId");
        if (!sessionId) {
          setError("No session id found in URL.");
          setLoading(false);
          return;
        }

        const res = await getStripeSessionStatus(sessionId);
        if (res?.error) {
          setError(res.error);
          setLoading(false);
          return;
        }

        setStatus(
          res.status ??
            res.payment?.status ??
            res.session?.payment_status ??
            "unknown",
        );
        setPayment(res.payment ?? null);
        setSession(res.session ?? null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow">
          Checking payment status...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-2">Payment error</h2>
          <p className="mb-4 text-sm text-red-600">{error}</p>
          <div className="flex gap-2">
            <Link to="/payments" className="btn">
              View Payments
            </Link>
            <Link to="/" className="btn btn-secondary">
              Home
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl font-bold">Checkout Result</h1>
          <p className="text-gray-500 mt-1">
            Status: <strong className="capitalize">{status}</strong>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {status === "paid" ? (
            <div>
              <h2 className="text-lg font-semibold text-green-700">
                Payment successful 🎉
              </h2>
              {payment ? (
                <div className="mt-4">
                  <p>
                    Order: <strong>{payment.order_id}</strong>
                  </p>
                  <p>
                    Amount: <strong>Ksh {payment.amount?.toFixed(2)}</strong>
                  </p>
                  {payment.invoices && payment.invoices.length > 0 && (
                    <p className="mt-2">
                      Invoice:{" "}
                      <a
                        className="text-primary underline"
                        href={payment.invoices[0].url || "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {payment.invoices[0].invoice_number || "View Invoice"}
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  We have recorded your payment and will reconcile shortly if
                  the details are pending.
                </p>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-yellow-700">
                Payment pending or unpaid
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                If you completed checkout and the payment is not reflected yet,
                wait a few minutes while we reconcile or contact support.
              </p>
              {(() => {
                const s = session as { url?: string } | undefined;
                if (!s?.url) return null;
                return (
                  <p className="mt-2">
                    Stripe session:{" "}
                    <a
                      className="text-primary underline"
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Checkout
                    </a>
                  </p>
                );
              })()}
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Link to="/payments" className="btn">
              View Payments
            </Link>
            <Link to="/" className="btn btn-secondary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
