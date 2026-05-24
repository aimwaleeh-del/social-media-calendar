"use client";

type Status = "Draft" | "Scheduled" | "Published";

type Post = {
  id: string;
  title: string;
  post_date: string;
  platform: string;
  status: Status;
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
  { label: "☀️ June", year: 2026, month: 5 },
  { label: "🌤 July", year: 2026, month: 6 },
  { label: "🌅 August", year: 2026, month: 7 },
];

export default function ThreeMonthPlan({
  posts,
  draggedPostId,
  setDraggedPostId,
  onPostClick,
  onMovePostToDate,
  onAddPostForDate,
}: ThreeMonthPlanProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] p-6 text-white">
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

        <p className="relative z-10 mt-2 text-xs text-white/50">
          Editable · Draggable · Synced with Calendar tab
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

      <div className="bg-[#e5e9f2] p-4">
        <div className="grid gap-5 xl:grid-cols-3">
          {planMonths.map((month) => (
            <MonthColumn
              key={`${month.year}-${month.month}`}
              year={month.year}
              month={month.month}
              label={month.label}
              posts={posts}
              draggedPostId={draggedPostId}
              setDraggedPostId={setDraggedPostId}
              onPostClick={onPostClick}
              onMovePostToDate={onMovePostToDate}
              onAddPostForDate={onAddPostForDate}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MonthColumn({
  year,
  month,
  label,
  posts,
  draggedPostId,
  setDraggedPostId,
  onPostClick,
  onMovePostToDate,
  onAddPostForDate,
}: {
  year: number;
  month: number;
  label: string;
  posts: Post[];
  draggedPostId: string | null;
  setDraggedPostId: (id: string | null) => void;
  onPostClick: (post: Post) => void;
  onMovePostToDate: (postId: string, newDate: string) => void;
  onAddPostForDate: (dateString: string) => void;
}) {
  const days = getMonthDays(year, month);
  const monthTitle = new Date(year, month, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const monthPosts = posts.filter((post) => {
    const postDate = new Date(post.post_date + "T00:00:00");
    return postDate.getFullYear() === year && postDate.getMonth() === month;
  });

  return (
    <div className="rounded-[28px] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8453c]">
            {label}
          </p>
          <h3 className="cira-heading text-xl font-black text-[#0d2560]">
            {monthTitle}
          </h3>
        </div>

        <div className="rounded-xl bg-[#f4f6fb] px-3 py-2 text-xs font-black text-[#777]">
          {monthPosts.length} posts
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-[9px] font-black text-[#777]">
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
                className="min-h-24 rounded-xl bg-[#f4f6fb]"
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
              className={`min-h-24 rounded-xl border p-1.5 transition ${
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
                  title="Add post"
                >
                  {day}
                </button>

                <button
                  type="button"
                  onClick={() => onAddPostForDate(dateString)}
                  className="rounded-md px-1 text-[10px] font-black text-[#e8453c] hover:bg-[#fff8f5]"
                  title="Add post"
                >
                  +
                </button>
              </div>

              <div className="space-y-1">
                {postsForDay.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    draggable
                    onDragStart={() => setDraggedPostId(post.id)}
                    onDragEnd={() => setDraggedPostId(null)}
                    onClick={() => onPostClick(post)}
                    className={`w-full rounded-lg bg-white p-1.5 text-left shadow-sm transition hover:shadow-md ${
                      draggedPostId === post.id ? "opacity-50" : "opacity-100"
                    }`}
                  >
                    <div
                      className={`mb-1 h-1 rounded-full bg-gradient-to-r ${programGradient(
                        post.program
                      )}`}
                    />

                    <p className="line-clamp-2 text-[10px] font-black leading-tight text-[#0d2560]">
                      {post.title}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-1">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[8px] font-black ${programPill(
                          post.program
                        )}`}
                      >
                        {post.program || "Program"}
                      </span>

                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[8px] font-black ${statusPill(
                          post.status
                        )}`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function makeDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
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