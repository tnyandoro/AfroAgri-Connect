import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useMarketOrders } from "@/hooks/use-orders";
import OrderList from "@/components/orders/OrderList";
import OrderDetail from "@/components/orders/OrderDetail";
import { useToast } from "@/components/ui/use-toast";

export default function MarketOrders() {
  const { currentUser } = useApp();
  const marketId = (currentUser as any)?.id;
  const { data: orders = [], isLoading, setStatus } = useMarketOrders(marketId);
  const [selected, setSelected] = useState<any | null>(null);
  const { toast } = useToast();

  const handleAction = async (action: { type: string; note?: string }) => {
    if (!selected) return;
    try {
      if (action.type === "assign_transporter") {
        // not implemented here
      }
      await setStatus({
        orderId: selected.id,
        status: action.type as any,
        actorId: marketId,
        note: action.note,
      });
      toast({
        title: "Status updated",
        description: `Order ${selected.id} set to ${action.type}`,
      });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update order status" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Market Orders</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <OrderList orders={orders} onSelect={setSelected} />
        </div>
        <div className="lg:col-span-1">
          <OrderDetail order={selected} onAction={handleAction} />
        </div>
      </div>
    </div>
  );
}
