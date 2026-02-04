import Stripe from "stripe";
import { supabaseServer } from "../lib/supabaseServer";
import type { IncomingMessage, ServerResponse } from "http";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    const body = (req as unknown as { body?: unknown }).body ?? {};
    interface CheckoutBody {
      orderId?: string;
      amount?: number | string;
      currency?: string;
      successUrl?: string;
      cancelUrl?: string;
    }
    const {
      orderId,
      amount,
      currency = "KES",
      successUrl,
      cancelUrl,
    } = body as CheckoutBody;

    if (!orderId || !amount) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Missing orderId or amount" }));
      return;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: `Order ${orderId}` },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { order_id: orderId },
      success_url:
        successUrl ||
        `${process.env.PUBLIC_URL || "http://localhost:5173"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl ||
        `${process.env.PUBLIC_URL || "http://localhost:5173"}/checkout/success?canceled=1`,
    });

    // Create payment record in DB (status unpaid)
    const { data, error } = await supabaseServer
      .from("payments")
      .insert({
        order_id: orderId,
        amount: Number(amount),
        currency: currency.toUpperCase(),
        method: "card",
        status: "unpaid",
        created_at: new Date().toISOString(),
        metadata: { stripe_session_id: session.id },
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn("Failed to insert payment record:", error);
      // Don't fail the checkout creation - but log it
    }

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ url: session.url, id: session.id }));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("create-checkout-session error", msg);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: msg || "Internal error" }));
  }
}
