
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";

async function ProjectContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const projects = await sql`
    SELECT
      id,
      title,
      summary,
      description,
      category,
      country,
      development_stage,
      website,
      video_url,
      seeking
    FROM projects
    WHERE slug = ${slug}
      AND status = 'published'
    LIMIT 1
  `;

  if (!projects.length) notFound();

  const project = projects[0];

  const images = await sql`
    SELECT id, caption
    FROM project_media
    WHERE project_id = ${project.id}
      AND media_type = 'image'
    ORDER BY id
  `;

  return (
    <main className="min-h-screen bg-[#080d19] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-cyan-400">
          ← Back to Vision Marketplace
        </Link>

        <h1 className="mt-12 text-4xl font-bold">
          {project.title}
        </h1>

        <p className="mt-6 text-xl text-slate-400">
          {project.summary}
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-sm text-cyan-300">
          {project.category && <span>{project.category}</span>}
          {project.country && <span>· {project.country}</span>}
          {project.development_stage && (
            <span>· {project.development_stage}</span>
          )}
        </div>

        {images.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-5 text-2xl font-bold">
              Project Gallery
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              {images.map((item) => (
                <div
                  key={String(item.id)}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-[#101827]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/media/${item.id}`}
                    alt={String(item.caption || project.title)}
                    className="h-auto w-full object-contain"
                    loading="lazy"
                  />

                  {item.caption && (
                    <p className="p-4 text-sm text-slate-400">
                      {item.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 rounded-2xl border border-slate-800 bg-[#101827] p-8">
          <h2 className="text-2xl font-bold">
            About This Project
          </h2>

          <p className="mt-5 whitespace-pre-wrap leading-8 text-slate-300">
            {project.description}
          </p>
        </section>

        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950"
          >
            Visit Project Website
          </a>
        )}
      </div>
    </main>
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080d19] p-12 text-center text-white">
          Loading project...
        </main>
      }
    >
      <ProjectContent params={params} />
    </Suspense>
  );
}
