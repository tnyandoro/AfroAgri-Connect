import { useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  getOrdersByMarket,
  getOrdersByFarmer,
  getOrdersByTransporter,
  subscribeToOrders,
  updateOrderStatus,
} from "@/lib/orders";
import { Order, OrderStatusEntry } from "@/types";

type UpdateArgs = {
  orderId: string;
  status: OrderStatusEntry["status"];
  actorId?: string;
  note?: string;
};

export function useMarketOrders(marketId?: string) {
  const qc = useQueryClient();

  const query = useQuery<Order[], Error>({
    queryKey: ["market-orders", marketId],
    queryFn: async () => {
      if (!marketId) return [] as Order[];
      const { data } = await getOrdersByMarket(marketId);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!marketId) return;
    const unsub = subscribeToOrders({ marketId }, () => {
      qc.invalidateQueries({ queryKey: ["market-orders", marketId] });
    });
    return () => unsub();
  }, [marketId, qc]);

  const mutation: UseMutationResult<
    { data: Order | null; error: string | null },
    Error,
    UpdateArgs
  > = useMutation({
    mutationFn: (args: UpdateArgs) =>
      updateOrderStatus(args.orderId, args.status, args.actorId, args.note),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["market-orders", marketId] }),
  });

  return { ...query, setStatus: mutation.mutateAsync } as const;
}

export function useFarmerOrders(farmerId?: string) {
  const qc = useQueryClient();

  const query = useQuery<Order[], Error>({
    queryKey: ["farmer-orders", farmerId],
    queryFn: async () => {
      if (!farmerId) return [] as Order[];
      const { data } = await getOrdersByFarmer(farmerId);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!farmerId) return;
    const unsub = subscribeToOrders({ farmerId }, () => {
      qc.invalidateQueries({ queryKey: ["farmer-orders", farmerId] });
    });
    return () => unsub();
  }, [farmerId, qc]);

  const mutation: UseMutationResult<
    { data: Order | null; error: string | null },
    Error,
    UpdateArgs
  > = useMutation({
    mutationFn: (args: UpdateArgs) =>
      updateOrderStatus(args.orderId, args.status, args.actorId, args.note),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["farmer-orders", farmerId] }),
  });

  return { ...query, setStatus: mutation.mutateAsync } as const;
}

export function useTransporterOrders(transporterId?: string) {
  const qc = useQueryClient();

  const query = useQuery<Order[], Error>({
    queryKey: ["transporter-orders", transporterId],
    queryFn: async () => {
      if (!transporterId) return [] as Order[];
      const { data } = await getOrdersByTransporter(transporterId);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!transporterId) return;
    const unsub = subscribeToOrders({ transporterId }, () => {
      qc.invalidateQueries({ queryKey: ["transporter-orders", transporterId] });
    });
    return () => unsub();
  }, [transporterId, qc]);

  const mutation: UseMutationResult<
    { data: Order | null; error: string | null },
    Error,
    UpdateArgs
  > = useMutation({
    mutationFn: (args: UpdateArgs) =>
      updateOrderStatus(args.orderId, args.status, args.actorId, args.note),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["transporter-orders", transporterId] }),
  });

  return { ...query, setStatus: mutation.mutateAsync } as const;
}
