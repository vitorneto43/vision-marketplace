
"use client";

import { useState } from "react";

const categories = [
  "All",
  "Artificial Intelligence",
  "Technology",
  "Education",
  "Healthcare",
  "Sustainability",
  "Business",
  "Inventions",
];

const opportunities = [
  {
    title: "Discover Projects",
    description: "Explore innovative ideas and projects from creators worldwide.",
    icon: "🌍",
  },
  {
    title: "Showcase Your Idea",
    description: "Present your project, share its links, and reach interested people.",
    icon: "💡",
  },
  {
    title: "Connect Directly",
    description: "Contact creators to discuss purchases, funding, or partnerships.",
    icon: "🤝",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  return (
    <main className="min-h-screen bg-[#080d19] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-cyan-400">Vision</span> Marketplace
        </a>

        <nav className="hidden gap-8 text-sm text-slate-300 md:flex">
          <a href="#discover" className="hover:text-white">Discover</a>
          <a href="#how-it-works" className="hover:text-white">How It Works</a>
          <a href="#about" className="hover:text-white">About</a>
        </nav>

        
          <a
            href="/submit"
            className="rounded-full border border-cyan-400 px-5 py-2 text-sm text-cyan-300"
          >
            Submit a Project
          </a>

      </header>

      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
        <div className="mb-7 inline-block rounded-full border border-cyan-800 bg-cyan-950/40 px-5 py-2 text-sm text-cyan-300">
          A Global Platform for Ideas and Innovation
        </div>

        <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Great ideas deserve
          <span className="block text-cyan-400">to be discovered.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
          Showcase your ideas, inventions, and projects.
          Connect with people interested in buying,
          funding, supporting, or collaborating.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#discover"
            className="rounded-full bg-cyan-400 px-8 py-4 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Explore Projects
          </a>
          <a
            href="#how-it-works"
            className="rounded-full border border-slate-600 px-8 py-4 font-semibold hover:bg-slate-800"
          >
            How It Works
          </a>
        </div>
      </section>

      <section id="discover" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Discover Innovation</h2>
          <p className="mt-3 text-slate-400">
            Find ideas and projects across industries and countries.
          </p>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search ideas, inventions, projects..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900 p-5 text-white outline-none focus:border-cyan-400"
        />

        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-2 text-sm ${
                category === item
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-20 text-center">
          <div className="text-5xl">🚀</div>
          <h3 className="mt-5 text-2xl font-semibold">
            Projects are coming soon
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            We are preparing our global project directory.
            New ideas and innovations will appear here.
          </p>
          {(search || category !== "All") && (
            <p className="mt-5 text-sm text-cyan-300">
              Search: {search || "Any"} · Category: {category}
            </p>
          )}
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-900/60 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold">
            How Vision Marketplace Works
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {opportunities.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-[#101827] p-8"
              >
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-4 leading-7 text-slate-400">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="about" className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col justify-between gap-5 md:flex-row">
          <div>
            <h2 className="text-xl font-bold">Vision Marketplace</h2>
            <p className="mt-2 text-sm text-slate-400">
              Connecting ideas with opportunities worldwide.
            </p>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-400">
            Vision Marketplace is a project discovery and connection
            platform. All negotiations, agreements, and payments take
            place independently between the parties.
          </p>
        </div>
      </footer>
    </main>
  );
}
