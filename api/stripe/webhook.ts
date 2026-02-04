import Stripe from "stripe";
import { supabaseServer } from "../lib/supabaseServer";
import type { IncomingMessage, ServerResponse } from "http";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

// Disable body parsing on platforms that support `config` (e.g., Next.js) — for Vercel functions we'll read raw body manually
// export const config = { api: { bodyParser: false } };

async function getRawBody(req: IncomingMessage) {
  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", (err) => reject(err));
  });
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  const sig = (req.headers["stripe-signature"] || "") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET env");
    res.statusCode = 500;
    res.end("Webhook secret not configured");
    return;
  }

  try {
    const buf = await getRawBody(req);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Webhook signature verification failed:", msg);
      res.statusCode = 400;
      res.end(`Webhook Error: ${msg}`);
      return;
    }

    // Handle the event types we care about
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id ?? null;
        const sessionId = session.id;
        const amount = session.amount_total ?? session.amount_subtotal ?? null;

        // Mark the related payment as paid if we have it
        try {
          // find payment by metadata->stripe_session_id
          const { data: payments } = await supabaseServer
            .from("payments")
            .select("*")
            .eq("metadata->>stripe_session_id", sessionId)
            .limit(1);

          if (payments && payments.length > 0) {
            const p = payments[0];
            await supabaseServer
              .from("payments")
              .update({ status: "paid", paid_at: new Date().toISOString() })
              .eq("id", p.id);

            // create invoice
            await supabaseServer.from("invoices").insert({
              payment_id: p.id,
              invoice_number: `INV-${Date.now().toString().slice(-8)}`,
              issued_at: new Date().toISOString(),
            });

            // update order status to confirmed
            if (orderId) {
              await supabaseServer
                .from("orders")
                .update({ status: "confirmed" })
                .eq("id", orderId);
            }
          } else if (orderId) {
            // No payment, create one and mark paid
            const { data: created } = await supabaseServer
              .from("payments")
              .insert({
                order_id: orderId,
                amount: (amount || 0) / 100,
                currency: "KES",
                method: "card",
                status: "paid",
                paid_at: new Date().toISOString(),
                metadata: { stripe_session_id: sessionId },
              })
              .select()
              .maybeSingle();

            if (created) {
              await supabaseServer.from("invoices").insert({
                payment_id: created.id,
                invoice_number: `INV-${Date.now().toString().slice(-8)}`,
                issued_at: new Date().toISOString(),
              });

              await supabaseServer
                .from("orders")
                .update({ status: "confirmed" })
                .eq("id", orderId);
            }
          }
        } catch (err) {
          console.error("Failed to reconcile checkout.session.completed:", err);
        }

        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const metadata = (pi.metadata || {}) as Record<string, string>;
        const sessionId = metadata.checkout_session_id || null;
        const orderId = metadata.order_id ?? null;

        try {
          if (sessionId) {
            const { data: payments } = await supabaseServer
              .from("payments")
              .select("*")
              .eq("metadata->>stripe_session_id", sessionId)
              .limit(1);

            if (payments && payments.length > 0) {
              const p = payments[0];
              await supabaseServer
                .from("payments")
                .update({ status: "paid", paid_at: new Date().toISOString() })
                .eq("id", p.id);

              await supabaseServer.from("invoices").insert({
                payment_id: p.id,
                invoice_number: `INV-${Date.now().toString().slice(-8)}`,
                issued_at: new Date().toISOString(),
              });

              if (orderId) {
                await supabaseServer
                  .from("orders")
                  .update({ status: "confirmed" })
                  .eq("id", orderId);
              }
            }
          }
        } catch (err) {
          console.error("Failed to reconcile payment_intent.succeeded:", err);
        }

        break;
      }

      default:
        // Unexpected event type — log and ignore
        console.log(`Unhandled event type ${event.type}`);
    }

    res.statusCode = 200;
    res.end("OK");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Webhook handler error:", msg);
    res.statusCode = 500;
    res.end("Server error");
  }
}
