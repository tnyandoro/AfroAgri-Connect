import { supabase } from "./supabase";
import { Order, OrderStatusEntry } from "@/types";

export async function getOrdersByMarket(
  marketId: string,
): Promise<{ data: Order[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), farmers(*), markets(*), transporters(*)")
      .eq("market_id", marketId)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as Order[], error: null };
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message || "An unexpected error",
    };
  }
}

export async function getOrdersByFarmer(
  farmerId: string,
): Promise<{ data: Order[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), farmers(*), markets(*), transporters(*)")
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as Order[], error: null };
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message || "An unexpected error",
    };
  }
}

export async function getOrdersByTransporter(
  transporterId: string,
): Promise<{ data: Order[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), farmers(*), markets(*), transporters(*)")
      .eq("transporter_id", transporterId)
      .order("created_at", { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as Order[], error: null };
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message || "An unexpected error",
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatusEntry["status"],
  actorId?: string,
  note?: string,
  transporterId?: string,
): Promise<{ data: Order | null; error: string | null }> {
  try {
    // fetch existing order
    const { data: orderData, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
    if (fetchError) return { data: null, error: fetchError.message };
    if (!orderData) return { data: null, error: "Order not found" };

    const existingHistory: OrderStatusEntry[] = orderData.status_history ?? [];
    const entry: OrderStatusEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor_id: actorId,
      note,
    };
    const updatedHistory = [...existingHistory, entry];

    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      status_history: updatedHistory,
    };

    if (transporterId) updatePayload.transporter_id = transporterId;

    const { data, error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select()
      .maybeSingle();

    if (error) return { data: null, error: error.message };

    // If delivered, create payouts for farmer and transporter
    if (newStatus === "delivered") {
      try {
        const deliveredOrder = (data as Order) ?? null;
        const farmerAmount =
          (deliveredOrder?.total_amount || 0) -
          (deliveredOrder?.transport_cost || 0);
        const transporterAmount = deliveredOrder?.transport_cost || 0;

        if (farmerAmount > 0 && deliveredOrder?.farmer_id) {
          // lazily import to avoid circular deps
          const { createPayoutForRecipient } = await import("@/lib/payments");
          await createPayoutForRecipient(
            deliveredOrder.id,
            deliveredOrder.farmer_id,
            "farmer",
            farmerAmount,
          );
        }

        if (transporterAmount > 0 && (deliveredOrder?.transporter_id ?? null)) {
          const { createPayoutForRecipient } = await import("@/lib/payments");
          await createPayoutForRecipient(
            deliveredOrder!.id,
            deliveredOrder!.transporter_id!,
            "transporter",
            transporterAmount,
          );
        }
      } catch (pErr: unknown) {
        const msg = pErr instanceof Error ? pErr.message : String(pErr);
        console.warn("Failed to create payouts for delivered order", msg);
      }
    }

    return { data: (data as Order) ?? null, error: null };
  } catch (err) {
    return {
      data: null,
      error: (err as Error).message || "An unexpected error",
    };
  }
}

export async function createOrder(payload: {
  market_id: string;
  farmer_id: string;
  items: { produce_id: string; quantity: number; unit_price: number }[];
  total_amount: number;
  transport_cost?: number;
  distance_km?: number;
  delivery_address?: string;
  delivery_date?: string;
  delivery_time?: string;
  notes?: string;
}): Promise<{ data: Order | null; error: string | null }> {
  try {
    const orderPayload: Partial<Order> = {
      market_id: payload.market_id,
      farmer_id: payload.farmer_id,
      status: "pending",
      total_amount: payload.total_amount,
      transport_cost: payload.transport_cost || 0,
      distance_km: payload.distance_km || null,
      delivery_address: payload.delivery_address || null,
      delivery_date: payload.delivery_date || null,
      delivery_time: payload.delivery_time || null,
      notes: payload.notes || null,
      status_history: [
        {
          status: "pending",
          timestamp: new Date().toISOString(),
        },
      ],
    } as Partial<Order>;

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .maybeSingle();

    if (orderError) return { data: null, error: orderError.message };

    // Insert order items
    for (const it of payload.items) {
      await supabase.from("order_items").insert({
        order_id: (orderData as Order).id,
        produce_id: it.produce_id,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_price: it.quantity * it.unit_price,
      });
    }

    // fetch and return order with relationships
    const { data: newOrder, error: fetchError } = await supabase
      .from("orders")
      .select("*, order_items(*), farmers(*), markets(*), transporters(*)")
      .eq("id", (orderData as Order).id)
      .maybeSingle();

    if (fetchError) return { data: null, error: fetchError.message };
    return { data: newOrder as Order, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message || "Unexpected error" };
  }
}

export function subscribeToOrders(
  filter: { marketId?: string; farmerId?: string; transporterId?: string },
  cb: (payload: unknown) => void,
) {
  const { marketId, farmerId, transporterId } = filter;
  interface RealtimeChannelLike {
    on: (event: string, cb: (payload: unknown) => void) => RealtimeChannelLike;
    subscribe: () => { unsubscribe?: () => void };
  }

  const channel = (marketId
    ? supabase.from(`orders:market_id=eq.${marketId}`)
    : farmerId
      ? supabase.from(`orders:farmer_id=eq.${farmerId}`)
      : transporterId
        ? supabase.from(`orders:transporter_id=eq.${transporterId}`)
        : supabase.from("orders")) as unknown as RealtimeChannelLike;

  const subscription = channel
    .on("INSERT", (payload: unknown) => cb({ type: "INSERT", payload }))
    .on("UPDATE", (payload: unknown) => cb({ type: "UPDATE", payload }))
    .on("DELETE", (payload: unknown) => cb({ type: "DELETE", payload }))
    .subscribe();

  return () => {
    try {
      subscription?.unsubscribe?.();
    } catch (err) {
      console.warn("Failed to unsubscribe from orders subscription", err);
    }
  };
}
