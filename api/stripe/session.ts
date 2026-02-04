import Stripe from "stripe";
import { supabaseServer } from "../lib/supabaseServer";
import type { IncomingMessage, ServerResponse } from "http";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: IncomingMessage & { url?: string },
  res: ServerResponse,
) {
  try {
    const url = new URL(req.url || "", "http://localhost");
    const sessionId =
      url.searchParams.get("sessionId") || url.searchParams.get("session_id");
    if (!sessionId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Missing sessionId" }));
      return;
    }

    // Fetch Stripe session
    const session = await stripe.checkout.sessions.retrieve(
      sessionId as string,
    );

    // Try to find payment in supabase by metadata or stripe_session_id
    const { data: payments } = await supabaseServer
      .from("payments")
      .select("*, invoices(*)")
      .eq("metadata->>stripe_session_id", sessionId)
      .limit(1);

    if (payments && payments.length > 0) {
      const p = payments[0];
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ status: p.status, payment: p, session }));
      return;
    }

    // If not found by metadata, try by order id in metadata
    const metadata = session.metadata as Record<string, string> | undefined;
    const orderId = metadata?.order_id;
    if (orderId) {
      const { data: paymentsByOrder } = await supabaseServer
        .from("payments")
        .select("*, invoices(*)")
        .eq("order_id", orderId)
        .limit(1);

      if (paymentsByOrder && paymentsByOrder.length > 0) {
        const p = paymentsByOrder[0];
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ status: p.status, payment: p, session }));
        return;
      }
    }

    // no payment found, report Stripe session status
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ status: session.payment_status || "unpaid", session }),
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("session endpoint error", msg);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: msg || "Internal error" }));
  }
}
