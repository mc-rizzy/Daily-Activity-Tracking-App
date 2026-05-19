"use client";

import React, { useState, useEffect } from "react";

interface DayData {
  dayNumber: number;
  dateString: string;
  status: "completed" | "in-progress" | "pending";
  agenda: string;
}

interface JsonInputItem {
  dayNumber: number;
  agenda?: string;
}

// ==========================================
// CONTROLLABLE THEME VARIABLES (Tailwind classes)
// ==========================================
const COLORS = {
  // Screen background & typography
  pageBg: "bg-zinc-950",
  textPrimary: "text-zinc-100",
  textMuted: "text-zinc-400",
  textWeekLabel: "text-zinc-400 font-semibold tracking-widest",
  
  // Alternating background full-screen stripes
  stripeEven: "bg-zinc-950",      
  stripeOdd: "bg-zinc-900/50",     

  // FIXED: Double-thickness, high-visibility borders for pending tiles
  tilePendingBg: "bg-zinc-900",    
  tilePendingBorder: "border-2 border-zinc-800/80", // Thicker (2px) and significantly brighter slate gray
  tilePendingHover: "hover:bg-zinc-800 hover:border-zinc-400",

  // "In Progress" Tile state (Active Day)
  tileActiveBg: "bg-amber-400/40", 
  tileActiveBorder: "border-2 border-amber-500", 
  tileActiveHover: "hover:bg-amber-500/60",
  tileActiveGlow: "shadow-[0_0_16px_rgba(251,191,36,0.6)]", 
  textActiveBadge: "bg-amber-400/30 text-amber-200 font-bold",
  textActiveLabel: "text-amber-300 font-bold",

  // "Completed" Tiles state (Achieved Days)
  tileDoneBg: "bg-emerald-400/45", 
  tileDoneBorder: "border-2 border-emerald-700", 
  tileDoneHover: "hover:bg-emerald-400/65",
  tileDoneGlow: "shadow-[0_0_14px_rgba(52,211,153,0.45)]", 
  textDoneBadge: "bg-emerald-400/30 text-emerald-200 font-bold",

  // Tooltip popup window styling
  tooltipBg: "bg-zinc-900",
  tooltipBorder: "border-zinc-700", 
  tooltipTextTitle: "text-zinc-100",
  tooltipTextBody: "text-zinc-200",
  tooltipArrowOuter: "border-t-zinc-900 border-b-zinc-900", 
  tooltipArrowInner: "border-t-zinc-500 border-b-zinc-500",

  // Bottom Persistent Banner
  footerBorder: "border-zinc-800",
};

