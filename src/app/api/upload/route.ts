
import { NextResponse } from "next/server";
import { randomUUID, createHash } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sql } from "@/lib/db";
import { r2, R2_BUCKET } from "@/lib/r2";

const allowedTypes: Record<
  string,
  { extension: string; category: string; maxSize: number }
> = {
  "image/jpeg": {
    extension: "jpg",
    category: "image",
    maxSize: 10 * 1024 * 1024,
  },
  "image/png": {
    extension: "png",
    category: "image",
    maxSize: 10 * 1024 * 1024,
  },
  "image/webp": {
    extension: "webp",
    category: "image",
    maxSize: 10 * 1024 * 1024,
  },
  "video/mp4": {
    extension: "mp4",
    category: "video",
    maxSize: 100 * 1024 * 1024,
  },
  "video/webm": {
    extension: "webm",
    category: "video",
    maxSize: 100 * 1024 * 1024,
  },
  "audio/mpeg": {
    extension: "mp3",
    category: "audio",
    maxSize: 20 * 1024 * 1024,
  },
  "audio/wav": {
    extension: "wav",
    category: "audio",
    maxSize: 20 * 1024 * 1024,
  },
  "audio/ogg": {
    extension: "ogg",
    category: "audio",
    maxSize: 20 * 1024 * 1024,
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { projectId, uploadToken, fileType, fileSize } = body;

    if (
      typeof projectId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(projectId) ||
      typeof uploadToken !== "string" ||
      !/^[0-9a-f]{64}$/i.test(uploadToken) ||
      typeof fileType !== "string" ||
      !Number.isSafeInteger(fileSize)
    ) {
      return NextResponse.json(
        { error: "Invalid upload request." },
        { status: 400 }
      );
    }

    const file = allowedTypes[fileType];

    if (!file || fileSize <= 0 || fileSize > file.maxSize) {
      return NextResponse.json(
        { error: "Unsupported file type or size." },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(uploadToken)
      .digest("hex");

    const projects = await sql`
      SELECT id
      FROM projects
      WHERE id = ${projectId}
        AND upload_token_hash = ${tokenHash}
        AND upload_token_expires_at > NOW()
        AND status = 'pending'
      LIMIT 1
    `;

    if (projects.length === 0) {
      return NextResponse.json(
        { error: "Upload authorization expired or invalid." },
        { status: 403 }
      );
    }

    const key =
      `pending/${projectId}/${randomUUID()}.${file.extension}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 300,
    });

    return NextResponse.json({
      uploadUrl,
      key,
      mediaType: file.category,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Upload authorization error:", error);

    return NextResponse.json(
      { error: "Unable to authorize upload." },
      { status: 500 }
    );
  }
}
