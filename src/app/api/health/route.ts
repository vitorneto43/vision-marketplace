
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`
      SELECT COUNT(*) AS total FROM projects
    `;

    return NextResponse.json({
      status: "connected",
      projects: Number(result[0].total),
    });
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      { status: "connection_error" },
      { status: 500 }
    );
  }
}
