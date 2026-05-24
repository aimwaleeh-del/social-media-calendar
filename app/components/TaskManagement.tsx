"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  assignee: string | null;
  due_date: string | null;
  category: string | null;
  created_at: string;
};

type TaskForm = {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  due_date: string;
  category: string;
};

const blankTask: TaskForm = {
  title: "",
  description: "",
  status: "To Do",
  priority: "Medium",
  assignee: "",
  due_date: "",
  category: "General",
};

const statuses = ["To Do", "In Progress", "Approved ✅", "Done"];
const priorities = ["Low", "Medium", "High"];
const categories = ["General", "Content", "Design", "Admin", "Follow Up"];

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(blankTask);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Could not load tasks:\n\n" + error.message);
    } else {
      setTasks(data || []);
    }

    setLoading(false);
  }

  function openNewTask() {
    setEditingTask(null);
    setForm(blankTask);
    setShowForm(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "To Do",
      priority: task.priority || "Medium",
      assignee: task.assignee || "",
      due_date: task.due_date || "",
      category: task.category || "General",
    });
    setShowForm(true);
  }

  async function saveTask() {
    if (!form.title.trim()) {
      alert("Please add a task title.");
      return;
    }

    const taskData = {
      ...form,
      due_date: form.due_date || null,
    };

    if (editingTask) {
      const { data, error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", editingTask.id)
        .select();

      if (error) {
        alert("Could not update task:\n\n" + error.message);
        return;
      }

      if (data && data[0]) {
        setTasks((current) =>
          current.map((task) => (task.id === data[0].id ? data[0] : task))
        );
      }
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .insert([taskData])
        .select();

      if (error) {
        alert("Could not save task:\n\n" + error.message);
        return;
      }

      if (data) {
        setTasks((current) => [...data, ...current]);
      }
    }

    setShowForm(false);
    setEditingTask(null);
    setForm(blankTask);
  }

  async function deleteTask(id: string) {
    const confirmed = confirm("Delete this task?");
    if (!confirmed) return;

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      alert("Could not delete task:\n\n" + error.message);
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== id));
  }

  async function quickUpdateStatus(task: Task, newStatus: string) {
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id)
      .select();

    if (error) {
      alert("Could not update status:\n\n" + error.message);
      return;
    }

    if (data && data[0]) {
      setTasks((current) =>
        current.map((item) => (item.id === data[0].id ? data[0] : item))
      );
    }
  }

  const filteredTasks =
    statusFilter === "All"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-sm">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] p-7 text-white">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-r from-[#e8453c] to-[#f9956b] opacity-20" />

        <p className="relative z-10 text-xs font-black uppercase tracking-[0.18em] text-white/40">
          Workflow
        </p>

        <h2 className="cira-heading relative z-10 mt-1 text-3xl font-black leading-tight">
          Task Management
          <br />
          <em className="not-italic text-[#f9956b]">
            Track content tasks and follow-ups
          </em>
        </h2>

        <p className="relative z-10 mt-2 text-xs text-white/55">
          Manage design tasks, content tasks, approvals, admin work, and follow-ups.
        </p>
      </div>

      <div className="bg-[#e5e9f2] p-5">
        <div className="rounded-[28px] bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e8453c]">
                Tasks
              </p>

              <h3 className="cira-heading text-2xl font-black text-[#0d2560]">
                Task Board
              </h3>

              <p className="mt-1 text-xs font-bold text-[#777]">
                {filteredTasks.length} task{filteredTasks.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <button
              type="button"
              onClick={openNewTask}
              className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-5 py-3 text-sm font-black text-white shadow-sm"
            >
              + Add Task
            </button>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {["All", ...statuses].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-2xl px-4 py-2 text-xs font-black ${
                  statusFilter === status
                    ? "bg-[#0d2560] text-white"
                    : "bg-[#f4f6fb] text-[#0d2560]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="rounded-2xl bg-[#f4f6fb] p-5 text-sm font-bold text-[#777]">
              Loading tasks...
            </p>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e8eaf2] bg-[#f4f6fb] p-10 text-center">
              <p className="text-base font-black text-[#0d2560]">
                No tasks yet.
              </p>
              <p className="mt-2 text-sm font-bold text-[#777]">
                Click “+ Add Task” to create your first task.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {statuses.map((status) => {
                const columnTasks = filteredTasks.filter(
                  (task) => task.status === status
                );

                return (
                  <div key={status} className="rounded-2xl bg-[#f4f6fb] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-black text-[#0d2560]">
                        {status}
                      </h4>
                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-[#777]">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-2xl bg-white p-4 shadow-sm"
                        >
                          <div className="mb-2 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-[9px] font-black ${priorityClass(
                                task.priority
                              )}`}
                            >
                              {task.priority || "Medium"}
                            </span>

                            <span className="rounded-full bg-[#0d2560]/10 px-2 py-1 text-[9px] font-black text-[#0d2560]">
                              {task.category || "General"}
                            </span>
                          </div>

                          <h5 className="text-sm font-black leading-snug text-[#0d2560]">
                            {task.title}
                          </h5>

                          {task.description && (
                            <p className="mt-2 text-xs leading-relaxed text-[#777]">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-3 space-y-1 text-xs font-bold text-[#777]">
                            {task.assignee && <p>Assignee: {task.assignee}</p>}
                            {task.due_date && <p>Due: {task.due_date}</p>}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {statuses
                              .filter((item) => item !== task.status)
                              .map((nextStatus) => (
                                <button
                                  key={nextStatus}
                                  type="button"
                                  onClick={() => quickUpdateStatus(task, nextStatus)}
                                  className="rounded-xl bg-[#f4f6fb] px-3 py-2 text-[10px] font-black text-[#0d2560]"
                                >
                                  {nextStatus}
                                </button>
                              ))}

                            <button
                              type="button"
                              onClick={() => openEditTask(task)}
                              className="rounded-xl bg-[#fff8f5] px-3 py-2 text-[10px] font-black text-[#e8453c]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="rounded-xl bg-red-50 px-3 py-2 text-[10px] font-black text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d2560]/60 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-b from-[#1a3a8a] to-[#0d2560] p-6 text-white">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <h2 className="cira-heading text-2xl font-black">
                  {editingTask ? "Edit Task" : "Add Task"}
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
                placeholder="Task title"
              />

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
                placeholder="Task details"
                rows={4}
              />

              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              >
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>

              <select
                value={form.priority}
                onChange={(event) =>
                  setForm({ ...form, priority: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>

              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>

              <input
                value={form.assignee}
                onChange={(event) =>
                  setForm({ ...form, assignee: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
                placeholder="Assignee"
              />

              <input
                type="date"
                value={form.due_date}
                onChange={(event) =>
                  setForm({ ...form, due_date: event.target.value })
                }
                className="w-full rounded-2xl border border-[#e8eaf2] bg-[#fff8f5] p-3 text-sm font-semibold outline-none focus:border-[#e8453c]"
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
                  onClick={saveTask}
                  className="rounded-2xl bg-gradient-to-r from-[#e8563c] via-[#f4724a] to-[#f98060] px-4 py-2 text-sm font-black text-white"
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function priorityClass(priority: string | null) {
  if (priority === "High") return "bg-red-100 text-red-700";
  if (priority === "Low") return "bg-green-100 text-green-700";
  return "bg-[#f5c842]/20 text-[#8a6000]";
}