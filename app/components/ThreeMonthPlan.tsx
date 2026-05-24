"use client";

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

const planMonths = [
  { label: "☀️ June", title: "June 2026", year: 2026, month: 5 },
  { label: "🌤 July", title: "July 2026", year: 2026, month: 6 },
  { label: "🌅 August", title: "August 2026", year: 2026, month: 7 },
];

export default function ThreeMonthPlan({
  posts,
  draggedPostId,
  setDraggedPostId,
  onPostClick,
  onMovePostToDate,
  onAddPostForDate,
}: ThreeMonthPlanProps) {
  const [activeMonth, setActiveMonth] = useStateSafe(0);

  const monthInfo = planMonths[activeMonth];

  const monthPosts = posts
    .filter((post) => {
      const date = new Date(post.post_date + "T00:00:00");
      return (
        date.getFullYear() === monthInfo.year &&
        date.getMonth() === monthInfo.month
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
          3-Month Content Calendar
          <br />
          <em className="not-italic text-[#f9956b]">
            June · July · August 2026
          </em>
        </h2>

        <p className="relative z-10 mt-2 text-xs text-white/55">
          Editable · Draggable · Synced with the Calendar tab
        </p>
      </div>

      <div className="border-b border-[#e8eaf2] bg-white px-4 py-3">
        <div className="flex flex-wrap gap-4 text-xs font-black text-[#444]">
          <LegendDot color="#e8453c" label="ECEA" />
          <LegendDot color="#2d5be3" label="Business Mgmt" />
          <LegendDot color="#9b59b6" label="AI Web Design" />
          <LegendDot color="#27ae60" label="French" />
          <LegendDot color="#0d2560" label="CIRA Brand" />
        </div>
      </div>

      <div className="grid grid-cols-3 border-b-2 border-[#e8eaf2] bg-white">
        {planMonths.map((month, index) => (
          <button
            key={month.title}
            type="button"
            onClick={() => setActiveMonth(index)}
            className={`border-b-4 px-3 py-4 text-center text-xs font-black uppercase tracking-wide transition ${
              activeMonth === index
                ? "border-[#e8453c] text-[#0d2560]"
                : "border-transparent text-[#aaa] hover:text-[#e8453c]"
            }`}
          >
            {month.label}
          </button>
        ))}
      </div>

      <div className="bg-[#e5e9f2] p-5">
        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <MiniMonthCalendar
            year={monthInfo.year}
            month={monthInfo.month}
            title={monthInfo.title}
            posts={posts}
            draggedPostId={draggedPostId}
            setDraggedPostId={setDraggedPostId}
            onPostClick={onPostClick}
            onMovePostToDate={onMovePostToDate}
            onAddPostForDate={onAddPostForDate}
          />

          <MonthPostList
            title={monthInfo.title}
            posts={monthPosts}
            draggedPostId={draggedPostId}
            setDraggedPostId={setDraggedPostId}
            onPostClick={onPostClick}
          />
        </div>
      </div>
    </section>
  );
}

function MiniMonthCalendar({
  year,
  month,
  title,
  posts,
  draggedPostId,
  setDraggedPostId,
  onPostClick,
  onMovePostToDate,
  onAddPostForDate,
}: {
  year: number;
  month: number;
  title: string;
  posts: Post[];
  draggedPostId: string | null;
  setDraggedPostId: (id: string | null) => void;
  onPostClick: (post: Post) => void;
  onMovePostToDate: (postId: string, newDate: string) => void;
  onAddPostForDate: (dateString: string) => void;
}) {
  const days = getMonthDays(year, month);

  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8453c]">
            Calendar View
          </p>

          <h3 className="cira-heading text-2xl font-black text-[#0d2560]">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onAddPostForDate(makeDateString(year, month, 1))}
          className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-4 py-2 text-xs font-black text-white"
        >
          + Add Post
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-[9px] font-black uppercase text-[#777]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`blank-${index}`}
                className="min-h-20 rounded-2xl bg-[#f4f6fb]"
              />
            );
          }

          const dateString = makeDateString(year, month, day);
          const postsForDay = posts.filter((post) => post.post_date === dateString);

          return (
            <div
              key={dateString}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggedPostId) {
                  onMovePostToDate(draggedPostId, dateString);
                  setDraggedPostId(null);
                }
              }}
              className={`min-h-20 rounded-2xl border p-1.5 transition ${
                draggedPostId
                  ? "border-[#e8453c] bg-[#fff8f5]"
                  : "border-[#e8eaf2] bg-white"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onAddPostForDate(dateString)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#f4f6fb] text-[10px] font-black text-[#0d2560] hover:bg-[#e8453c] hover:text-white"
                >
                  {day}
                </button>

                <button
                  type="button"
                  onClick={() => onAddPostForDate(dateString)}
                  className="rounded-md px-1 text-[10px] font-black text-[#e8453c] hover:bg-[#fff8f5]"
                >
                  +
                </button>
              </div>

              <div className="space-y-1">
                {postsForDay.slice(0, 2).map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    draggable
                    onDragStart={() => setDraggedPostId(post.id)}
                    onDragEnd={() => setDraggedPostId(null)}
                    onClick={() => onPostClick(post)}
                    className={`w-full rounded-lg bg-white p-1 text-left shadow-sm transition hover:shadow-md ${
                      draggedPostId === post.id ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <div
                      className={`mb-1 h-1 rounded-full bg-gradient-to-r ${programGradient(
                        post.program
                      )}`}
                    />

                    <p className="truncate text-[9px] font-black text-[#0d2560]">
                      {post.title}
                    </p>
                  </button>
                ))}

                {postsForDay.length > 2 && (
                  <p className="rounded-md bg-[#f4f6fb] px-1 py-0.5 text-[8px] font-black text-[#777]">
                    +{postsForDay.length - 2} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthPostList({
  title,
  posts,
  draggedPostId,
  setDraggedPostId,
  onPostClick,
}: {
  title: string;
  posts: Post[];
  draggedPostId: string | null;
  setDraggedPostId: (id: string | null) => void;
  onPostClick: (post: Post) => void;
}) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8453c]">
            Monthly Schedule
          </p>

          <h3 className="cira-heading text-2xl font-black text-[#0d2560]">
            {title} Posts
          </h3>
        </div>

        <div className="rounded-2xl bg-[#f4f6fb] px-4 py-2 text-xs font-black text-[#777]">
          {posts.length} posts
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e8eaf2] bg-[#f4f6fb] p-8 text-center">
          <p className="text-sm font-black text-[#0d2560]">
            No posts planned yet.
          </p>
          <p className="mt-1 text-xs font-bold text-[#777]">
            Click a date on the mini calendar to add a new post.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
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

                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-black ${typePill(
                        post.post_type
                      )}`}
                    >
                      {post.post_type || "Static"}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-black ${goalPill(
                        post.post_goal
                      )}`}
                    >
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
                    Click to view/edit · Drag to reschedule
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function useStateSafe(initialValue: number) {
  const React = require("react") as typeof import("react");
  return React.useState(initialValue);
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

function makeDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("default", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
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

function typePill(type: string | null) {
  if (type === "Reel") return "bg-purple-100 text-purple-700";
  if (type === "Carousel") return "bg-blue-100 text-blue-700";
  if (type === "Story") return "bg-pink-100 text-pink-700";
  return "bg-slate-100 text-slate-700";
}

function goalPill(goal: string | null) {
  if (goal === "Save") return "bg-[#f5c842]/20 text-[#8a6000]";
  if (goal === "Lead") return "bg-[#0d2560]/10 text-[#0d2560]";
  if (goal === "Reach") return "bg-[#e8453c]/10 text-[#e8453c]";
  return "bg-[#25d366]/10 text-[#128C7E]";
}