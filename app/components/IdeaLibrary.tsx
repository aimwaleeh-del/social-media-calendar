"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "../lib/supabaseClient";

type IdeaCategory = "Ideas" | "Mood Board";

type ContentIdea = {
  id: string;
  title: string;
  category: string;
  content_type: string | null;
  description: string | null;
  notes: string | null;
  program: string | null;
  status: string | null;
  image_url: string | null;
  created_at: string;
};

type IdeaForm = {
  title: string;
  category: IdeaCategory;
  content_type: string;
  description: string;
  notes: string;
  program: string;
  status: string;
  image_url: string;
};

const categories: IdeaCategory[] = ["Ideas", "Mood Board"];

const blankIdea: IdeaForm = {
  title: "",
  category: "Ideas",
  content_type: "Carousel",
  description: "",
  notes: "",
  program: "ECEA",
  status: "Idea",
  image_url: "",
};

export default function IdeaLibrary() {
  const [activeCategory, setActiveCategory] = useState<IdeaCategory>("Ideas");
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);
  const [form, setForm] = useState<IdeaForm>(blankIdea);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    });
    setShowForm(true);
  }

  function openEditIdea(idea: ContentIdea) {
    setEditingIdea(idea);
    setForm({
      title: idea.title || "",
      category: idea.category === "Mood Board" ? "Mood Board" : "Ideas",
      content_type: idea.content_type || "Carousel",
      description: idea.description || "",
      notes: idea.notes || "",
      program: idea.program || "ECEA",
      status: idea.status || "Idea",
      image_url: idea.image_url || "",
    });
    setShowForm(true);
  }

  async function uploadIdeaImage(file: File) {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, or WEBP image.");
      return;
    }

    setUploadingImage(true);

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
      setUploadingImage(false);
      alert("Could not upload image:\n\n" + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);

    setForm({
      ...form,
      image_url: data.publicUrl,
    });

    setUploadingImage(false);
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadIdeaImage(file);
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
        alert("Could not update idea:\n\n" + error.message);
        return;
      }

      if (data && data[0]) {
        setIdeas(ideas.map((idea) => (idea.id === data[0].id ? data[0] : idea)));
      }
    } else {
      const { data, error } = await supabase
        .from("content_ideas")
        .insert([form])
        .select();

      if (error) {
        alert("Could not save idea:\n\n" + error.message);
        return;
      }

      if (data) {
        setIdeas([...data, ...ideas]);
      }
    }

    setShowForm(false);
    setEditingIdea(null);
    setForm(blankIdea);
  }

  async function deleteIdea(id: string) {
    const confirmed = confirm("Delete this idea?");
    if (!confirmed) return;

    const { error } = await supabase.from("content_ideas").delete().eq("id", id);

    if (error) {
      alert("Could not delete idea:\n\n" + error.message);
      return;
    }

    setIdeas(ideas.filter((idea) => idea.id !== id));
  }

  const filteredIdeas = ideas.filter((idea) => {
    if (activeCategory === "Ideas") {
      return idea.category === "Ideas";
    }

    return idea.category === "Mood Board";
  });

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
          Add content ideas and mood board images without adding them to the calendar.
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
              {activeCategory === "Ideas" ? "+ Add Idea" : "+ Add Mood Board"}
            </button>
          </div>

          {loading ? (
            <p className="rounded-2xl bg-[#f4f6fb] p-5 text-sm font-bold text-[#777]">
              Loading ideas...
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
                  : "Click “+ Add Mood Board” to upload your first design reference."}
              </p>
            </div>
          ) : activeCategory === "Mood Board" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
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
                        className="aspect-[4/5] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/5] w-full items-center justify-center bg-[#d8d8d8] p-5 text-center text-sm font-bold text-[#777]">
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

                  <div className="flex gap-2 px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => openEditIdea(idea)}
                      className="rounded-xl bg-[#fff8f5] px-3 py-2 text-xs font-black text-[#e8453c] hover:bg-[#e8453c] hover:text-white"
                    >
                      Edit
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

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditIdea(idea)}
                          className="rounded-xl bg-[#fff8f5] px-3 py-2 text-xs font-black text-[#e8453c] hover:bg-[#e8453c] hover:text-white"
                        >
                          Edit
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
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
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
                        className="aspect-[4/5] w-full rounded-2xl border border-[#e8eaf2] object-cover"
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
                    <div className="mt-3 flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-[#d8d8d8] text-center text-sm font-bold text-[#777]">
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
    </section>
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