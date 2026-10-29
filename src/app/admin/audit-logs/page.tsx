"use client";

import { useState, useEffect, useMemo } from "react";
import {
  History,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Store,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: "buyer" | "seller" | "admin" | "super_admin" | "system";
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLogs(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal memuat audit log:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        (log.actorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.action || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.entityId || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRole === "all" ||
        log.actorRole === selectedRole ||
        (selectedRole === "admin" && (log.actorRole as string) === "super_admin");

      return matchesSearch && matchesRole;
    });
  }, [logs, searchQuery, selectedRole]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ORDER_PAID":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
            ORDER_PAID
          </Badge>
        );
      case "ORDER_HANDED_OVER":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-semibold text-[11px]">
            HANDED_OVER
          </Badge>
        );
      case "STORE_APPROVED":
        return (
          <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 font-semibold text-[11px]">
            STORE_APPROVED
          </Badge>
        );
      case "USER_SUSPENDED":
        return (
          <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-semibold text-[11px]">
            USER_SUSPENDED
          </Badge>
        );
      case "WITHDRAWAL_REQUESTED":
      case "WITHDRAWAL_APPROVED":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold text-[11px]">
            {action}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-semibold text-[11px]">
            {action}
          </Badge>
        );
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
      case "super_admin":
        return <Shield className="size-3.5 text-purple-600 dark:text-purple-400" />;
      case "seller":
        return <Store className="size-3.5 text-amber-600 dark:text-amber-400" />;
      default:
        return <User className="size-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <History className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Audit Log Aktivitas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Rekam jejak transaksional, tindakan administratif, dan peristiwa sistem secara transparan.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={isLoading}
          className="gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </Button>
      </div>

      <Separator />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan aktor, aksi, nomor pesanan, atau rincian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Semua Role" },
            { id: "admin", label: "Admin" },
            { id: "seller", label: "Seller" },
            { id: "buyer", label: "Buyer" },
          ].map((item) => (
            <Button
              key={item.id}
              variant={selectedRole === item.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRole(item.id)}
              className="text-xs h-9 cursor-pointer shrink-0"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <Card className="border border-border shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 bg-card border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold">Histori Aktivitas Platform</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Menampilkan {filteredLogs.length} dari total {logs.length} catatan aktivitas
              </CardDescription>
            </div>
            <Badge variant="outline" className="tabular-nums font-mono text-xs">
              Total: {logs.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <RefreshCw className="size-6 animate-spin text-purple-600" />
              <span className="text-xs font-medium">Memuat catatan audit...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Clock className="size-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium">Tidak ada catatan audit yang cocok.</p>
              <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter role.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Waktu (WIB)</th>
                    <th className="py-3 px-4">Aktor</th>
                    <th className="py-3 px-4">Aksi</th>
                    <th className="py-3 px-4">Entitas</th>
                    <th className="py-3 px-4">Rincian Peristiwa</th>
                    <th className="py-3 px-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => {
                    const dateObj = new Date(log.createdAt);
                    const formattedDate = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : log.createdAt;

                    return (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-md bg-muted flex items-center justify-center shrink-0">
                              {getRoleIcon(log.actorRole)}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground text-xs">
                                {log.actorName}
                              </div>
                              <span className="text-[10px] text-muted-foreground uppercase">
                                {log.actorRole}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-medium text-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border">
                            {log.entityId}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-md">
                          <span className="text-xs text-foreground/90 font-medium block">
                            {log.details || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] text-muted-foreground whitespace-nowrap tabular-nums">
                          {log.ipAddress || "127.0.0.1"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
