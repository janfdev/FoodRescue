"use client";

import useSWR from "swr";
import { SurpriseBag, Store, Order } from "@/types/domain";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  const json = await res.json();
  return json.data;
};

export function useBags(storeId?: string) {
  const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : "";
  const { data, error, isLoading, mutate } = useSWR<SurpriseBag[]>(
    `/api/bags${query}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 4000,
    }
  );

  return {
    bags: data || [],
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}

export function useStores() {
  const { data, error, isLoading, mutate } = useSWR<Store[]>(
    "/api/stores",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    stores: data || [],
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}

export function useOrders(filter?: { buyerId?: string; storeId?: string }) {
  const params = new URLSearchParams();
  if (filter?.buyerId) params.set("buyerId", filter.buyerId);
  if (filter?.storeId) params.set("storeId", filter.storeId);
  const query = params.toString() ? `?${params.toString()}` : "";

  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    `/api/orders${query}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    orders: data || [],
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}

export function useLocations() {
  const { data, error, isLoading } = useSWR<string[]>(
    "/api/locations",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    locations: data || [
      "Semua Lokasi",
      "Tuparev",
      "Kartini",
      "Siliwangi",
      "Kesambi",
      "Harjamukti",
      "Kedawung",
    ],
    isLoading,
    isError: Boolean(error),
  };
}

export interface AuditLogItem {
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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const paginatedFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  const json = await res.json();
  return {
    data: (json.data || []) as AuditLogItem[],
    pagination: (json.pagination || {
      page: 1,
      limit: 10,
      total: Array.isArray(json.data) ? json.data.length : 0,
      totalPages: 1,
    }) as PaginationMeta,
  };
};

export function useAuditLogs(filter?: {
  action?: string;
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filter?.action && filter.action !== "all") params.set("action", filter.action);
  if (filter?.role && filter.role !== "all") params.set("role", filter.role);
  if (filter?.search) params.set("search", filter.search);
  if (filter?.page) params.set("page", String(filter.page));
  if (filter?.limit) params.set("limit", String(filter.limit));
  const query = params.toString() ? `?${params.toString()}` : "";

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    data: AuditLogItem[];
    pagination: PaginationMeta;
  }>(`/api/admin/audit-logs${query}`, paginatedFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 3000,
    keepPreviousData: true,
  });

  return {
    logs: data?.data || [],
    pagination: data?.pagination || {
      page: filter?.page || 1,
      limit: filter?.limit || 10,
      total: 0,
      totalPages: 1,
    },
    isLoading,
    isValidating,
    isError: Boolean(error),
    error,
    mutate,
  };
}
