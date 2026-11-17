
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { sql } from "@/lib/db";
import { r2, R2_BUCKET } from "@/lib/r2";

const types: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
};

const limits: Record<string, number> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, uploadToken, key } = body;

    if (
      typeof projectId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId) ||
      typeof uploadToken !== "string" ||
      !/^[0-9a-f]{64}$/i.test(uploadToken) ||
      typeof key !== "string" ||
      !new RegExp(
        `^pending/${projectId}/[0-9a-f-]{36}\\.(jpg|png|webp|mp4|webm|mp3|wav|ogg)$`,
        "i"
      ).test(key)
    ) {
      return NextResponse.json(
        { error: "Invalid confirmation request." },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(uploadToken)
      .digest("hex");

    const projects = await sql`
      SELECT id FROM projects
      WHERE id = ${projectId}
        AND upload_token_hash = ${tokenHash}
        AND upload_token_expires_at > NOW()
        AND status = 'pending'
      LIMIT 1
    `;

    if (!projects.length) {
      return NextResponse.json(
        { error: "Invalid or expired authorization." },
        { status: 403 }
      );
    }

    const extension = key.split(".").pop()!.toLowerCase();
    const expectedType = types[extension];
    const mediaType = expectedType.split("/")[0];

    const metadata = await r2.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );

    if (
      metadata.ContentType !== expectedType ||
      !metadata.ContentLength ||
      metadata.ContentLength > limits[mediaType]
    ) {
      return NextResponse.json(
        { error: "Invalid uploaded file." },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id FROM project_media
      WHERE project_id = ${projectId}
        AND url = ${key}
      LIMIT 1
    `;

    if (existing.length) {
      return NextResponse.json({
        success: true,
        mediaId: existing[0].id,
      });
    }

    const media = await sql`
      INSERT INTO project_media (
        project_id,
        media_type,
        url
      )
      VALUES (
        ${projectId},
        ${mediaType},
        ${key}
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      mediaId: media[0].id,
    });
  } catch (error) {
    console.error("Upload confirmation error:", error);

    return NextResponse.json(
      { error: "Unable to confirm upload." },
      { status: 500 }
    );
  }
}
