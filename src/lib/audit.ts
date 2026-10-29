import { db, auditLogs } from "@/db";
import { desc, eq, and, or, ilike, count } from "drizzle-orm";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: "buyer" | "seller" | "admin" | "super_admin" | "system";
  action:
    | "ORDER_PAID"
    | "ORDER_HANDED_OVER"
    | "USER_SUSPENDED"
    | "USER_ACTIVATED"
    | "STORE_APPROVED"
    | "STORE_REGISTERED"
    | "WITHDRAWAL_REQUESTED"
    | "WITHDRAWAL_APPROVED"
    | "DISPUTE_RAISED"
    | "DISPUTE_RESOLVED"
    | "BAG_CREATED"
    | "FLASH_SALE_TOGGLED";
  entityType: "order" | "user" | "store" | "withdrawal" | "bag" | "dispute";
  entityId: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

// In-memory fallback buffer for fast querying and resilience
const memoryAuditLogs: AuditLogEntry[] = [
  {
    id: "audit-001",
    actorId: "usr-admin-01",
    actorName: "Admin Rerasa",
    actorRole: "admin",
    action: "STORE_APPROVED",
    entityType: "store",
    entityId: "store-01",
    details: "Menyetujui pendaftaran gerai Ruby Bakery & Pastry",
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 3600000 * 5),
  },
  {
    id: "audit-002",
    actorId: "usr-buyer-01",
    actorName: "Dimas Anggara",
    actorRole: "buyer",
    action: "ORDER_PAID",
    entityType: "order",
    entityId: "RB-8492",
    details: "Pembayaran terkonfirmasi via QRIS instan Rp 26.000 (Escrow HELD)",
    ipAddress: "182.253.12.44",
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: "audit-003",
    actorId: "usr-seller-01",
    actorName: "Kasir Ruby Bakery",
    actorRole: "seller",
    action: "ORDER_HANDED_OVER",
    entityType: "order",
    entityId: "RB-8492",
    details: "Serah terima pesanan selesai, dana Rp 22.000 dirilis ke dompet toko",
    ipAddress: "114.124.200.12",
    createdAt: new Date(Date.now() - 3600000 * 1),
  },
];

export async function recordAuditLog(
  entry: Omit<AuditLogEntry, "id" | "createdAt"> & { id?: string; createdAt?: Date }
): Promise<AuditLogEntry> {
  const newEntry: AuditLogEntry = {
    id: entry.id || `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    actorId: entry.actorId,
    actorName: entry.actorName,
    actorRole: entry.actorRole,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    details: entry.details || "",
    ipAddress: entry.ipAddress || "127.0.0.1",
    createdAt: entry.createdAt || new Date(),
  };

  memoryAuditLogs.unshift(newEntry);

  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    try {
      await db.insert(auditLogs).values({
        id: newEntry.id,
        actorId: newEntry.actorId,
        actorName: newEntry.actorName,
        actorRole: newEntry.actorRole,
        action: newEntry.action,
        entityType: newEntry.entityType,
        entityId: newEntry.entityId,
        details: newEntry.details,
        ipAddress: newEntry.ipAddress,
        createdAt: newEntry.createdAt,
      });
    } catch (err) {
      console.warn("[Audit] Failed inserting to PostgreSQL, kept in-memory buffer:", err);
    }
  }

  return newEntry;
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    try {
      const rows = await db.query.auditLogs.findMany({
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
        limit: 100,
      });
      if (rows && rows.length > 0) {
        return rows as unknown as AuditLogEntry[];
      }
    } catch {
      // Fallback to memory
    }
  }

  return [...memoryAuditLogs];
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  action?: string;
}

export interface PaginatedAuditLogs {
  data: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getPaginatedAuditLogs(
  params: GetAuditLogsParams = {}
): Promise<PaginatedAuditLogs> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 10));
  const search = params.search?.trim();
  const role = params.role?.trim();
  const action = params.action?.trim();

  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    try {
      const conditions = [];
      if (role && role !== "all") {
        conditions.push(eq(auditLogs.actorRole, role as any));
      }
      if (action && action !== "all") {
        conditions.push(eq(auditLogs.action, action as any));
      }
      if (search) {
        const s = `%${search}%`;
        conditions.push(
          or(
            ilike(auditLogs.actorName, s),
            ilike(auditLogs.action, s),
            ilike(auditLogs.details, s),
            ilike(auditLogs.entityId, s),
            ilike(auditLogs.ipAddress, s)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [{ value: totalCount }] = await db
        .select({ value: count() })
        .from(auditLogs)
        .where(whereClause);

      const rows = await db
        .select()
        .from(auditLogs)
        .where(whereClause)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const total = Number(totalCount || 0);

      return {
        data: rows as unknown as AuditLogEntry[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    } catch (err) {
      console.warn("[Audit] DB paginated query fallback to memory:", err);
    }
  }

  // Fallback to in-memory filter
  const filtered = memoryAuditLogs.filter((log) => {
    if (role && role !== "all" && log.actorRole.toLowerCase() !== role.toLowerCase()) {
      return false;
    }
    if (action && action !== "all" && log.action.toLowerCase() !== action.toLowerCase()) {
      return false;
    }
    if (search) {
      const s = search.toLowerCase();
      const match =
        (log.actorName || "").toLowerCase().includes(s) ||
        (log.action || "").toLowerCase().includes(s) ||
        (log.details || "").toLowerCase().includes(s) ||
        (log.entityId || "").toLowerCase().includes(s) ||
        (log.ipAddress || "").toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const paginatedData = filtered.slice(offset, offset + limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
