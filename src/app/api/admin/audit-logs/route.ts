import { NextResponse } from "next/server";
import { getAuditLogs, recordAuditLog, AuditLogEntry } from "@/lib/audit";
import { getClientIp } from "@/lib/ip";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const role = searchParams.get("role");

    let logs = await getAuditLogs();

    if (action) {
      logs = logs.filter((log) => log.action.toLowerCase() === action.toLowerCase());
    }
    if (role) {
      logs = logs.filter((log) => log.actorRole.toLowerCase() === role.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: logs.length,
      data: logs,
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
