
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { randomBytes, createHash } from "node:crypto";



function clean(value: unknown, max: number): string {
  return typeof value === "string"
    ? value.trim().slice(0, max)
    : "";
}

function validUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = clean(body.title, 150);
    const summary = clean(body.summary, 500);
    const description = clean(body.description, 10000);
    const category = clean(body.category, 100);
    const country = clean(body.country, 100);
    const stage = clean(body.stage, 100);
    const seeking = clean(body.seeking, 500)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const website = clean(body.website, 2000);
    const video = clean(body.video, 2000);
    const name = clean(body.name, 150);
    const email = clean(body.email, 254).toLowerCase();

    if (
      !title ||
      !summary ||
      !description ||
      !name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    if (!validUrl(website) || !validUrl(video)) {
      return NextResponse.json(
        { error: "Please enter valid website and video URLs." },
        { status: 400 }
      );
    }

    const slug =
      title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 70) + "-" + randomUUID().slice(0, 8);

    const uploadToken = randomBytes(32).toString("hex");

    const uploadTokenHash = createHash("sha256")
        .update(uploadToken)
        .digest("hex");

    const result = await sql`
      WITH new_profile AS (
        INSERT INTO profiles (name, email, country)
        VALUES (${name}, ${email}, ${country || null})
        RETURNING id
      )
      INSERT INTO projects (
        owner_id,
        title,
        slug,
        summary,
        description,
        category,
        country,
        development_stage,
        seeking,
        website,
        video_url,
        contact_email,
        status,
        upload_token_hash,
        upload_token_expires_at
      )
      SELECT
        new_profile.id,
        ${title},
        ${slug},
        ${summary},
        ${description},
        ${category || null},
        ${country || null},
        ${stage || null},
        ${seeking},
        ${website || null},
        ${video || null},
        ${email},
        'pending',
        ${uploadTokenHash},
        NOW() + INTERVAL '24 hours'
      FROM new_profile
      RETURNING id, slug, status
    `;

    return NextResponse.json(
      {
        success: true,
        project: result[0],
        uploadToken,
        message: "Project submitted for review.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Project submission error:", error);

    return NextResponse.json(
      { error: "Unable to submit project." },
      { status: 500 }
    );
  }
}
