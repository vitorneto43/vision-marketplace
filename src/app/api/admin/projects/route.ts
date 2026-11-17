
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { sql } from "@/lib/db";

function authorized(request: NextRequest): boolean {
  const expected = process.env.ADMIN_API_KEY;
  const provided = request.headers.get("x-admin-key");

  if (!expected || !provided) return false;

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);

  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const projects = await sql`
      SELECT
        id, title, slug, summary, category,
        country, status, created_at
      FROM projects
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Admin projects error:", error);
    return NextResponse.json(
      { error: "Unable to load projects" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { projectId, status } = await request.json();

    if (
      typeof projectId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId) ||
      !["published", "rejected"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE projects
      SET
        status = ${status},
        upload_token_hash = NULL,
        upload_token_expires_at = NULL,
        updated_at = NOW()
      WHERE id = ${projectId}
        AND status = 'pending'
      RETURNING id, title, status
    `;

    if (!result.length) {
      return NextResponse.json(
        { error: "Pending project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project: result[0],
    });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json(
      { error: "Unable to update project" },
      { status: 500 }
    );
  }
}
