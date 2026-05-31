import React from "react";
import Link from "next/link";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface SummaryMeta {
  slug: string;
  title: string;
  date: string;
  week?: number;
  description?: string;
}

// Re-using your precise color definitions to stay entirely in-theme
const COLORS = {
  pageBg: "bg-zinc-950",
  textPrimary: "text-zinc-100",
  textMuted: "text-zinc-400",
  tileBg: "bg-zinc-900",
  tileBorder: "border border-zinc-800/80 hover:border-zinc-500",
  tileGlow: "hover:shadow-[0_0_20px_rgba(39,39,42,0.4)]",
  accentBadge: "bg-zinc-800 text-zinc-300 font-mono",
};

export default async function SummariesPage() {
  const summaryDir = path.join(process.cwd(), "public", "summary");
  let summaries: SummaryMeta[] = [];

  try {
    if (fs.existsSync(summaryDir)) {
      const files = fs.readdirSync(summaryDir).filter(file => file.endsWith(".yaml") || file.endsWith(".yml"));

      summaries = files.map((file) => {
        const filePath = path.join(summaryDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        
        // Parse YAML content safely
        const data = yaml.load(fileContent) as any;
        const slug = file.replace(/\.ya?ml$/, "");

        return {
          slug,
          title: data.title || `Summary for ${slug}`,
          date: data.date || "Unknown Date",
          week: data.week || undefined,
          description: data.description || "No description provided.",
        };
      });

      // Sort by week descending (highest first). If week is missing, fall back to comparing slugs.
        summaries.sort((a, b) => {
            const weekA = a.week ?? 0;
            const weekB = b.week ?? 0;

            if (weekB !== weekA) {
                return weekB - weekA; // Descending order: highest week goes to top
            }
            
            // Tie-breaker: If they share a week, sort by slug descending (e.g., day-7 before day-6)
            return b.slug.localeCompare(a.slug, undefined, { numeric: true });
        });
    }
  } catch (error) {
    console.error("Error reading summaries directory:", error);
  }

  return (
    <div className={`w-full min-h-screen ${COLORS.pageBg} ${COLORS.textPrimary} p-6 md:p-10 flex flex-col items-center`}>
      
      {/* Upper Navigation Anchor Row */}
      <div className="w-full max-w-2xl flex items-center justify-between border-b border-zinc-900 pb-6 mb-8">
        <div>
          <Link href="/" className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider">
            ← Back to Tracker
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mt-1 select-none">
            Reading Summaries
          </h1>
        </div>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
          {summaries.length} entries
        </span>
      </div>

      {/* Downward Scrolling Infinite List Container */}
      <div className="w-full max-w-2xl flex flex-col gap-4 overflow-y-auto pb-12 pr-1">
        {summaries.length === 0 ? (
          <div className="w-full text-center py-12 text-xs font-mono tracking-widest text-zinc-600 uppercase">
            No YAML summaries discovered in /public/summary/
          </div>
        ) : (
          summaries.map((item) => (
            <Link
              key={item.slug}
              href={`/summaries/${item.slug}`}
              className={`group block w-full p-5 rounded-lg ${COLORS.tileBg} ${COLORS.tileBorder} ${COLORS.tileGlow} transition-all duration-200`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-base font-medium group-hover:text-zinc-50 transition-colors tracking-tight">
                  {item.title}
                </h3>
                
                <div className="flex gap-2 shrink-0">
                  {item.week && (
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${COLORS.accentBadge}`}>
                      WK {item.week}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-zinc-500 self-center">
                    {item.date}
                  </span>
                </div>
              </div>
              
              <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">
                {item.description}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}