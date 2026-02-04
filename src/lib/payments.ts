import { supabase } from "./supabase";
import { Payment, Invoice } from "@/types";

function generateInvoiceNumber() {
  return `INV-${Date.now().toString().slice(-8)}`;
}

export async function createPaymentForOrder(
  orderId: string,
  marketId: string | undefined,
  farmerId: string | undefined,
  transporterId: string | undefined,
  amount: number,
  method = "card",
): Promise<{ data: Payment | null; error: string | null }> {
  try {
    const payload = {
      order_id: orderId,
      market_id: marketId,
      farmer_id: farmerId,
      transporter_id: transporterId,
      amount,
      currency: "KES",
      method,
      status: "unpaid",
    } as unknown as Partial<Payment>;

    const { data, error } = await supabase
      .from("payments")
      .insert(payload)
      .select()
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: data as Payment, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message || "Unexpected error" };
  }
}

export async function processPayment(
  paymentId: string,
): Promise<{ data: Payment | null; error: string | null }> {
  try {
    // In real integration, call Stripe/M-Pesa/etc here. We'll simulate a successful payment.
    const paidAt = new Date().toISOString();
    const { data: updated, error: updError } = await supabase
      .from("payments")
      .update({ status: "paid", paid_at: paidAt })
      .eq("id", paymentId)
      .select()
      .maybeSingle();

    if (updError) return { data: null, error: updError.message };

    const invoice: Partial<Invoice> = {
      payment_id: (updated as Payment).id,
      invoice_number: generateInvoiceNumber(),
      issued_at: paidAt,
      url: null,
    };

    await supabase.from("invoices").insert(invoice);

    return { data: updated as Payment, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message || "Unexpected error" };
  }
}

export async function getPaymentsByMarket(marketId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("market_id", marketId)
    .order("created_at", { ascending: false });
  return { data: data as Payment[] | null, error: error?.message ?? null };
}

export async function getPaymentsByFarmer(farmerId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("farmer_id", farmerId)
    .order("created_at", { ascending: false });
  return { data: data as Payment[] | null, error: error?.message ?? null };
}

export async function getPaymentsByTransporter(transporterId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("transporter_id", transporterId)
    .order("created_at", { ascending: false });
  return { data: data as Payment[] | null, error: error?.message ?? null };
}

export async function getInvoiceByPayment(paymentId: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();
  return { data: data as Invoice | null, error: error?.message ?? null };
}

export async function getPaymentsByOrder(orderId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  return { data: data as Payment[] | null, error: error?.message ?? null };
}
// Client helper to create a Stripe Checkout session via server API
export async function createStripeCheckoutSession(
  orderId: string,
  amount: number,
) {
  try {
    const resp = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amount }),
    });
    const data = await resp.json();
    return data;
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function getStripeSessionStatus(sessionId: string) {
  try {
    const resp = await fetch(
      `/api/stripe/session?sessionId=${encodeURIComponent(sessionId)}`,
    );
    const data = await resp.json();
    return data;
  } catch (err) {
    return { error: (err as Error).message };
  }
}
export async function createPayoutForRecipient(
  orderId: string,
  recipientId: string,
  recipientType: "farmer" | "transporter",
  amount: number,
) {
  try {
    const payload: Partial<Payment> = {
      order_id: orderId,
      amount,
      currency: "KES",
      method: "payout",
      status: "payout",
      created_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
    } as Partial<Payment>;

    if (recipientType === "farmer") payload.farmer_id = recipientId;
    if (recipientType === "transporter") payload.transporter_id = recipientId;

    const { data, error } = await supabase
      .from("payments")
      .insert(payload)
      .select()
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: data as Payment, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message || "Unexpected error" };
  }
}

export async function getEarningsForRecipient(recipientId: string) {
  // Sum of all paid payouts for a recipient (farmer or transporter)
  const { data, error } = await supabase
    .from("payments")
    .select("amount")
    .or(`farmer_id.eq.${recipientId},transporter_id.eq.${recipientId}`)
    .in("status", ["payout", "paid"]);

  if (error) return { total: 0, error: error.message };

  const total = (data || []).reduce(
    (s: number, row: { amount?: number }) => s + (row.amount || 0),
    0,
  );
  return { total, error: null };
}
