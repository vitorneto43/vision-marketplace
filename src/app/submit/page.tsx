
"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubmitProject() {
  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    category: "",
    country: "",
    stage: "",
    seeking: "",
    website: "",
    video: "",
    name: "",
    email: "",
  });

  const [status, setStatus] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [audios, setAudios] = useState<File[]>([]);



  function update(field: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  

async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (submitting) return;

  setSubmitting(true);
  setStatus("Creating your project...");

  let projectCreated = false;

  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Project submission failed.");
    }

    projectCreated = true;

    const projectId = result.project.id;
    const uploadToken = result.uploadToken;

    const files = [...images, ...videos, ...audios];

    if (files.length > 0 && !uploadToken) {
      throw new Error("Project created, but upload authorization is missing.");
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      setStatus(`Uploading file ${index + 1} of ${files.length}...`);

      const authorization = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          uploadToken,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const upload = await authorization.json();

      if (!authorization.ok) {
        throw new Error(upload.error || "Upload authorization failed.");
      }

      const transfer = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!transfer.ok) {
        throw new Error(`Unable to upload ${file.name}.`);
      }

      const confirmation = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          uploadToken,
          key: upload.key,
        }),
      });

      const confirmed = await confirmation.json();

      if (!confirmation.ok) {
        throw new Error(confirmed.error || "Media confirmation failed.");
      }
    }

    setStatus("Project and media submitted successfully! Awaiting approval.");

    setForm({
      title: "",
      summary: "",
      description: "",
      category: "",
      country: "",
      stage: "",
      seeking: "",
      website: "",
      video: "",
      name: "",
      email: "",
    });

    setImages([]);
    setVideos([]);
    setAudios([]);

    document
      .querySelectorAll<HTMLInputElement>('input[type="file"]')
      .forEach((input) => {
        input.value = "";
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Submission failed.";

    setStatus(
      projectCreated
        ? `Project created, but media upload was interrupted: ${message}`
        : message
    );
  } finally {
    setSubmitting(false);
  }
}


  const inputStyle =
    "w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-cyan-400";

  return (
    <main className="min-h-screen bg-[#080d19] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-cyan-400">
          ← Back to Vision Marketplace
        </Link>

        <h1 className="mt-10 text-4xl font-bold">
          Submit Your Project
        </h1>

        <p className="mt-4 text-slate-400">
          Present your idea, invention, or project to the world.
          Interested people can contact you directly.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-6">
          {([
            ["title", "Project Name"],
            ["summary", "Short Description"],
            ["category", "Category"],
            ["country", "Country"],
            ["stage", "Development Stage"],
            ["seeking", "Looking For (Sale, Funding, Partnership, Support)"],
            ["website", "Project Website"],
            ["video", "Video URL"],
            ["name", "Your Name"],
            ["email", "Contact Email"],
          ] as const).map(([field, label]) => (
            <div key={field}>
              <label className="mb-2 block text-sm text-slate-300">
                {label}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                className={inputStyle}
                value={form[field]}
                onChange={(event) => update(field, event.target.value)}
                required={["title", "summary", "name", "email"].includes(field)}
              />
            </div>
          ))}

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Full Project Description
            </label>
            <textarea
              className={inputStyle}
              rows={7}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              required
            />
          </div>
        
        <section className="space-y-6 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-cyan-400">
                Project Media
            </h2>

            <p className="text-sm text-slate-400">
                Showcase your project with images, videos and audio.
            </p>

            <div>
                <label className="mb-2 block text-sm text-slate-300">
                Project Images
                </label>
                
                <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className={inputStyle}
                onChange={(event) =>
                    setImages(Array.from(event.target.files || []))
                }
                />

            </div>

            <div>
                <label className="mb-2 block text-sm text-slate-300">
                Project Videos
                </label>
               
                <input
                type="file"
                accept="video/mp4,video/webm"
                multiple
                className={inputStyle}
                onChange={(event) =>
                    setVideos(Array.from(event.target.files || []))
                }
                />

            </div>

            <div>
                <label className="mb-2 block text-sm text-slate-300">
                Project Audio
                </label>
               
                <input
                type="file"
                accept="audio/mpeg,audio/wav,audio/ogg"
                multiple
                className={inputStyle}
                onChange={(event) =>
                    setAudios(Array.from(event.target.files || []))
                }
                />

            </div>
        </section>

          
            <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
            >
            {submitting ? "Submitting..." : "Submit Project"}
            </button>


          {status && (
            <p role="status" className="text-center text-cyan-300">
              {status}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
