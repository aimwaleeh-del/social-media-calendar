"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { supabase } from "./lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import ThreeMonthPlan from "./components/ThreeMonthPlan";
import IdeaLibrary from "./components/IdeaLibrary";
import TaskManagement from "./components/TaskManagement";

type Status = "Draft" | "Scheduled" | "Published";
type ViewMode = "ideas" | "planning" | "calendar" | "ig-grid" | "tasks";

export type Post = {
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

type FormPost = {
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

const emptyPost = (date = "2026-05-23"): FormPost => ({
  title: "",
  post_date: date,
  platform: "Instagram",
  status: "Draft",
  program: "ECEA",
  assignee: "",
  caption: "",
  design_notes: "",
  media_url: "",
  post_type: "Static",
  post_goal: "Engage",
  image_url: "",
});

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [activeView, setActiveView] = useState<ViewMode>("ideas");

  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState<FormPost>(emptyPost());

  const platforms = [
    "All Platforms",
    "Instagram",
    "Facebook",
    "LinkedIn",
    "TikTok",
    "Twitter/X",
  ];

  const statuses = ["All Statuses", "Draft", "Scheduled", "Published"];
  const programs = ["ECEA", "Business", "AI Web Design", "French", "CIRA Brand"];
  const postTypes = ["Static", "Carousel", "Story", "Reel"];
  const postGoals = ["Save", "Engage", "Lead", "Reach"];

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchPosts();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user || null);
    setCheckingUser(false);

    if (session?.user) fetchPosts();
  }

  async function login() {
    if (!loginEmail || !loginPassword) {
      alert("Please enter your email and password.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) alert("Login failed: " + error.message);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setPosts([]);
  }

  async function fetchPosts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("post_date", { ascending: true });

    if (error) {
      alert(
        "Could not load posts from Supabase:\n\n" +
          (error.message || JSON.stringify(error))
      );
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  }

  async function uploadPostImage(
    file: File,
    currentPost: FormPost | Post,
    setPost: (post: any) => void
  ) {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      alert("Could not upload image:\n\n" + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);

    setPost({
      ...currentPost,
      image_url: data.publicUrl,
    });
  }

  async function addPost() {
    if (!newPost.title.trim()) {
      alert("Please add a post title.");
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([newPost])
      .select();

    if (error) {
      alert(
        "Could not save post to Supabase:\n\n" +
          (error.message || JSON.stringify(error))
      );
      return;
    }

    if (data) setPosts([...posts, ...data]);

    setShowForm(false);
    setNewPost(emptyPost());
  }

  async function saveChanges() {
    if (!editingPost) return;

    if (!editingPost.title.trim()) {
      alert("Please add a post title.");
      return;
    }

    const updatedPost = {
      title: editingPost.title,
      post_date: editingPost.post_date,
      platform: editingPost.platform,
      status: editingPost.status,
      program: editingPost.program,
      assignee: editingPost.assignee,
      caption: editingPost.caption,
      design_notes: editingPost.design_notes,
      media_url: editingPost.media_url,
      post_type: editingPost.post_type,
      post_goal: editingPost.post_goal,
      image_url: editingPost.image_url,
    };

    const { data, error } = await supabase
      .from("posts")
      .update(updatedPost)
      .eq("id", editingPost.id)
      .select();

    if (error) {
      alert(
        "Could not update post:\n\n" +
          (error.message || JSON.stringify(error))
      );
      return;
    }

    if (data && data[0]) {
      setPosts(posts.map((post) => (post.id === data[0].id ? data[0] : post)));
      setSelectedPost(data[0]);
    }

    setEditingPost(null);
  }

  async function deletePost(postId: string) {
    const confirmed = confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      alert(
        "Could not delete post:\n\n" +
          (error.message || JSON.stringify(error))
      );
      return;
    }

    setPosts(posts.filter((post) => post.id !== postId));
    setSelectedPost(null);
    setEditingPost(null);
  }

  async function movePostToIdeaLibrary(post: Post) {
    const confirmed = confirm(
      "Move this post back to the Idea Library? It will be removed from the Calendar."
    );

    if (!confirmed) return;

    const ideaCategory = post.image_url ? "Mood Board" : "Ideas";

    const newIdea = {
      title: post.title,
      category: ideaCategory,
      content_type: post.post_type || "Static",
      description: post.design_notes || "",
      notes: post.caption || "",
      program: post.program || "ECEA",
      status: "Idea",
      image_url: post.image_url || "",
    };

    const { error: ideaError } = await supabase
      .from("content_ideas")
      .insert([newIdea]);

    if (ideaError) {
      alert("Could not move post to Idea Library:\n\n" + ideaError.message);
      return;
    }

    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (deleteError) {
      alert(
        "The idea was created, but the calendar post could not be deleted:\n\n" +
          deleteError.message
      );
      return;
    }

    setPosts((currentPosts) =>
      currentPosts.filter((currentPost) => currentPost.id !== post.id)
    );

    setSelectedPost(null);
    setEditingPost(null);

    alert("Moved back to Idea Library.");
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthTitle = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const previousMonthTitle = new Date(year, month - 1, 1).toLocaleString(
    "default",
    {
      month: "long",
      year: "numeric",
    }
  );

  const nextMonthTitle = new Date(year, month + 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);

    return days;
  }, [year, month]);

  function makeDateString(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  function openNewPostForDate(dateString: string) {
    setNewPost(emptyPost(dateString));
    setShowForm(true);
  }

  function openNewPostForDay(day: number) {
    openNewPostForDate(makeDateString(day));
  }

  function postsForDay(day: number) {
    const dateString = makeDateString(day);

    return posts.filter((post) => {
      const sameDate = post.post_date === dateString;
      const samePlatform =
        selectedPlatform === "All Platforms" || post.platform === selectedPlatform;
      const sameStatus =
        selectedStatus === "All Statuses" || post.status === selectedStatus;

      return sameDate && samePlatform && sameStatus;
    });
  }

  async function movePostToDate(postId: string, newDate: string) {
    const oldPosts = posts;

    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, post_date: newDate } : post
      )
    );

    const { error } = await supabase
      .from("posts")
      .update({ post_date: newDate })
      .eq("id", postId);

    if (error) {
      setPosts(oldPosts);
      alert(
        "Could not move post:\n\n" + (error.message || JSON.stringify(error))
      );
    }
  }

  function handleDrop(day: number) {
    if (!draggedPostId) return;

    const newDate = makeDateString(day);
    movePostToDate(draggedPostId, newDate);
    setDraggedPostId(null);
  }

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function programKey(program: string | null) {
    if (program === "Business" || program === "Business Mgmt") return "biz";
    if (program === "AI Web Design") return "ai";
    if (program === "French") return "fr";
    if (program === "CIRA Brand") return "cira";
    return "ecea";
  }

  function programAccent(program: string | null) {
    const key = programKey(program);

    if (key === "biz") return "bg-gradient-to-b from-[#1e4caf] to-[#1e4caf]";
    if (key === "ai") return "bg-gradient-to-b from-[#f0870f] to-[#f0870f]";
    if (key === "fr") return "bg-gradient-to-b from-[#d24b66] to-[#d24b66]";
    if (key === "cira") return "bg-gradient-to-b from-[#024da8] to-[#024da8]";
    return "bg-gradient-to-b from-[#f1ca33] to-[#f1ca33]";
  }

  function programPill(program: string | null) {
    const key = programKey(program);

    if (key === "biz") return "bg-[#1e4caf]/10 text-[#1e4caf]";
    if (key === "ai") return "bg-[#f0870f]/10 text-[#f0870f]";
    if (key === "fr") return "bg-[#d24b66]/10 text-[#d24b66]";
    if (key === "cira") return "bg-[#024da8]/10 text-[#024da8]";
    return "bg-[#f1ca33]/20 text-[#8a6000]";
  }

  function statusTag(status: string) {
    if (status === "Published") return "bg-[#25d366]/10 text-[#128C7E]";
    if (status === "Scheduled") return "bg-[#0d2560]/10 text-[#0d2560]";
    return "bg-[#f5c842]/20 text-[#8a6000]";
  }

  function typeTag(type: string | null) {
    if (type === "Reel") return "bg-purple-100 text-purple-700";
    if (type === "Carousel") return "bg-blue-100 text-blue-700";
    if (type === "Story") return "bg-pink-100 text-pink-700";
    return "bg-slate-100 text-slate-700";
  }

  function goalTag(goal: string | null) {
    if (goal === "Save") return "bg-[#f5c842]/20 text-[#8a6000]";
    if (goal === "Lead") return "bg-[#0d2560]/10 text-[#0d2560]";
    if (goal === "Reach") return "bg-[#e8453c]/10 text-[#e8453c]";
    return "bg-[#25d366]/10 text-[#128C7E]";
  }

  function platformButton(platform: string, active: boolean) {
    if (!active) {
      return "bg-white text-[#777] border border-[#e8eaf2] hover:text-[#0d2560]";
    }

    if (platform === "All Platforms") {
      return "bg-[#0d2560] text-white border-[#0d2560]";
    }

    return "bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] text-white border-transparent";
  }

  function statusButton(status: string, active: boolean) {
    if (!active) {
      return "bg-white text-[#777] border border-[#e8eaf2] hover:text-[#0d2560]";
    }

    if (status === "Published") return "bg-[#128C7E] text-white border-transparent";
    if (status === "Scheduled") return "bg-[#0d2560] text-white border-transparent";
    if (status === "Draft") return "bg-[#f5c842] text-[#2a2a3d] border-transparent";

    return "bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] text-white border-transparent";
  }

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e5e9f2] text-[#2a2a3d]">
        <div className="rounded-2xl bg-white px-6 py-4 text-sm font-bold shadow">
          Checking login...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e5e9f2] p-6 text-[#2a2a3d]">
        <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
          <div className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] p-7 text-white">
            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-gradient-to-r from-[#e8453c] to-[#f9956b] opacity-20" />
            <h1 className="cira-heading relative z-10 text-3xl font-black leading-tight">
              Content Calendar
            </h1>
            <p className="relative z-10 mt-2 text-sm text-white/60">
              Sign in to manage your CIRA social media planner.
            </p>
          </div>

          <div className="space-y-4 p-7">
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              placeholder="Email"
            />

            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              placeholder="Password"
            />

            <button
              type="button"
              onClick={login}
              className="w-full rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-4 py-3 text-sm font-black text-white shadow-lg"
            >
              Log In
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e5e9f2] pb-20 text-[#2a2a3d]">
      <header className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] px-6 pb-6 pt-8 text-white">
        <div className="absolute -right-14 -top-20 h-56 w-56 rounded-full bg-gradient-to-r from-[#e8453c] to-[#f9956b] opacity-20" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
              Social Media Planner
            </p>

            <h1 className="cira-heading mt-1 text-3xl font-black leading-tight lg:text-4xl">
              Content Calendar
              <br />
              <em className="not-italic text-[#f9956b]">
                {activeView === "ideas"
                  ? "Idea Library"
                  : activeView === "planning"
                  ? "3-Month Plan"
                  : activeView === "tasks"
                  ? "Task Management"
                  : monthTitle}
              </em>
            </h1>

            <p className="mt-2 text-xs text-white/50">
              Logged in as {user.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur hover:bg-white/20"
            >
              Logout
            </button>

            <button
              type="button"
              onClick={() => {
                setNewPost(emptyPost());
                setShowForm(true);
              }}
              className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-5 py-2 text-sm font-black text-white shadow-lg"
            >
              + New Post
            </button>
          </div>
        </div>
      </header>

      <section className="border-b border-[#e8eaf2] bg-white px-4 py-3">
        <div className="flex flex-wrap gap-4 text-xs font-black text-[#444]">
          <Legend color="#f1ca33" label="ECEA" />
          <Legend color="#1e4caf" label="Business Mgmt" />
          <Legend color="#f0870f" label="AI Web Design" />
          <Legend color="#d24b66" label="French" />
          <Legend color="#024da8" label="CIRA Brand" />
        </div>
      </section>

      <div className="p-4 lg:p-6">
        <div className="mb-4 flex flex-wrap justify-end gap-2 rounded-2xl bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveView("ideas")}
            className={`rounded-xl px-4 py-2 text-xs font-black ${
              activeView === "ideas"
                ? "bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] text-white"
                : "bg-[#f4f6fb] text-[#0d2560]"
            }`}
          >
            Idea Library
          </button>

          <button
            type="button"
            onClick={() => setActiveView("planning")}
            className={`rounded-xl px-4 py-2 text-xs font-black ${
              activeView === "planning"
                ? "bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] text-white"
                : "bg-[#f4f6fb] text-[#0d2560]"
            }`}
          >
            3-Month Plan
          </button>

          <button
            type="button"
            onClick={() => setActiveView("calendar")}
            className={`rounded-xl px-4 py-2 text-xs font-black ${
              activeView === "calendar"
                ? "bg-[#0d2560] text-white"
                : "bg-[#f4f6fb] text-[#0d2560]"
            }`}
          >
            Calendar
          </button>

          <button
            type="button"
            onClick={() => setActiveView("ig-grid")}
            className={`rounded-xl px-4 py-2 text-xs font-black ${
              activeView === "ig-grid"
                ? "bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] text-white"
                : "bg-[#f4f6fb] text-[#0d2560]"
            }`}
          >
            IG Grid Preview
          </button>

          <button
            type="button"
            onClick={() => setActiveView("tasks")}
            className={`rounded-xl px-4 py-2 text-xs font-black ${
              activeView === "tasks"
                ? "bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] text-white"
                : "bg-[#f4f6fb] text-[#0d2560]"
            }`}
          >
            Task Management
          </button>
        </div>

        {activeView === "ideas" && (
          <IdeaLibrary
            onPostCreated={(post) => {
              setPosts((currentPosts) => [post, ...currentPosts]);
            }}
          />
        )}

        {activeView === "planning" && (
          <ThreeMonthPlan
            posts={posts}
            draggedPostId={draggedPostId}
            setDraggedPostId={setDraggedPostId}
            onPostClick={setSelectedPost}
            onMovePostToDate={movePostToDate}
            onAddPostForDate={openNewPostForDate}
          />
        )}

        {activeView === "calendar" && (
          <>
            <div className="rounded-2xl bg-white p-4 text-sm text-[#777] shadow-sm">
              <span className="font-black text-[#e8453c]">Tip:</span> Click a
              date or the + button to add a post. Drag a post card to reschedule it.
            </div>

            <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#777]">
                Platform
              </p>

              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <button
                    type="button"
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`rounded-2xl px-4 py-2 text-xs font-black transition ${platformButton(
                      platform,
                      selectedPlatform === platform
                    )}`}
                  >
                    {platform}
                  </button>
                ))}
              </div>

              <p className="mb-3 mt-5 text-[10px] font-black uppercase tracking-[0.12em] text-[#777]">
                Status
              </p>

              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    type="button"
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`rounded-2xl px-4 py-2 text-xs font-black transition ${statusButton(
                      status,
                      selectedStatus === status
                    )}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </section>

            <section className="relative z-20 mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <button
                  type="button"
                  onClick={previousMonth}
                  className="relative z-30 cursor-pointer rounded-xl bg-[#f4f6fb] px-4 py-2 text-xs font-black text-[#0d2560] transition hover:bg-[#fff8f5] hover:text-[#e8453c]"
                >
                  ← Previous
                </button>

                <div className="relative z-30 flex flex-1 flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="cursor-pointer rounded-xl bg-[#f4f6fb] px-4 py-2 text-sm font-bold text-[#7f8898] transition hover:bg-[#fff8f5] hover:text-[#e8453c]"
                  >
                    {previousMonthTitle}
                  </button>

                  <button
                    type="button"
                    className="cursor-default rounded-xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-5 py-2 text-sm font-black text-white shadow-sm"
                  >
                    {monthTitle}
                  </button>

                  <button
                    type="button"
                    onClick={nextMonth}
                    className="cursor-pointer rounded-xl bg-[#f4f6fb] px-4 py-2 text-sm font-bold text-[#7f8898] transition hover:bg-[#fff8f5] hover:text-[#e8453c]"
                  >
                    {nextMonthTitle}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={nextMonth}
                  className="relative z-30 cursor-pointer rounded-xl bg-[#f4f6fb] px-4 py-2 text-xs font-black text-[#0d2560] transition hover:bg-[#fff8f5] hover:text-[#e8453c]"
                >
                  Next →
                </button>
              </div>
            </section>

            {loading && (
              <p className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-[#777] shadow-sm">
                Loading posts from Supabase...
              </p>
            )}

            <div className="mt-5 grid grid-cols-7 gap-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="rounded-xl bg-white py-2 text-[10px] font-black uppercase tracking-wide text-[#777] shadow-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  onDragOver={(event) => {
                    if (day) event.preventDefault();
                  }}
                  onDrop={() => {
                    if (day) handleDrop(day);
                  }}
                  className={`min-h-44 rounded-2xl border p-2 shadow-sm transition ${
                    day && draggedPostId
                      ? "border-[#e8453c] bg-[#fff8f5]"
                      : "border-[#e8eaf2] bg-white"
                  }`}
                >
                  {day && (
                    <>
                      <div className="mb-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => openNewPostForDay(day)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4f6fb] text-xs font-black text-[#0d2560] transition hover:bg-[#e8453c] hover:text-white"
                        >
                          {day}
                        </button>

                        <button
                          type="button"
                          onClick={() => openNewPostForDay(day)}
                          className="rounded-lg bg-[#fff8f5] px-2 py-1 text-[9px] font-black text-[#e8453c] transition hover:bg-[#e8453c] hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <div className="space-y-2">
                        {postsForDay(day).map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            draggedPostId={draggedPostId}
                            setDraggedPostId={setDraggedPostId}
                            setSelectedPost={setSelectedPost}
                            programAccent={programAccent}
                            programPill={programPill}
                            statusTag={statusTag}
                            typeTag={typeTag}
                            goalTag={goalTag}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeView === "ig-grid" && (
          <IGGridPreview
            posts={posts}
            setSelectedPost={setSelectedPost}
            typeTag={typeTag}
            goalTag={goalTag}
          />
        )}

        {activeView === "tasks" && <TaskManagement />}
      </div>

      {showForm && (
        <PostFormModal
          title="Create New Post"
          programs={programs}
          postTypes={postTypes}
          postGoals={postGoals}
          post={newPost}
          setPost={(post) => setNewPost(post)}
          onCancel={() => setShowForm(false)}
          onSave={addPost}
          onUploadImage={uploadPostImage}
        />
      )}

      {selectedPost && !editingPost && (
        <PostDetailsModal
          post={selectedPost}
          programAccent={programAccent}
          programPill={programPill}
          statusTag={statusTag}
          typeTag={typeTag}
          goalTag={goalTag}
          onClose={() => setSelectedPost(null)}
          onEdit={() => setEditingPost(selectedPost)}
          onDelete={() => deletePost(selectedPost.id)}
          onMoveToIdeas={() => movePostToIdeaLibrary(selectedPost)}
        />
      )}

      {editingPost && (
        <PostFormModal
          title="Edit Post"
          programs={programs}
          postTypes={postTypes}
          postGoals={postGoals}
          post={editingPost}
          setPost={(post) => setEditingPost(post)}
          onCancel={() => setEditingPost(null)}
          onSave={saveChanges}
          onUploadImage={uploadPostImage}
        />
      )}
    </main>
  );
}

function PostCard({
  post,
  draggedPostId,
  setDraggedPostId,
  setSelectedPost,
  programAccent,
  programPill,
  statusTag,
  typeTag,
  goalTag,
}: {
  post: Post;
  draggedPostId: string | null;
  setDraggedPostId: (id: string | null) => void;
  setSelectedPost: (post: Post) => void;
  programAccent: (program: string | null) => string;
  programPill: (program: string | null) => string;
  statusTag: (status: string) => string;
  typeTag: (type: string | null) => string;
  goalTag: (goal: string | null) => string;
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={() => setDraggedPostId(post.id)}
      onDragEnd={() => setDraggedPostId(null)}
      onClick={() => {
        if (!draggedPostId) setSelectedPost(post);
      }}
      className={`w-full cursor-move overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        draggedPostId === post.id ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${programAccent(post.program)}`} />

        <div className="min-w-0 flex-1 p-3">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full px-2 py-1 text-[9px] font-black ${programPill(
                post.program
              )}`}
            >
              {post.program || "Program"}
            </span>

            <span className="rounded-full bg-[#0d2560]/10 px-2 py-1 text-[9px] font-black text-[#0d2560]">
              {post.platform}
            </span>
          </div>

          <div className="truncate text-xs font-black leading-snug text-[#0d2560]">
            {post.title}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            <span
              className={`rounded-full px-2 py-1 text-[9px] font-black ${statusTag(
                post.status
              )}`}
            >
              {post.status}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-[9px] font-black ${typeTag(
                post.post_type
              )}`}
            >
              {post.post_type || "Static"}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-[9px] font-black ${goalTag(
                post.post_goal
              )}`}
            >
              {post.post_goal || "Engage"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function IGGridPreview({
  posts,
  setSelectedPost,
  typeTag,
  goalTag,
}: {
  posts: Post[];
  setSelectedPost: (post: Post) => void;
  typeTag: (type: string | null) => string;
  goalTag: (goal: string | null) => string;
}) {
  const instagramPosts = posts
    .filter((post) => post.platform === "Instagram")
    .sort((a, b) => b.post_date.localeCompare(a.post_date));

  const emptySlots = Math.max(0, 9 - instagramPosts.length);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8453c]">
          Gallery
        </p>

        <h2 className="cira-heading text-2xl font-black text-[#0d2560]">
          IG Grid Preview
        </h2>

        <p className="text-xs font-bold text-[#777]">
          Upload 1080 × 1350 px images for the best 4:5 Instagram preview.
        </p>
      </div>

      <div className="grid max-w-[900px] grid-cols-3 gap-1 bg-white">
        {instagramPosts.map((post) => (
          <button
            type="button"
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group relative aspect-[4/5] overflow-hidden bg-[#d8d8d8] text-left"
          >
            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.title}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-[#0d2560] via-[#1a3a8a] to-[#e8453c] p-4 text-white">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wide text-white/70">
                    {post.program || "CIRA"}
                  </p>

                  <h3 className="mt-2 text-sm font-black leading-tight">
                    {post.title}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-black ${typeTag(
                      post.post_type
                    )}`}
                  >
                    {post.post_type || "Static"}
                  </span>

                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-black ${goalTag(
                      post.post_goal
                    )}`}
                  >
                    {post.post_goal || "Engage"}
                  </span>
                </div>
              </div>
            )}
          </button>
        ))}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-[4/5] bg-[#d8d8d8]" />
        ))}
      </div>
    </section>
  );
}