export default function DailyTracker() {
  const COLUMNS = 15;
  const ROWS = 7;
  const TOTAL_DAYS = COLUMNS * ROWS; // 105

  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayAgenda, setTodayAgenda] = useState<string>("");

  useEffect(() => {
    // FIX: Baseline tracking anchor date (May 17, 2026 was a Sunday)
    const START_DATE = new Date("2026-05-17T00:00:00");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    const daysElapsed = Math.floor((today.getTime() - START_DATE.getTime()) / msPerDay);
    const currentTimelineDay = daysElapsed + 1;

    // Weekday name reference index
    const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    fetch("/tracker-data.json")
      .then((res) => res.json())
      .then((jsonData: any[]) => {
        let activeAgenda = "No agenda scheduled for today.";

        const formattedDays = Array.from({ length: TOTAL_DAYS }, (_, i) => {
          const dayNum = i + 1;
          const match = jsonData.find((item) => item.dayNumber === dayNum);
          
          // DEFAULT FALLBACK
          let agendaText = "• No agenda scheduled for today.";

          // Array Parsing Logic
          if (match && match.agenda) {
            if (Array.isArray(match.agenda)) {
              agendaText = match.agenda
                .map((item: string) => `• ${item.trim()}`)
                .join("\n");
            } else if (typeof match.agenda === "string") {
              agendaText = match.agenda;
            }
          }

          let calculatedStatus: "completed" | "in-progress" | "pending" = "pending";
          
          if (dayNum < currentTimelineDay) {
            calculatedStatus = "completed";
          } else if (dayNum === currentTimelineDay) {
            calculatedStatus = "in-progress";
            activeAgenda = agendaText;
          }

          // FIXED: Calculate the exact calendar weekday name for this specific grid index
          const tileDate = new Date(START_DATE.getTime() + (i * msPerDay));
          const dayOfWeekName = WEEKDAYS[tileDate.getDay()];

          return {
            dayNumber: dayNum,
            // Enhanced header layout string combining Day number and weekday string
            dateString: `Day ${dayNum} — ${dayOfWeekName}`,
            status: calculatedStatus,
            agenda: agendaText,
          };
        });
        
        setTodayAgenda(activeAgenda);
        setDays(formattedDays);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading tracker JSON data:", err);
        setLoading(false);
      });
  }, []);

  const columnsData = Array.from({ length: COLUMNS }, (_, colIndex) => {
    return Array.from({ length: ROWS }, (_, rowIndex) => {
      const sequentialIndex = colIndex * ROWS + rowIndex;
      return days[sequentialIndex];
    });
  });

  if (loading) {
    return (
      <div className={`w-full min-h-screen flex items-center justify-center ${COLORS.textMuted} font-mono text-xs tracking-widest select-none`}>
        CALCULATING TRACKER TIMELINE...
      </div>
    );
  }

  return (
    <div className={`relative w-full min-h-screen flex flex-col justify-between p-6 md:p-10 ${COLORS.textPrimary} overflow-hidden`}>
      
      {/* Full-Screen Background Stripes Layer */}
      <div className="absolute inset-0 w-full h-full flex pointer-events-none z-0 px-6 md:px-10">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-15 h-full gap-0.5">
          {Array.from({ length: COLUMNS }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`h-full w-full ${
                colIndex % 2 === 0 ? COLORS.stripeEven : COLORS.stripeOdd
              }`}
            />
          ))}
        </div>
      </div>

      {/* Foreground Header Row */}
      <div className="relative z-10 w-full flex items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-semibold tracking-tight select-none">
          Bible Reading Summer 2026
        </h2>
        
        <div className={`flex items-center gap-4 text-xs ${COLORS.textMuted} select-none`}>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm ${COLORS.tilePendingBg} ${COLORS.tilePendingBorder} block`} />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm ${COLORS.tileActiveBg} ${COLORS.tileActiveBorder} ${COLORS.tileActiveGlow} block`} />
            <span className={`${COLORS.textActiveLabel} font-medium`}>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm ${COLORS.tileDoneBg} ${COLORS.tileDoneBorder} ${COLORS.tileDoneGlow} block`} />
            <span>Achieved</span>
          </div>
        </div>
      </div>

      {/* Foreground Centered Grid Canvas */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full py-4">
        <div className="w-full max-w-5xl grid grid-cols-15 gap-0.5 p-1 min-w-[640px]">
          {columnsData.map((columnDays, colIndex) => (
            <div key={colIndex} className="group/column relative flex flex-col gap-2 p-2.5 pt-8">
              
              {/* Hover Week Indicator Label */}
              <div className={`absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold font-mono ${COLORS.textWeekLabel} opacity-0 group-hover/column:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap select-none tracking-wider`}>
                WEEK {colIndex + 1}
              </div>

              {columnDays.map((day, rowIndex) => {
                if (!day) return null;
                const isTopRow = rowIndex < 2;

                // Bind variable presets dynamically based on the state assignment
                let tileStyleClasses = `${COLORS.tilePendingBg} ${COLORS.tilePendingBorder} ${COLORS.tilePendingHover}`;
                if (day.status === "completed") {
                  tileStyleClasses = `${COLORS.tileDoneBg} ${COLORS.tileDoneBorder} ${COLORS.tileDoneHover} ${COLORS.tileDoneGlow}`;
                } else if (day.status === "in-progress") {
                // Swapped standard animate-pulse for a gentle custom inline transition effect
                tileStyleClasses = `${COLORS.tileActiveBg} ${COLORS.tileActiveBorder} ${COLORS.tileActiveHover} ${COLORS.tileActiveGlow} [animation:pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]`;
                }

                return (
                  <div key={day.dayNumber} className="relative group/square w-full">
                    {/* Interactive Square Box */}
                    <button
                      aria-label={`View agenda for ${day.dateString} - ${day.status}`}
                      className={`w-full aspect-square rounded-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-500 ${tileStyleClasses}`}
                    />

                    {/* Adaptive Hover Tooltip Popup Window */}
                    <div 
                        className={`absolute z-30 left-1/2 -translate-x-1/2 w-48 p-3 
                        ${COLORS.tooltipBg} ${COLORS.tooltipBorder} border rounded-lg shadow-2xl opacity-0 scale-95 pointer-events-none 
                        group-hover/square:opacity-100 group-hover/square:scale-100 transition-all duration-150 ease-out
                        ${isTopRow ? "top-full mt-2 origin-top" : "bottom-full mb-2 origin-bottom"}
                    `}
                    >
                    <div className={`flex items-center justify-between border-b ${COLORS.tooltipBorder} pb-1.5 mb-1.5`}>
                        <span className={`text-xs font-medium ${COLORS.tooltipTextTitle}`}>{day.dateString}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        day.status === "completed" ? COLORS.textDoneBadge :
                        day.status === "in-progress" ? COLORS.textActiveBadge :
                        "bg-zinc-800 text-zinc-400"
                        }`}>
                        {day.status === "completed" ? "Done" : day.status === "in-progress" ? "Today" : "Pending"}
                        </span>
                    </div>
                    
                    <p className={`text-[11px] leading-relaxed ${COLORS.tooltipTextBody} whitespace-pre-line font-mono`}>
                        {day.agenda}
                    </p>
                    
                    {/* FIXED: Replaced static zinc utility overrides with standard global arrow assignments */}
                    {isTopRow ? (
                        <>
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent ${COLORS.tooltipArrowOuter}`} />
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent ${COLORS.tooltipArrowInner} -z-10 mb-[1px]`} />
                        </>
                    ) : (
                        <>
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${COLORS.tooltipArrowOuter}`} />
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${COLORS.tooltipArrowInner} -z-10 mt-[1px]`} />
                        </>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Persistent Footer Agenda Display Block */}
      <div className={`relative z-10 w-full border-t ${COLORS.footerBorder} pt-6 mt-8 flex flex-col items-center justify-center select-none text-center`}>
        <div className="max-w-md">
          <span className={`text-[10px] font-bold tracking-widest uppercase font-mono px-2 py-0.5 ${COLORS.textActiveBadge} rounded-full`}>
            Today's Agenda
          </span>
          <p className={`text-xs md:text-sm ${COLORS.tooltipTextBody} font-mono whitespace-pre-line leading-relaxed mt-3 max-w-sm mx-auto`}>
            {todayAgenda}
          </p>
        </div>
      </div>
    </div>
  );
}