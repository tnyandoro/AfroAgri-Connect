import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useFarmerOrders } from "@/hooks/use-orders";
import OrderList from "@/components/orders/OrderList";
import OrderDetail from "@/components/orders/OrderDetail";
import { useToast } from "@/components/ui/use-toast";
import { Order } from "@/types";

export default function FarmerOrders() {
  const { currentUser } = useApp();
  const farmerId =
    currentUser && "id" in currentUser ? currentUser.id : undefined;
  const { data: orders = [], isLoading, setStatus } = useFarmerOrders(farmerId);
  const [selected, setSelected] = useState<Order | null>(null);
  const { toast } = useToast();

  const handleAction = async (action: { type: string; note?: string }) => {
    if (!selected) return;
    try {
      if (action.type === "accept") {
        await setStatus({
          orderId: selected.id,
          status: "confirmed",
          actorId: farmerId,
          note: action.note,
        });
      } else if (action.type === "reject") {
        await setStatus({
          orderId: selected.id,
          status: "cancelled",
          actorId: farmerId,
          note: action.note,
        });
      }
      toast({ title: "Success", description: `Order ${selected.id} updated` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update order" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Incoming Orders</h2>
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
