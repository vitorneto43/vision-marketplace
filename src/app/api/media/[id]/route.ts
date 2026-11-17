
import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { sql } from "@/lib/db";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return new Response("Invalid media ID", { status: 400 });
    }

    const rows = await sql`
      SELECT pm.url
      FROM project_media pm
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.id = ${id}
        AND p.status = 'published'
        AND pm.media_type = 'image'
      LIMIT 1
    `;

    if (!rows.length) {
      return new Response("Media not found", { status: 404 });
    }

    const object = await r2.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: rows[0].url,
      })
    );

    if (!object.Body) {
      return new Response("Media not found", { status: 404 });
    }

    
    const bytes = await object.Body.transformToByteArray();
    const buffer = Buffer.from(bytes);

    return new Response(buffer, {

      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Media delivery error:", error);

    return NextResponse.json(
      { error: "Unable to load media." },
      { status: 500 }
    );
  }
}
