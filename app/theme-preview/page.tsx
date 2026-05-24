export default function ThemePreview() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-orange-50 to-sky-100 p-10 text-slate-900">
      <div className="rounded-3xl bg-gradient-to-r from-pink-500 via-orange-400 to-blue-500 p-8 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
          Social Media Planner
        </p>
        <h1 className="text-4xl font-bold">Content Calendar Preview</h1>
        <p className="mt-2 text-white/90">
          If you can see this, the preview page is working.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 p-5 text-white shadow-lg">
          <h2 className="font-bold">Instagram Post</h2>
          <p className="mt-2 text-sm">Scheduled</p>
        </div>

        <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-lg">
          <h2 className="font-bold">Facebook Post</h2>
          <p className="mt-2 text-sm">Published</p>
        </div>

        <div className="rounded-2xl bg-sky-700 p-5 text-white shadow-lg">
          <h2 className="font-bold">LinkedIn Post</h2>
          <p className="mt-2 text-sm">Draft</p>
        </div>
      </div>
    </main>
  );
}