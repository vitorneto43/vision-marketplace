
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  request.headers.get("accept");
  try {
    const projects = await sql`
      SELECT
        id,
        title,
        slug,
        summary,
        category,
        country,
        development_stage,
        created_at
      FROM projects
      WHERE status = 'published'
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json(
      { projects },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public projects error:", error);

    return NextResponse.json(
      { error: "Unable to load projects." },
      { status: 500 }
    );
  }
}
