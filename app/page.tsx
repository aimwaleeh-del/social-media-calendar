"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

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
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [newPost, setNewPost] = useState({
    title: "",
    post_date: "2026-05-23",
    platform: "Instagram",
    status: "Draft" as "Draft" | "Scheduled" | "Published",
    program: "ECEA",
    assignee: "",
    caption: "",
    design_notes: "",
    media_url: "",
  });

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

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        fetchPosts();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setUser(session?.user || null);
    setCheckingUser(false);

    if (session?.user) {
      fetchPosts();
    }
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

    if (error) {
      alert("Login failed: " + error.message);
    }
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

    if (data) {
      setPosts([...posts, ...data]);
    }

    setShowForm(false);

    setNewPost({
      title: "",
      post_date: "2026-05-23",
      platform: "Instagram",
      status: "Draft",
      program: "ECEA",
      assignee: "",
      caption: "",
      design_notes: "",
      media_url: "",
    });
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthTitle = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = useMemo(() => {
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

    return days;
  }, [year, month]);

  function postsForDay(day: number) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return posts.filter((post) => {
      const sameDate = post.post_date === dateString;

      const samePlatform =
        selectedPlatform === "All Platforms" ||
        post.platform === selectedPlatform;

      const sameStatus =
        selectedStatus === "All Statuses" || post.status === selectedStatus;

      return sameDate && samePlatform && sameStatus;
    });
  }

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function statusStyle(status: string) {
    if (status === "Published") return "bg-green-500";
    if (status === "Scheduled") return "bg-blue-500";
    return "bg-gray-400";
  }

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-black">
        <p>Checking login...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 text-black">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-bold">Content Calendar Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your team content calendar.
          </p>

          <div className="mt-6 space-y-4">
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Email"
            />

            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Password"
            />

            <button
              onClick={login}
              className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white"
            >
              Log In
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-6 text-black">
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Content Calendar</h1>
            <p className="text-sm text-gray-600">Logged in as {user.email}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={logout}
              className="rounded-lg bg-gray-100 px-4 py-2 font-semibold"
            >
              Logout
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-black px-4 py-2 font-semibold text-white"
            >
              + New Post
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-gray-600">Platform</p>

        <div className="flex flex-wrap gap-3">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                selectedPlatform === platform
                  ? "bg-black text-white"
                  : "bg-gray-100 text-black"
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-gray-600">Status</p>

        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-black"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={previousMonth}
          className="rounded-lg bg-gray-100 px-4 py-2 font-semibold"
        >
          Previous
        </button>

        <h2 className="text-xl font-bold">{monthTitle}</h2>

        <button
          onClick={nextMonth}
          className="rounded-lg bg-gray-100 px-4 py-2 font-semibold"
        >
          Next
        </button>
      </div>

      {loading && (
        <p className="mt-6 rounded-lg bg-gray-100 p-3 text-sm">
          Loading posts from Supabase...
        </p>
      )}

      <div className="mt-8 grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className="min-h-36 rounded-lg border border-gray-200 p-2"
          >
            {day && (
              <>
                <div className="mb-2 text-sm font-semibold text-gray-600">
                  {day}
                </div>

                <div className="space-y-2">
                  {postsForDay(day).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="w-full rounded-md bg-blue-600 p-2 text-left text-xs text-white"
                    >
                      <div className="truncate font-semibold">
                        {post.platform} · {post.title}
                      </div>

                      <div className="mt-1 truncate text-[11px]">
                        {post.program}
                      </div>

                      <span
                        className={`mt-2 inline-block rounded px-2 py-1 text-[10px] ${statusStyle(
                          post.status
                        )}`}
                      >
                        {post.status}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4 text-sm">
        <span className="font-semibold">Legend:</span>
        <span>Draft</span>
        <span>Scheduled</span>
        <span>Published</span>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Create New Post</h2>

            <div className="space-y-4">
              <input
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Post title"
              />

              <input
                type="date"
                value={newPost.post_date}
                onChange={(e) =>
                  setNewPost({ ...newPost, post_date: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
              />

              <select
                value={newPost.platform}
                onChange={(e) =>
                  setNewPost({ ...newPost, platform: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>LinkedIn</option>
                <option>TikTok</option>
                <option>Twitter/X</option>
              </select>

              <select
                value={newPost.program}
                onChange={(e) =>
                  setNewPost({ ...newPost, program: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                {programs.map((program) => (
                  <option key={program}>{program}</option>
                ))}
              </select>

              <select
                value={newPost.status}
                onChange={(e) =>
                  setNewPost({
                    ...newPost,
                    status: e.target.value as
                      | "Draft"
                      | "Scheduled"
                      | "Published",
                  })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option>Draft</option>
                <option>Scheduled</option>
                <option>Published</option>
              </select>

              <input
                value={newPost.assignee}
                onChange={(e) =>
                  setNewPost({ ...newPost, assignee: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Assignee"
              />

              <textarea
                value={newPost.caption}
                onChange={(e) =>
                  setNewPost({ ...newPost, caption: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Caption"
                rows={4}
              />

              <textarea
                value={newPost.design_notes}
                onChange={(e) =>
                  setNewPost({ ...newPost, design_notes: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Design notes"
                rows={3}
              />

              <input
                value={newPost.media_url}
                onChange={(e) =>
                  setNewPost({ ...newPost, media_url: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Media or Canva link"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={addPost}
                className="rounded-lg bg-black px-4 py-2 font-semibold text-white"
              >
                Save Post
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPost && !editingPost && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">{selectedPost.title}</h2>

            <div className="mt-4 space-y-3 text-sm">
              <p>
                <strong>Date:</strong> {selectedPost.post_date}
              </p>
              <p>
                <strong>Platform:</strong> {selectedPost.platform}
              </p>
              <p>
                <strong>Program:</strong> {selectedPost.program}
              </p>
              <p>
                <strong>Status:</strong> {selectedPost.status}
              </p>
              <p>
                <strong>Assignee:</strong> {selectedPost.assignee || "None"}
              </p>

              <div>
                <strong>Caption:</strong>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-100 p-3">
                  {selectedPost.caption || "No caption added."}
                </p>
              </div>

              <div>
                <strong>Design Notes:</strong>
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-gray-100 p-3">
                  {selectedPost.design_notes || "No design notes added."}
                </p>
              </div>

              <div>
                <strong>Media / Canva Link:</strong>
                {selectedPost.media_url ? (
                  <a
                    href={selectedPost.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block rounded-lg bg-gray-100 p-3 text-blue-600 underline"
                  >
                    Open media link
                  </a>
                ) : (
                  <p className="mt-1 rounded-lg bg-gray-100 p-3">
                    No media link added.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-3">
              <button
                onClick={() => deletePost(selectedPost.id)}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
              >
                Delete
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-lg bg-gray-100 px-4 py-2 font-semibold"
                >
                  Close
                </button>

                <button
                  onClick={() => setEditingPost(selectedPost)}
                  className="rounded-lg bg-black px-4 py-2 font-semibold text-white"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPost && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Edit Post</h2>

            <div className="space-y-4">
              <input
                value={editingPost.title}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, title: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Post title"
              />

              <input
                type="date"
                value={editingPost.post_date}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, post_date: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
              />

              <select
                value={editingPost.platform}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, platform: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>LinkedIn</option>
                <option>TikTok</option>
                <option>Twitter/X</option>
              </select>

              <select
                value={editingPost.program || ""}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, program: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                {programs.map((program) => (
                  <option key={program}>{program}</option>
                ))}
              </select>

              <select
                value={editingPost.status}
                onChange={(e) =>
                  setEditingPost({
                    ...editingPost,
                    status: e.target.value as
                      | "Draft"
                      | "Scheduled"
                      | "Published",
                  })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                <option>Draft</option>
                <option>Scheduled</option>
                <option>Published</option>
              </select>

              <input
                value={editingPost.assignee || ""}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, assignee: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Assignee"
              />

              <textarea
                value={editingPost.caption || ""}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, caption: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Caption"
                rows={4}
              />

              <textarea
                value={editingPost.design_notes || ""}
                onChange={(e) =>
                  setEditingPost({
                    ...editingPost,
                    design_notes: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Design notes"
                rows={3}
              />

              <input
                value={editingPost.media_url || ""}
                onChange={(e) =>
                  setEditingPost({
                    ...editingPost,
                    media_url: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 p-2"
                placeholder="Media or Canva link"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingPost(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={saveChanges}
                className="rounded-lg bg-black px-4 py-2 font-semibold text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}