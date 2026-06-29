import React from "react";
import Link from "next/link";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { notFound } from "next/navigation";
import parse from "html-react-parser";

interface SummaryDetailProps {
  params: Promise<{ slug: string }>;
}

export default async function SummaryDetailPage({ params }: SummaryDetailProps) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "public", "summary", `${slug}.yaml`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  let data: any;
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    data = yaml.load(fileContent);
  } catch (e) {
    console.error("YAML parsing error inside detail view:", e);
    notFound();
  }

  // Determine the format type of your notes property
  const notesIsArray = Array.isArray(data.notes);
  const notesIsString = typeof data.notes === "string";

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        
        {/* Back Link Row */}
        <Link href="/summaries" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider block mb-6">
          ← Back to Summaries
        </Link>

        {/* Heading Core Block */}
        <div className="border-b border-zinc-900 pb-6 mb-8">
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 mb-2">
            <span>{data.date || "No Date"}</span>
            {data.week && <span>•</span>}
            {data.week && <span>Week {data.week}</span>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            {data.title || `Summary: ${slug}`}
          </h1>
        </div>

        {/* Contents Render Block */}
        <div className="space-y-8">
          {data.overview && (
            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono mb-3">Overview</h2>
                {/* Changed from <p> to <div> to allow valid HTML structures inside it safely */}
                <div className="text-sm leading-relaxed text-zinc-300 font-sans whitespace-pre-wrap">
                {parse(data.overview)}
                </div>
            </section>
            )}

          {/* DYNAMIC RENDERING FOR NOTES */}
          {data.notes && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono mb-3">Key Takeaways</h2>
              
              {/* Variant A: Rendered as a Clean Numbered List if YAML Array */}
              {notesIsArray && (
                <ul className="space-y-3">
                  {(data.notes as string[]).map((note, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
                      <span className="text-zinc-600 font-mono select-none pt-0.5">
                        {(i + 1).toString().padStart(2, "0")}.
                      </span>
                      <span className="flex-1">{note}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Variant B: Rendered as Pure, Unnumbered Prose if YAML Block Literal String */}
              {notesIsString && (
                <div className="text-sm leading-relaxed text-zinc-300 font-sans whitespace-pre-wrap
                  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-4
                  ">
                    <div>{parse(data.notes)}</div>
                </div>
                )}
            </section>
          )}

          {/* Fallback for completely custom metadata keys */}
          {Object.keys(data)
            .filter(k => !["title", "date", "week", "description", "overview", "notes"].includes(k))
            .map((key) => (
              <section key={key} className="border-t border-zinc-900/60 pt-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-mono mb-2">{key}</h2>
                <div className="text-xs bg-zinc-900/40 border border-zinc-900 p-4 rounded-md font-mono text-zinc-400 whitespace-pre-wrap">
                  {typeof data[key] === "object" ? JSON.stringify(data[key], null, 2) : String(data[key])}
                </div>
              </section>
            ))}
        </div>

      </div>
    </div>
  );
}