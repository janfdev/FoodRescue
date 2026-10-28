"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types/domain";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { ChatModal } from "@/components/shared/ChatModal";

export default function AdminTransaksiPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inspectedChatOrder, setInspectedChatOrder] = useState<Order | null>(null);

  const syncData = () => {
    setOrders(storeService.getState().orders);
  };

  useEffect(() => {
    syncData();
    const unsub = storeService.subscribe(syncData);
    return unsub;
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Daftar Transaksi & Rekening Penjamin (Escrow)
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Audit status pemesanan, kode PIN verifikasi fisik kasir, dan penahanan dana platform
        </p>
      </div>

      <Card className="border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 px-4">ID Pesanan</th>
                <th className="p-3.5">Pembeli</th>
                <th className="p-3.5">Mitra Toko</th>
                <th className="p-3.5">Total & Komisi</th>
                <th className="p-3.5">PIN Pickup</th>
                <th className="p-3.5">Status Escrow</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-muted/20">
                  <td className="p-3.5 px-4 font-mono font-bold text-foreground">{ord.id}</td>
                  <td className="p-3.5">
                    <span className="font-semibold block text-foreground">{ord.buyerName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{ord.buyerPhone}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold block text-foreground">{ord.storeName}</span>
                    <span className="text-[10px] text-muted-foreground">{ord.bagTitle}</span>
                  </td>
                  <td className="p-3.5 tabular-nums">
                    <span className="font-bold text-foreground block">
                      Rp {ord.totalPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-purple-600 block">
                      Fee: Rp {ord.platformFee.toLocaleString("id-ID")}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-foreground">{ord.pickupCode}</td>
                  <td className="p-3.5">
                    <Badge
                      variant={
                        ord.status === "COMPLETED"
                          ? "default"
                          : ord.status === "PAID"
                          ? "secondary"
                          : "outline"
                      }
                      className={`text-[10px] font-bold ${
                        ord.status === "COMPLETED" ? "bg-emerald-600 text-white" : ""
                      }`}
                    >
                      {ord.status === "COMPLETED" ? "Dana Dilepas" : "Dana Ditahan (Held)"}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setInspectedChatOrder(ord)}
                      className="text-xs font-semibold gap-1.5 text-purple-600 hover:text-purple-700"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>Log Chat</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Chat Inspector Modal */}
      {inspectedChatOrder && (
        <ChatModal
          order={inspectedChatOrder}
          onClose={() => setInspectedChatOrder(null)}
        />
      )}
    </div>
  );
}
