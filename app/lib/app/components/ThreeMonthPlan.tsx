"use client";

import { useState } from "react";

type PlanPost = {
  day: string;
  date: string;
  program: "ECEA" | "Business Mgmt" | "AI Web Design" | "French" | "CIRA Brand";
  title: string;
  desc: string;
  tags: string[];
};

const planMonths: {
  label: string;
  title: string;
  subtitle: string;
  posts: PlanPost[];
}[] = [
  {
    label: "☀️ June",
    title: "☀️ June 2026",
    subtitle: "June total: 9 posts · 8 ECEA · 1 Business Mgmt",
    posts: [
      {
        day: "MON",
        date: "Jun 1",
        program: "ECEA",
        title: "🚩 Red Flags in an ECEA Job Posting",
        desc: "Navy background, coral red-flag boxes. 5 warning signs to spot before applying.",
        tags: ["Save", "Engage"],
      },
      {
        day: "THU",
        date: "Jun 4",
        program: "ECEA",
        title: '🎬 Reel — "Retail to ECEA in 8 Months" (Zuhana)',
        desc: "Zuhana photo cover, coral overlay, bold quote hook. 45 sec talking-head.",
        tags: ["Reach", "Lead"],
      },
      {
        day: "MON",
        date: "Jun 8",
        program: "ECEA",
        title: "👶 Which Age Group Is Right for You?",
        desc: "3-column grid — Infant / Toddler / Preschool. Gets comments.",
        tags: ["Engage"],
      },
      {
        day: "THU",
        date: "Jun 12",
        program: "Business Mgmt",
        title: '💼 "What Can You Do With a Business Diploma in Canada?"',
        desc: "Navy/blue gradient. Career paths: financial manager, project manager, HR, marketing analyst. 52-week program.",
        tags: ["Reach", "Lead"],
      },
      {
        day: "MON",
        date: "Jun 15",
        program: "ECEA",
        title: "🎬 Reel — POV: Your First Day as a Licensed ECEA",
        desc: "Classroom photo, navy overlay. Trending POV shot-list format. Aspirational.",
        tags: ["Reach"],
      },
      {
        day: "THU",
        date: "Jun 18",
        program: "ECEA",
        title: "🔥 Unpopular Opinion: ECEA is the Most Undervalued Career in Canada",
        desc: 'Navy background, centred fire emoji. "Agree or disagree?" drives comments.',
        tags: ["Engage", "Reach"],
      },
      {
        day: "MON",
        date: "Jun 22",
        program: "ECEA",
        title: "🎓 Reggio vs Montessori vs Play-Based — Interview Cheat Sheet",
        desc: "3-panel colour-coded philosophy guide. High saves before interviews.",
        tags: ["Save"],
      },
      {
        day: "THU",
        date: "Jun 26",
        program: "ECEA",
        title: "📅 Countdown — July 2026 Intake Closing",
        desc: 'Navy background, coral countdown timer. DM "ENROLL" CTA. Urgency close.',
        tags: ["Lead"],
      },
      {
        day: "MON",
        date: "Jun 29",
        program: "ECEA",
        title: "🤫 Things Nobody Tells You Before Becoming an ECEA",
        desc: "Tips girl photo, dark overlay, honest list. High shares and tags.",
        tags: ["Reach", "Engage"],
      },
    ],
  },
  {
    label: "🌤 July",
    title: "🌤 July 2026",
    subtitle: "July total: 9 posts · 8 ECEA · 1 AI Web Design",
    posts: [
      {
        day: "THU",
        date: "Jul 3",
        program: "ECEA",
        title: '🎬 Reel — "5 Things I Wish I Knew Before ECEA"',
        desc: 'Talking head. "Number 3 shocked me" hook. 60 sec. High saves.',
        tags: ["Reach", "Save"],
      },
      {
        day: "MON",
        date: "Jul 6",
        program: "ECEA",
        title: "💙 Inclusion in the Childcare Room — 5 Principles",
        desc: "Navy background, blue heart accents. Meaningful content builds loyal community.",
        tags: ["Engage", "Save"],
      },
      {
        day: "THU",
        date: "Jul 10",
        program: "AI Web Design",
        title: "🤖 AI is Changing Design — Are You Ready?",
        desc: "Purple gradient. Career paths: UX/UI Designer, AI Content Designer, Front-end Developer. 70-week diploma.",
        tags: ["Reach", "Lead"],
      },
      {
        day: "MON",
        date: "Jul 13",
        program: "ECEA",
        title: "☔ 10 Rainy Day Activities for ECEAs",
        desc: "Gradient header, white chip grid. Pure value. High save rate.",
        tags: ["Save"],
      },
      {
        day: "THU",
        date: "Jul 17",
        program: "ECEA",
        title: "🎬 Reel — Answering Your ECEA Questions Pt. 1",
        desc: "Show real DM screenshots. Q&A format. Builds trust and drives more DMs.",
        tags: ["Engage", "Lead"],
      },
      {
        day: "MON",
        date: "Jul 20",
        program: "ECEA",
        title: "🙋 5 Questions Parents Will Always Ask You",
        desc: "Navy background, chat bubble format. Practical value for practising ECEAs.",
        tags: ["Save", "Engage"],
      },
      {
        day: "THU",
        date: "Jul 24",
        program: "ECEA",
        title: "🌍 Newcomer Post — Your Childcare Experience Counts",
        desc: "Navy background, flag chip strip, 3-step path to Canadian ECEA certification.",
        tags: ["Lead", "Reach"],
      },
      {
        day: "MON",
        date: "Jul 27",
        program: "ECEA",
        title: "🧠 Protecting Your Mental Health as an ECEA",
        desc: "Classroom photo, dark overlay, 4 practical wellbeing tips. Community builder.",
        tags: ["Engage"],
      },
      {
        day: "THU",
        date: "Jul 31",
        program: "ECEA",
        title: "🎬 Reel — Why I Chose Childcare Over a Corporate Job",
        desc: "Values-driven opinion piece. Purpose over paycheque angle. 45 sec.",
        tags: ["Reach", "Engage"],
      },
    ],
  },
  {
    label: "🌅 August",
    title: "🌅 August 2026",
    subtitle: "August total: 9 posts · 7 ECEA · 1 French · 1 CIRA Brand",
    posts: [
      {
        day: "MON",
        date: "Aug 3",
        program: "ECEA",
        title: "🗓 Your First Week as an ECEA — What to Expect",
        desc: "Gradient header, white body, 4 numbered realistic tips. Gets tags and shares.",
        tags: ["Engage", "Reach"],
      },
      {
        day: "THU",
        date: "Aug 7",
        program: "French",
        title: "🇫🇷 Did You Know French Could Fast-Track Your Work Permit?",
        desc: "Green gradient. 22-week program, CLB 5, Francophone Mobility path. Perfect for newcomer audience.",
        tags: ["Reach", "Lead"],
      },
      {
        day: "MON",
        date: "Aug 10",
        program: "ECEA",
        title: "📖 How CIRA Students Study While Working Full Time",
        desc: 'Jannaton photo background, navy overlay. Breaks the "I do not have time" objection.',
        tags: ["Lead"],
      },
      {
        day: "THU",
        date: "Aug 14",
        program: "ECEA",
        title: "🔥 Burnout in Childcare — Let’s Talk About It",
        desc: "Photo background, honest wellbeing content. 5 signs and how to protect yourself.",
        tags: ["Engage", "Reach"],
      },
      {
        day: "MON",
        date: "Aug 17",
        program: "ECEA",
        title: "✨ Then vs Now — Career Transformation Split",
        desc: 'White background, vertical split. Warm gradient "then" / navy "now." Aspirational.',
        tags: ["Lead", "Reach"],
      },
      {
        day: "THU",
        date: "Aug 21",
        program: "CIRA Brand",
        title: "🎓 Which CIRA Program Is Right for You?",
        desc: 'Navy background, 4 colour-coded program rows. ECEA · Business · AI Web Design · French. DM us "WHICH PROGRAM" CTA.',
        tags: ["Reach", "Lead"],
      },
      {
        day: "MON",
        date: "Aug 24",
        program: "ECEA",
        title: "🎬 Reel — Answering Your ECEA Questions Pt. 2",
        desc: "Follow-up to July reel. Use comment questions from Pt. 1. Rewards engaged followers.",
        tags: ["Engage", "Lead"],
      },
      {
        day: "THU",
        date: "Aug 28",
        program: "ECEA",
        title: "🚀 September Intake — Final Enrollment Push",
        desc: "Classroom photo full bleed, navy overlay, checklist and coral CTA button.",
        tags: ["Lead"],
      },
      {
        day: "MON",
        date: "Aug 31",
        program: "ECEA",
        title: "📋 ECEA Interview Prep Checklist — 5 Things to Do",
        desc: "Gradient header, white checklist body. High saves. Strong close to the quarter.",
        tags: ["Save", "Lead"],
      },
    ],
  },
];

