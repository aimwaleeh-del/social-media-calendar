"use client";

import { useEffect, useState, type ChangeEvent, type DragEvent } from "react";
import { supabase } from "../lib/supabaseClient";

type IdeaCategory = "Ideas" | "Mood Board";

type ContentIdea = {
  id: string;
  title: string;
  category: string;
  content_type: string | null;
  idea_category: string | null;
  description: string | null;
  notes: string | null;
  program: string | null;
  status: string | null;
  image_url: string | null;
  created_at: string;
};

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

type IdeaLibraryProps = {
  onPostCreated?: (post: Post) => void;
};

type IdeaForm = {
  title: string;
  category: IdeaCategory;
  content_type: string;
  idea_category: string;
  description: string;
  notes: string;
  program: string;
  status: string;
  image_url: string;
};

const categories: IdeaCategory[] = ["Ideas", "Mood Board"];

const ideaCategories = [
  "Educational",
  "Objection Handling",
  "Social Proof",
  "Enrollment CTA",
  "Engagement",
];

const blankIdea: IdeaForm = {
  title: "",
  category: "Ideas",
  content_type: "Carousel",
  idea_category: "Educational",
  description: "",
  notes: "",
  program: "ECEA",
  status: "Idea",
  image_url: "",
};

export default function IdeaLibrary({ onPostCreated }: IdeaLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<IdeaCategory>("Ideas");
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);
  const [form, setForm] = useState<IdeaForm>(blankIdea);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);

  const [schedulingIdea, setSchedulingIdea] = useState<ContentIdea | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  async function fetchIdeas() {
    setLoading(true);

    const { data, error } = await supabase
      .from("content_ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Could not load ideas:\n\n" + error.message);
    } else {
      setIdeas(data || []);
    }

    setLoading(false);
  }

  function openNewIdea(category: IdeaCategory = activeCategory) {
    setEditingIdea(null);
    setForm({
      ...blankIdea,
      category,
      content_type: category === "Mood Board" ? "Design" : "Carousel",
      program: category === "Mood Board" ? "CIRA Brand" : "ECEA",
    });
    setShowForm(true);
  }

  function openEditIdea(idea: ContentIdea) {
    setEditingIdea(idea);
    setForm({
      title: idea.title || "",
      category: idea.category === "Mood Board" ? "Mood Board" : "Ideas",
      content_type: idea.content_type || "Carousel",
      idea_category: idea.idea_category || "Educational",
      description: idea.description || "",
      notes: idea.notes || "",
      program: idea.program || "ECEA",
      status: idea.status || "Idea",
      image_url: idea.image_url || "",
    });
    setShowForm(true);
  }

  async function uploadSingleImage(file: File) {
    if (!file.type.startsWith("image/")) {
      alert(`${file.name} is not an image file.`);
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `ideas/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      alert("Could not upload image:\n\n" + uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function uploadImageToForm(file: File) {
    setUploadingImage(true);

    const publicUrl = await uploadSingleImage(file);

    if (publicUrl) {
      setForm((currentForm) => ({
        ...currentForm,
        image_url: publicUrl,
      }));
    }

    setUploadingImage(false);
  }

  async function uploadMoodBoardFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      alert("Please drop image files only.");
      return;
    }

    setUploadingImage(true);

    const newItems: ContentIdea[] = [];

    for (const file of imageFiles) {
      const publicUrl = await uploadSingleImage(file);

      if (!publicUrl) continue;

      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

      const { data, error } = await supabase
        .from("content_ideas")
        .insert([
          {
            title: cleanTitle,
            category: "Mood Board",
            content_type: "Design",
            idea_category: "Educational",
            description: "",
            notes: "",
            program: "CIRA Brand",
            status: "Idea",
            image_url: publicUrl,
          },
        ])
        .select();

      if (error) {
        alert("Could not save mood board image:\n\n" + error.message);
      } else if (data && data[0]) {
        newItems.push(data[0]);
      }
    }

    if (newItems.length > 0) {
      setIdeas((currentIdeas) => [...newItems, ...currentIdeas]);
    }

    setUploadingImage(false);
  }

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDraggingOver(false);

    if (activeCategory !== "Mood Board") return;

    await uploadMoodBoardFiles(event.dataTransfer.files);
  }

  async function handleMoodBoardInput(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    await uploadMoodBoardFiles(files);
    event.target.value = "";
  }

  async function handleFormImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadImageToForm(file);
  }

  async function saveIdea() {
    if (!form.title.trim()) {
      alert("Please add a title.");
      return;
    }

    if (editingIdea) {
      const { data, error } = await supabase
        .from("content_ideas")
        .update(form)
        .eq("id", editingIdea.id)
        .select();

      if (error) {
        alert("Could not update item:\n\n" + error.message);
        return;
      }

      if (data && data[0]) {
        setIdeas((currentIdeas) =>
          currentIdeas.map((idea) => (idea.id === data[0].id ? data[0] : idea))
        );
      }
    } else {
      const { data, error } = await supabase
        .from("content_ideas")
        .insert([form])
        .select();

      if (error) {
        alert("Could not save item:\n\n" + error.message);
        return;
      }

      if (data) {
        setIdeas((currentIdeas) => [...data, ...currentIdeas]);
      }
    }

    setShowForm(false);
    setEditingIdea(null);
    setForm(blankIdea);
  }

  async function deleteIdea(id: string) {
    const confirmed = confirm("Delete this item?");
    if (!confirmed) return;

    const { error } = await supabase.from("content_ideas").delete().eq("id", id);

    if (error) {
      alert("Could not delete item:\n\n" + error.message);
      return;
    }

    setIdeas((currentIdeas) => currentIdeas.filter((idea) => idea.id !== id));
  }

  function openSchedulePopup(idea: ContentIdea) {
    setSchedulingIdea(idea);
    setScheduleDate("");
  }

  async function moveIdeaToCalendar() {
    if (!schedulingIdea) return;

    if (!scheduleDate) {
      alert("Please choose a calendar date.");
      return;
    }

    setScheduling(true);

    const postType =
      schedulingIdea.content_type === "Design" ||
      schedulingIdea.content_type === "Reference" ||
      schedulingIdea.content_type === "Brand Inspiration"
        ? "Static"
        : schedulingIdea.content_type || "Static";

    const newPost = {
      title: schedulingIdea.title,
      post_date: scheduleDate,
      platform: "Instagram",
      status: "Draft",
      program: schedulingIdea.program || "ECEA",
      assignee: "",
      caption: schedulingIdea.notes || schedulingIdea.description || "",
      design_notes: schedulingIdea.description || "",
      media_url: "",
      post_type: postType,
      post_goal:
        schedulingIdea.idea_category === "Enrollment CTA"
          ? "Lead"
          : schedulingIdea.idea_category === "Engagement"
          ? "Engage"
          : "Save",
      image_url: schedulingIdea.image_url || "",
    };

    const { data, error } = await supabase.from("posts").insert([newPost]).select();

    if (error) {
      setScheduling(false);
      alert("Could not move item to calendar:\n\n" + error.message);
      return;
    }

    if (data && data[0]) {
      if (onPostCreated) {
        onPostCreated(data[0]);
      }

      await supabase
        .from("content_ideas")
        .update({ status: "Used" })
        .eq("id", schedulingIdea.id);

      setIdeas((currentIdeas) =>
        currentIdeas.map((idea) =>
          idea.id === schedulingIdea.id ? { ...idea, status: "Used" } : idea
        )
      );
    }

    setScheduling(false);
    setSchedulingIdea(null);
    setScheduleDate("");

    alert("Item moved to Calendar.");
  }

  const filteredIdeas = ideas.filter((idea) => idea.category === activeCategory);

  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] p-7 text-white">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-r from-[#e8453c] to-[#f9956b] opacity-20" />

        <p className="relative z-10 text-xs font-black uppercase tracking-[0.18em] text-white/40">
          Content Strategy
        </p>

        <h2 className="cira-heading relative z-10 mt-1 text-3xl font-black leading-tight">
          Idea Library
          <br />
          <em className="not-italic text-[#f9956b]">
            Save ideas before scheduling
          </em>
        </h2>

        <p className="relative z-10 mt-2 text-xs text-white/55">
          Add content ideas, organize by strategy category, drag images into your
          mood board, then move items to the calendar when ready.
        </p>
      </div>

      <div className="grid grid-cols-2 border-b-2 border-[#e8eaf2] bg-white">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`border-b-4 px-3 py-4 text-center text-xs font-black uppercase tracking-wide transition ${
              activeCategory === category
                ? "border-[#e8453c] text-[#0d2560]"
                : "border-transparent text-[#aaa] hover:text-[#e8453c]"
            }`}
          >
            {category === "Ideas" ? "💡 Ideas" : "🎨 Mood Board"}
          </button>
        ))}
      </div>

      <div className="bg-[#e5e9f2] p-5">
        <div className="rounded-[28px] bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8453c]">
                {activeCategory}
              </p>

              <h3 className="cira-heading text-2xl font-black text-[#0d2560]">
                {activeCategory === "Ideas"
                  ? "Fresh Content Ideas"
                  : "Design Mood Board"}
              </h3>

              <p className="mt-1 text-xs font-bold text-[#777]">
                {filteredIdeas.length} item
                {filteredIdeas.length === 1 ? "" : "s"} saved
              </p>
            </div>

            <button
              type="button"
              onClick={() => openNewIdea(activeCategory)}
              className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-5 py-3 text-sm font-black text-white shadow-sm"
            >
              {activeCategory === "Ideas" ? "+ Add Idea" : "+ Add Note"}
            </button>
          </div>

          {activeCategory === "Mood Board" && (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDraggingOver(true);
              }}
              onDragLeave={() => setDraggingOver(false)}
              onDrop={handleDrop}
              className={`mb-5 rounded-[28px] border-2 border-dashed p-8 text-center transition ${
                draggingOver
                  ? "border-[#e8453c] bg-[#fff8f5]"
                  : "border-[#e8eaf2] bg-[#f4f6fb]"
              }`}
            >
              <p className="text-base font-black text-[#0d2560]">
                Drag and drop mood board images here
              </p>

              <p className="mt-2 text-sm font-bold text-[#777]">
                You can drop one image or multiple images at once.
              </p>

              <label className="mt-4 inline-block cursor-pointer rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#e8453c] shadow-sm hover:bg-[#fff8f5]">
                Choose Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMoodBoardInput}
                  className="hidden"
                />
              </label>

              {uploadingImage && (
                <p className="mt-3 text-xs font-bold text-[#777]">
                  Uploading image...
                </p>
              )}
            </div>
          )}

          {loading ? (
            <p className="rounded-2xl bg-[#f4f6fb] p-5 text-sm font-bold text-[#777]">
              Loading items...
            </p>
          ) : filteredIdeas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e8eaf2] bg-[#f4f6fb] p-10 text-center">
              <p className="text-base font-black text-[#0d2560]">
                {activeCategory === "Ideas"
                  ? "No ideas added yet."
                  : "No mood board images added yet."}
              </p>

              <p className="mt-2 text-sm font-bold text-[#777]">
                {activeCategory === "Ideas"
                  ? "Click “+ Add Idea” to save your first content idea."
                  : "Drag images here to start your mood board."}
              </p>
            </div>
          ) : activeCategory === "Mood Board" ? (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => openEditIdea(idea)}
                    className="block w-full text-left"
                  >
                    {idea.image_url ? (
                      <img
                        src={idea.image_url}
                        alt={idea.title}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex min-h-40 w-full items-center justify-center bg-[#d8d8d8] p-5 text-center text-sm font-bold text-[#777]">
                        No image uploaded
                      </div>
                    )}

                    <div className="p-4">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-black ${programPill(
                            idea.program
                          )}`}
                        >
                          {idea.program || "Program"}
                        </span>

                        <span className="rounded-full bg-[#f4f6fb] px-2 py-1 text-[9px] font-black text-[#777]">
                          {idea.content_type || "Design"}
                        </span>

                        <span className="rounded-full bg-[#0d2560]/10 px-2 py-1 text-[9px] font-black text-[#0d2560]">
                          {idea.idea_category || "Educational"}
                        </span>

                        <span className="rounded-full bg-[#25d366]/10 px-2 py-1 text-[9px] font-black text-[#128C7E]">
                          {idea.status || "Idea"}
                        </span>
                      </div>

                      <h4 className="text-sm font-black leading-snug text-[#0d2560]">
                        {idea.title}
                      </h4>

                      {idea.description && (
                        <p className="mt-2 text-xs leading-relaxed text-[#777]">
                          {idea.description}
                        </p>
                      )}
                    </div>
                  </button>

                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => openEditIdea(idea)}
                      className="rounded-xl bg-[#fff8f5] px-3 py-2 text-xs font-black text-[#e8453c] hover:bg-[#e8453c] hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => openSchedulePopup(idea)}
                      className="rounded-xl bg-[#0d2560] px-3 py-2 text-xs font-black text-white hover:bg-[#e8453c]"
                    >
                      Move to Calendar
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteIdea(idea.id)}
                      className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="flex h-full">
                    <div
                      className={`w-2 shrink-0 bg-gradient-to-b ${programGradient(
                        idea.program
                      )}`}
                    />

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-black ${programPill(
                            idea.program
                          )}`}
                        >
                          {idea.program || "Program"}
                        </span>

                        <span className="rounded-full bg-[#f4f6fb] px-2 py-1 text-[9px] font-black text-[#777]">
                          {idea.content_type || "Idea"}
                        </span>

                        <span className="rounded-full bg-[#0d2560]/10 px-2 py-1 text-[9px] font-black text-[#0d2560]">
                          {idea.idea_category || "Educational"}
                        </span>

                        <span className="rounded-full bg-[#25d366]/10 px-2 py-1 text-[9px] font-black text-[#128C7E]">
                          {idea.status || "Idea"}
                        </span>
                      </div>

                      <h4 className="text-sm font-black leading-snug text-[#0d2560]">
                        {idea.title}
                      </h4>

                      {idea.description && (
                        <p className="mt-2 text-xs leading-relaxed text-[#777]">
                          {idea.description}
                        </p>
                      )}

                      {idea.notes && (
                        <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-[#f4f6fb] p-3 text-xs leading-relaxed text-[#444]">
                          {idea.notes}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openEditIdea(idea)}
                          className="rounded-xl bg-[#fff8f5] px-3 py-2 text-xs font-black text-[#e8453c] hover:bg-[#e8453c] hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openSchedulePopup(idea)}
                          className="rounded-xl bg-[#0d2560] px-3 py-2 text-xs font-black text-white hover:bg-[#e8453c]"
                        >
                          Move to Calendar
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteIdea(idea.id)}
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-500 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2560]/60 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] p-6 text-white">
              <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-gradient-to-r from-[#e8453c] to-[#f9956b] opacity-20" />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <h2 className="cira-heading text-2xl font-black">
                  {editingIdea ? "Edit Item" : "Add Item"}
                </h2>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl font-black text-white hover:bg-white/25"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <input
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
                placeholder={
                  form.category === "Mood Board"
                    ? "Mood board title"
                    : "Idea title"
                }
              />

              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value as IdeaCategory,
                    content_type:
                      event.target.value === "Mood Board"
                        ? "Design"
                        : form.content_type,
                  })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>

              <select
                value={form.content_type}
                onChange={(event) =>
                  setForm({ ...form, content_type: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              >
                <option>Carousel</option>
                <option>Static</option>
                <option>Reel</option>
                <option>Story</option>
                <option>Design</option>
                <option>Reference</option>
                <option>Brand Inspiration</option>
              </select>

              <select
                value={form.idea_category}
                onChange={(event) =>
                  setForm({ ...form, idea_category: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              >
                {ideaCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>

              <select
                value={form.program}
                onChange={(event) =>
                  setForm({ ...form, program: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              >
                <option>ECEA</option>
                <option>Business</option>
                <option>AI Web Design</option>
                <option>French</option>
                <option>CIRA Brand</option>
              </select>

              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              >
                <option>Idea</option>
                <option>Draft Later</option>
                <option>Approved</option>
                <option>Used</option>
              </select>

              {form.category === "Mood Board" && (
                <div className="rounded-2xl border border-dashed border-[#e8453c]/40 bg-[#fff8f5] p-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#e8453c]">
                    Mood Board Image
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFormImageChange}
                    className="w-full text-sm font-semibold text-[#777]"
                  />

                  {uploadingImage && (
                    <p className="mt-2 text-xs font-bold text-[#777]">
                      Uploading image...
                    </p>
                  )}

                  {form.image_url ? (
                    <div className="mt-3">
                      <img
                        src={form.image_url}
                        alt="Mood board preview"
                        className="w-full rounded-2xl border border-[#e8eaf2]"
                      />

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex min-h-40 w-full items-center justify-center rounded-2xl bg-[#d8d8d8] text-center text-sm font-bold text-[#777]">
                      No image uploaded yet
                    </div>
                  )}
                </div>
              )}

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
                placeholder="Short description"
                rows={3}
              />

              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
                placeholder="Notes, content direction, caption draft, design direction, etc."
                rows={6}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-2xl bg-[#f4f6fb] px-4 py-2 text-sm font-black text-[#0d2560]"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={saveIdea}
                  className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-4 py-2 text-sm font-black text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {schedulingIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2560]/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] p-6 text-white">
              <h2 className="cira-heading text-2xl font-black">
                Move to Calendar
              </h2>

              <p className="mt-2 text-xs text-white/60">
                Choose the date where this item should become a scheduled post.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-2xl bg-[#f4f6fb] p-4">
                <p className="text-xs font-black uppercase tracking-wide text-[#e8453c]">
                  Item
                </p>

                <h3 className="mt-1 text-sm font-black text-[#0d2560]">
                  {schedulingIdea.title}
                </h3>
              </div>

              <input
                type="date"
                value={scheduleDate}
                onChange={(event) => setScheduleDate(event.target.value)}
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSchedulingIdea(null);
                    setScheduleDate("");
                  }}
                  className="rounded-2xl bg-[#f4f6fb] px-4 py-2 text-sm font-black text-[#0d2560]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={moveIdeaToCalendar}
                  disabled={scheduling}
                  className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                >
                  {scheduling ? "Moving..." : "Move to Calendar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function programGradient(program: string | null) {
  if (program === "Business" || program === "Business Mgmt") {
    return "from-[#1e4caf] to-[#1e4caf]";
  }

  if (program === "AI Web Design") {
    return "from-[#f0870f] to-[#f0870f]";
  }

  if (program === "French") {
    return "from-[#d24b66] to-[#d24b66]";
  }

  if (program === "CIRA Brand") {
    return "from-[#024da8] to-[#024da8]";
  }

  return "from-[#f1ca33] to-[#f1ca33]";
}

function programPill(program: string | null) {
  if (program === "Business" || program === "Business Mgmt") {
    return "bg-[#1e4caf]/10 text-[#1e4caf]";
  }

  if (program === "AI Web Design") {
    return "bg-[#f0870f]/10 text-[#f0870f]";
  }

  if (program === "French") {
    return "bg-[#d24b66]/10 text-[#d24b66]";
  }

  if (program === "CIRA Brand") {
    return "bg-[#024da8]/10 text-[#024da8]";
  }

  return "bg-[#f1ca33]/20 text-[#8a6000]";
}