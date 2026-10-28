"use client";

import { useState } from "react";
import { User } from "@/types/domain";
import { SEED_USERS } from "@/services/seedData";
import { storeService } from "@/services/storeService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolveUserAvatar } from "@/lib/avatar";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 5;

  const stores = storeService.getStores();

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const totalUserPages = Math.ceil(filteredUsers.length / userPageSize) || 1;
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * userPageSize,
    userPage * userPageSize
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Manajemen Pengguna Terdaftar
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar akun Super Admin, Mitra Toko, dan Pelanggan Rerasa Cirebon Raya
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64 relative">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari nama, email, hp..."
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setUserPage(1);
            }}
            className="pl-9 text-xs h-8"
          />
        </div>
      </div>

      {/* Filter Role Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="font-bold text-muted-foreground mr-1 text-[11px]">Filter Peran:</span>
        {[
          { id: "all", label: "Semua Akun" },
          { id: "super_admin", label: "Super Admin" },
          { id: "seller", label: "Mitra Toko" },
          { id: "buyer", label: "Pelanggan" },
        ].map((role) => (
          <Button
            key={role.id}
            type="button"
            size="sm"
            variant={userRoleFilter === role.id ? "default" : "outline"}
            onClick={() => {
              setUserRoleFilter(role.id);
              setUserPage(1);
            }}
            className={`text-xs h-7 px-3 rounded-full font-semibold ${
              userRoleFilter === role.id
                ? "bg-purple-700 hover:bg-purple-800 text-white"
                : "text-muted-foreground border-border"
            }`}
          >
            {role.label}
          </Button>
        ))}
      </div>

      {/* User Data Table */}
      <Card className="border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 px-4">Nama & Email</th>
                <th className="p-3.5">Peran (Role)</th>
                <th className="p-3.5">No. Telepon / WA</th>
                <th className="p-3.5">Toko / Afiliasi</th>
                <th className="p-3.5">Status Akun</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                    Tidak ada pengguna yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const associatedStore = stores.find((s) => s.id === u.storeId);
                  const isActive = u.status !== "SUSPENDED";
                  return (
                    <tr key={u.id} className="hover:bg-muted/20">
                      <td className="p-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8 rounded-full border border-border shrink-0">
                            <AvatarImage src={resolveUserAvatar(u.avatarUrl, u.name)} alt={u.name} />
                            <AvatarFallback className="text-[10px] font-bold">
                              {u.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <span className="font-extrabold text-foreground block text-sm truncate max-w-[180px]">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono block mt-0.5 truncate max-w-[180px]">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            u.role === "super_admin"
                              ? "default"
                              : u.role === "seller"
                              ? "secondary"
                              : "outline"
                          }
                          className={`text-[10px] font-bold ${
                            u.role === "super_admin"
                              ? "bg-purple-700 text-white"
                              : u.role === "seller"
                              ? "bg-orange-500 text-white"
                              : "border-emerald-600 text-emerald-700"
                          }`}
                        >
                          {u.role === "super_admin"
                            ? "Super Admin"
                            : u.role === "seller"
                            ? "Mitra Toko"
                            : "Pelanggan"}
                        </Badge>
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">
                        {u.phone || "-"}
                      </td>
                      <td className="p-3.5">
                        {associatedStore ? (
                          <span className="font-semibold text-foreground">
                            {associatedStore.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Personal</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={isActive ? "default" : "destructive"}
                          className={`text-[10px] font-bold ${
                            isActive ? "bg-emerald-600 text-white" : ""
                          }`}
                        >
                          {isActive ? "Aktif" : "Dibekukan"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`text-xs font-bold h-7 px-2.5 ${
                            isActive
                              ? "text-red-600 border-red-200 hover:bg-red-50"
                              : "text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                          }`}
                        >
                          {isActive ? "Bekukan" : "Aktifkan"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 px-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Menampilkan <strong>{paginatedUsers.length}</strong> dari <strong>{filteredUsers.length}</strong> akun
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={userPage <= 1}
              onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              className="size-7 p-0"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="px-2 text-xs font-semibold text-foreground font-mono">
              Halaman {userPage} / {totalUserPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={userPage >= totalUserPages}
              onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
              className="size-7 p-0"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
