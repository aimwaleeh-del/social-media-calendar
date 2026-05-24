"use client";

import { useState } from "react";

type Post = {
  id: string;
  title: string;
  post_date: string;
  platform: string;
  status: "Draft" | "Scheduled" | "Published";
  program: string | null;
  assignee: string | null;
  caption: string | null;
  design_notes: string | null;
  media_url: string | null;
  post_type: string | null;
  post_goal: string | null;
  image_url: string | null;
};

type ThreeMonthPlanProps = {
  posts: Post[];
  draggedPostId: string | null;
  setDraggedPostId: (id: string | null) => void;
  onPostClick: (post: Post) => void;
  onMovePostToDate: (postId: string, newDate: string) => void;
  onAddPostForDate: (dateString: string) => void;
};

const months = [
  {
    label: "June",
    display: "☀️ June 2026",
    year: 2026,
    month: 5,
    defaultDate: "2026-06-01",
  },
  {
    label: "July",
    display: "🌤 July 2026",
    year: 2026,
    month: 6,
    defaultDate: "2026-07-01",
  },
  {
    label: "August",
    display: "🌅 August 2026",
    year: 2026,
    month: 7,
    defaultDate: "2026-08-01",
  },
];

export default function ThreeMonthPlan({
  posts,
  draggedPostId,
  setDraggedPostId,
  onPostClick,
  onMovePostToDate,
  onAddPostForDate,
}: ThreeMonthPlanProps) {
  const [activeMonth, setActiveMonth] = useState(0);

  const selectedMonth = months[activeMonth];

  const monthPosts = posts
    .filter((post) => {
      const date = new Date(post.post_date + "T00:00:00");
      return (
        date.getFullYear() === selectedMonth.year &&
        date.getMonth() === selectedMonth.month
      );
    })
    .sort((a, b) => a.post_date.localeCompare(b.post_date));

  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] p-7 text-white">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-r from-[#e8453c] to-[#f9956b] opacity-20" />

        <p className="relative z-10 text-xs font-black uppercase tracking-[0.18em] text-white/40">
          Planning Board
        </p>

        <h2 className="cira-heading relative z-10 mt-1 text-3xl font-black leading-tight">
          3-Month Content Plan
          <br />
          <em className="not-italic text-[#f9956b]">
            June · July · August 2026
          </em>
        </h2>

        <p className="relative z-10 mt-2 text-xs text-white/55">
          Add your own content. Everything syncs with the Calendar tab.
        </p>
      </div>

      <div className="grid grid-cols-3 border-b-2 border-[#e8eaf2] bg-white">
        {months.map((month, index) => (
          <button
            key={month.label}
            type="button"
            onClick={() => setActiveMonth(index)}
            className={`border-b-4 px-3 py-4 text-center text-xs font-black uppercase tracking-wide transition ${
              activeMonth === index
                ? "border-[#e8453c] text-[#0d2560]"
                : "border-transparent text-[#aaa] hover:text-[#e8453c]"
            }`}
          >
            {month.display}
          </button>
        ))}
      </div>

      <div className="bg-[#e5e9f2] p-5">
        <div className="rounded-[28px] bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8453c]">
                Monthly Content
              </p>

              <h3 className="cira-heading text-2xl font-black text-[#0d2560]">
                {selectedMonth.display}
              </h3>

              <p className="mt-1 text-xs font-bold text-[#777]">
                {monthPosts.length} content item{monthPosts.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddPostForDate(selectedMonth.defaultDate)}
              className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-5 py-3 text-sm font-black text-white shadow-sm"
            >
              + Add Content
            </button>
          </div>

          {monthPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e8eaf2] bg-[#f4f6fb] p-10 text-center">
              <p className="text-base font-black text-[#0d2560]">
                No content added yet.
              </p>

              <p className="mt-2 text-sm font-bold text-[#777]">
                Click “+ Add Content” to create your first post for this month.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  draggable
                  onDragStart={() => setDraggedPostId(post.id)}
                  onDragEnd={() => setDraggedPostId(null)}
                  onClick={() => {
                    if (!draggedPostId) onPostClick(post);
                  }}
                  className={`w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    draggedPostId === post.id ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <div className="flex">
                    <div
                      className={`w-2 shrink-0 bg-gradient-to-b ${programGradient(
                        post.program
                      )}`}
                    />

                    <div className="flex-1 p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-[#f4f6fb] px-2 py-1 text-[10px] font-black text-[#777]">
                          {formatDate(post.post_date)}
                        </span>

                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-black ${programPill(
                            post.program
                          )}`}
                        >
                          {post.program || "Program"}
                        </span>

                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-black ${statusPill(
                            post.status
                          )}`}
                        >
                          {post.status}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-700">
                          {post.post_type || "Static"}
                        </span>

                        <span className="rounded-full bg-[#25d366]/10 px-2 py-1 text-[9px] font-black text-[#128C7E]">
                          {post.post_goal || "Engage"}
                        </span>
                      </div>

                      <h4 className="text-sm font-black leading-snug text-[#0d2560]">
                        {post.title}
                      </h4>

                      {post.caption && (
                        <p className="mt-1 max-h-10 overflow-hidden text-xs leading-relaxed text-[#777]">
                          {post.caption}
                        </p>
                      )}

                      <p className="mt-2 text-[10px] font-bold text-[#aaa]">
                        Click to view/edit · Drag to reschedule in Calendar
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("default", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function programGradient(program: string | null) {
  if (program === "Business" || program === "Business Mgmt") {
    return "from-[#1a3a8a] to-[#2d5be3]";
  }

  if (program === "AI Web Design") {
    return "from-[#6c3fc5] to-[#9b59b6]";
  }

  if (program === "French") {
    return "from-[#1a7a45] to-[#27ae60]";
  }

  if (program === "CIRA Brand") {
    return "from-[#1a3a8a] to-[#0d2560]";
  }

  return "from-[#e8453c] via-[#f4724a] to-[#f9956b]";
}

function programPill(program: string | null) {
  if (program === "Business" || program === "Business Mgmt") {
    return "bg-[#1a3a8a]/10 text-[#1a3a8a]";
  }

  if (program === "AI Web Design") {
    return "bg-[#6c3fc5]/10 text-[#6c3fc5]";
  }

  if (program === "French") {
    return "bg-[#1a7a45]/10 text-[#1a7a45]";
  }

  if (program === "CIRA Brand") {
    return "bg-[#0d2560]/10 text-[#0d2560]";
  }

  return "bg-[#e8453c]/10 text-[#e8453c]";
}

function statusPill(status: string) {
  if (status === "Published") return "bg-[#25d366]/10 text-[#128C7E]";
  if (status === "Scheduled") return "bg-[#0d2560]/10 text-[#0d2560]";
  return "bg-[#f5c842]/20 text-[#8a6000]";
}