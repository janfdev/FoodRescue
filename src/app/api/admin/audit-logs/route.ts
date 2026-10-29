import { NextResponse } from "next/server";
import { getPaginatedAuditLogs, recordAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/ip";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || undefined;
    const role = searchParams.get("role") || undefined;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getPaginatedAuditLogs({
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 10 : limit,
      search,
      role,
      action,
    });

    return NextResponse.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch audit logs",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actorId, actorName, actorRole, action, entityType, entityId, details, ipAddress } =
      body;

    if (!actorId || !actorName || !action || !entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: "Missing required audit fields" },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);

    const log = await recordAuditLog({
      actorId,
      actorName,
      actorRole: actorRole || "system",
      action,
      entityType,
      entityId,
      details: details || "",
      ipAddress: clientIp,
    });

    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to record audit log",
      },
      { status: 500 }
    );
  }
}