export default function ThreeMonthPlan() {
  const [activeMonth, setActiveMonth] = useState(0);

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
          Corrected dates · All programs · ECEA-dominant
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
            key={month.label}
            type="button"
            onClick={() => setActiveMonth(index)}
            className={`border-b-4 px-2 py-3 text-center text-xs font-black transition ${
              activeMonth === index
                ? "border-[#e8453c] text-[#0d2560]"
                : "border-transparent text-[#aaa] hover:text-[#e8453c]"
            }`}
          >
            {month.label}
          </button>
        ))}
      </div>

      <div className="bg-[#e5e9f2] p-4">
        <MonthPlan month={planMonths[activeMonth]} />
      </div>
    </section>
  );
}

function MonthPlan({ month }: { month: (typeof planMonths)[number] }) {
  return (
    <div>
      <h3 className="cira-heading mb-4 text-xl font-black text-[#0d2560]">
        {month.title}
      </h3>

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-black text-[#0d2560]">
          Post days highlighted
        </p>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div key={day} className="text-[10px] font-black text-[#777]">
              {day}
            </div>
          ))}

          {Array.from({ length: 35 }).map((_, index) => {
            const number = index + 1;
            const isPostDay = month.posts.some((post) =>
              post.date.endsWith(String(number))
            );

            return (
              <div
                key={index}
                className={`rounded-lg py-1.5 text-xs font-bold ${
                  isPostDay
                    ? "bg-gradient-to-r from-[#e8453c] to-[#f9956b] text-white"
                    : "bg-[#f4f6fb] text-[#777]"
                }`}
              >
                {number <= 31 ? number : "—"}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {month.posts.map((post) => (
          <PlanPostRow key={`${post.date}-${post.title}`} post={post} />
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-white p-3 text-center text-xs font-bold text-[#777] shadow-sm">
        {month.subtitle}
      </div>
    </div>
  );
}

function PlanPostRow({ post }: { post: PlanPost }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex">
        <div
          className={`w-1.5 shrink-0 bg-gradient-to-b ${programGradient(
            post.program
          )}`}
        />

        <div className="flex-1 p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="w-10 text-xs font-black text-[#e8453c]">
              {post.day}
            </span>

            <span className="rounded-lg bg-[#f4f6fb] px-2 py-1 text-[10px] font-black text-[#777]">
              {post.date}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-[9px] font-black ${programPill(
                post.program
              )}`}
            >
              {post.program}
            </span>
          </div>

          <h4 className="text-sm font-black leading-snug text-[#0d2560]">
            {post.title}
          </h4>

          <p className="mt-1 text-xs leading-relaxed text-[#777]">
            {post.desc}
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2 py-1 text-[9px] font-black ${tagPill(
                  tag
                )}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function programGradient(program: string) {
  if (program === "Business Mgmt") return "from-[#1a3a8a] to-[#2d5be3]";
  if (program === "AI Web Design") return "from-[#6c3fc5] to-[#9b59b6]";
  if (program === "French") return "from-[#1a7a45] to-[#27ae60]";
  if (program === "CIRA Brand") return "from-[#1a3a8a] to-[#0d2560]";
  return "from-[#e8453c] via-[#f4724a] to-[#f9956b]";
}

function programPill(program: string) {
  if (program === "Business Mgmt") return "bg-[#1a3a8a]/10 text-[#1a3a8a]";
  if (program === "AI Web Design") return "bg-[#6c3fc5]/10 text-[#6c3fc5]";
  if (program === "French") return "bg-[#1a7a45]/10 text-[#1a7a45]";
  if (program === "CIRA Brand") return "bg-[#0d2560]/10 text-[#0d2560]";
  return "bg-[#e8453c]/10 text-[#e8453c]";
}

function tagPill(tag: string) {
  if (tag === "Save") return "bg-[#f5c842]/20 text-[#8a6000]";
  if (tag === "Lead") return "bg-[#0d2560]/10 text-[#0d2560]";
  if (tag === "Reach") return "bg-[#e8453c]/10 text-[#e8453c]";
  return "bg-[#25d366]/10 text-[#128C7E]";
}