function PostDetailsModal({
  post,
  programAccent,
  programPill,
  statusTag,
  typeTag,
  goalTag,
  onClose,
  onEdit,
  onDelete,
  onMoveToIdeas,
}: {
  post: Post;
  programAccent: (program: string | null) => string;
  programPill: (program: string | null) => string;
  statusTag: (status: string) => string;
  typeTag: (type: string | null) => string;
  goalTag: (goal: string | null) => string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveToIdeas: () => void;
}) {
  const [imageBroken, setImageBroken] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2560]/60 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex">
          <div className={`w-2 shrink-0 ${programAccent(post.program)}`} />

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black ${programPill(
                    post.program
                  )}`}
                >
                  {post.program || "Program"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black ${statusTag(
                    post.status
                  )}`}
                >
                  {post.status}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black ${typeTag(
                    post.post_type
                  )}`}
                >
                  {post.post_type || "Static"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black ${goalTag(
                    post.post_goal
                  )}`}
                >
                  {post.post_goal || "Engage"}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f6fb] text-xl font-black text-[#0d2560] hover:bg-[#e8453c] hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onMoveToIdeas}
                className="rounded-xl bg-[#0d2560] px-3 py-2 text-xs font-black text-white hover:bg-[#e8453c]"
              >
                Move to Idea Library
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="rounded-xl bg-[#fff8f5] px-3 py-2 text-xs font-black text-[#e8453c] hover:bg-[#e8453c] hover:text-white"
              >
                Edit / Replace Photo
              </button>

              {post.image_url && (
                <a
                  href={post.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#f4f6fb] px-3 py-2 text-xs font-black text-[#0d2560] underline"
                >
                  Open Image URL
                </a>
              )}
            </div>

            {post.image_url && !imageBroken ? (
              <img
                src={post.image_url}
                alt={post.title}
                className="mb-4 aspect-[4/5] w-full rounded-2xl object-cover"
                onError={() => setImageBroken(true)}
              />
            ) : post.image_url && imageBroken ? (
              <div className="mb-4 rounded-2xl border border-dashed border-[#e8453c]/40 bg-[#fff8f5] p-5 text-sm font-bold text-[#777]">
                Image URL exists, but the image cannot be displayed. Click{" "}
                <span className="text-[#e8453c]">Edit / Replace Photo</span> to
                upload a JPG, PNG, or WEBP image again.
              </div>
            ) : (
              <div className="mb-4 rounded-2xl bg-[#f4f6fb] p-5 text-sm font-bold text-[#777]">
                No image uploaded yet. Click{" "}
                <span className="text-[#e8453c]">Edit / Replace Photo</span> to
                add one.
              </div>
            )}

            <h2 className="cira-heading text-2xl font-black leading-tight text-[#0d2560]">
              {post.title}
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <InfoRow label="Date" value={post.post_date} />
              <InfoRow label="Platform" value={post.platform} />
              <InfoRow label="Post Type" value={post.post_type || "Static"} />
              <InfoRow label="Post Goal" value={post.post_goal || "Engage"} />
              <InfoRow label="Assignee" value={post.assignee || "None"} />

              <TextBox
                label="Caption"
                value={post.caption || "No caption added."}
              />

              <TextBox
                label="Design Notes"
                value={post.design_notes || "No design notes added."}
              />

              <div>
                <strong className="text-[#0d2560]">Media / Canva Link:</strong>

                {post.media_url ? (
                  <a
                    href={post.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block rounded-2xl bg-[#fff8f5] p-3 text-sm font-black text-[#e8453c] underline"
                  >
                    Open media link
                  </a>
                ) : (
                  <p className="mt-1 rounded-2xl bg-[#f4f6fb] p-3 text-[#777]">
                    No media link added.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-black text-white"
                >
                  Delete
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl bg-[#f4f6fb] px-4 py-2 text-sm font-black text-[#0d2560]"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-4 py-2 text-sm font-black text-white"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostFormModal({
  title,
  programs,
  postTypes,
  postGoals,
  post,
  setPost,
  onCancel,
  onSave,
  onUploadImage,
}: {
  title: string;
  programs: string[];
  postTypes: string[];
  postGoals: string[];
  post: FormPost | Post;
  setPost: (post: any) => void;
  onCancel: () => void;
  onSave: () => void;
  onUploadImage: (
    file: File,
    currentPost: FormPost | Post,
    setPost: (post: any) => void
  ) => Promise<void>;
}) {
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    await onUploadImage(file, post, setPost);
    setUploadingImage(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2560]/60 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] p-6 text-white">
          <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-gradient-to-r from-[#e8453c] to-[#f9956b] opacity-20" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <h2 className="cira-heading text-2xl font-black">{title}</h2>

            <button
              type="button"
              onClick={onCancel}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl font-black text-white hover:bg-white/25"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <input
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
            placeholder="Post title"
          />

          <input
            type="date"
            value={post.post_date}
            onChange={(e) => setPost({ ...post, post_date: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
          />

          <select
            value={post.platform}
            onChange={(e) => setPost({ ...post, platform: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
          >
            <option>Instagram</option>
            <option>Facebook</option>
            <option>LinkedIn</option>
            <option>TikTok</option>
            <option>Twitter/X</option>
          </select>

          <select
            value={post.post_type || "Static"}
            onChange={(e) => setPost({ ...post, post_type: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
          >
            {postTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={post.post_goal || "Engage"}
            onChange={(e) => setPost({ ...post, post_goal: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
          >
            {postGoals.map((goal) => (
              <option key={goal}>{goal}</option>
            ))}
          </select>

          <select
            value={post.program || ""}
            onChange={(e) => setPost({ ...post, program: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
          >
            {programs.map((program) => (
              <option key={program}>{program}</option>
            ))}
          </select>

          <select
            value={post.status}
            onChange={(e) =>
              setPost({ ...post, status: e.target.value as Status })
            }
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
          >
            <option>Draft</option>
            <option>Scheduled</option>
            <option>Published</option>
          </select>

          <input
            value={post.assignee || ""}
            onChange={(e) => setPost({ ...post, assignee: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
            placeholder="Assignee"
          />

          <div className="rounded-2xl border border-dashed border-[#e8453c]/40 bg-[#fff8f5] p-4">
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#e8453c]">
              Upload / Replace Photo for IG Grid
            </p>

            <p className="mb-3 text-xs font-bold text-[#777]">
              Recommended Canva size: 1080 × 1350 px.
            </p>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="w-full text-sm font-semibold text-[#777]"
            />

            {uploadingImage && (
              <p className="mt-2 text-xs font-bold text-[#777]">
                Uploading image...
              </p>
            )}

            {post.image_url ? (
              <div className="mt-3">
                <img
                  src={post.image_url}
                  alt="Post preview"
                  className="aspect-[4/5] w-full rounded-2xl border border-[#e8eaf2] object-cover"
                />

                <a
                  href={post.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-xs font-black text-[#e8453c] underline"
                >
                  Open uploaded image
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const confirmed = confirm(
                      "Remove this image from the post? Remember to click Save after removing."
                    );

                    if (confirmed) setPost({ ...post, image_url: "" });
                  }}
                  className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div className="mt-3 flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-[#d8d8d8] text-center text-sm font-bold text-[#777]">
                No image uploaded yet
                <br />
                1080 × 1350 preview
              </div>
            )}
          </div>

          <textarea
            value={post.caption || ""}
            onChange={(e) => setPost({ ...post, caption: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
            placeholder="Caption"
            rows={4}
          />

          <textarea
            value={post.design_notes || ""}
            onChange={(e) => setPost({ ...post, design_notes: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
            placeholder="Design notes"
            rows={3}
          />

          <input
            value={post.media_url || ""}
            onChange={(e) => setPost({ ...post, media_url: e.target.value })}
            className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
            placeholder="Media or Canva link"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl bg-[#f4f6fb] px-4 py-2 text-sm font-black text-[#0d2560]"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onSave}
              className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-4 py-2 text-sm font-black text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="rounded-2xl bg-[#f4f6fb] p-3 text-[#777]">
      <strong className="text-[#0d2560]">{label}:</strong> {value}
    </p>
  );
}

function TextBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong className="text-[#0d2560]">{label}:</strong>
      <p className="mt-1 whitespace-pre-wrap rounded-2xl bg-[#f4f6fb] p-3 text-[#2a2a3d]">
        {value}
      </p>
    </div>
  );
}