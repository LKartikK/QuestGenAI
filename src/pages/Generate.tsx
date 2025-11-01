import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Generate() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8787/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic || "general knowledge",
          count: Math.max(1, Math.min(20, Number(count) || 5)),
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
      const data = await res.json(); // { items: [...] }

      // ✅ Navigate with REAL items (no placeholders)
      navigate("/results", {
        state: { topic: topic || "general knowledge", items: data.items || [] },
      });
    } catch (err: any) {
      setError(err?.message ?? "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-semibold">Generate Quiz</h2>

      <form onSubmit={handleGenerate} className="mt-4 space-y-3">
        <input
          className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 outline-none"
          placeholder="Topic (e.g., Photosynthesis)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <label className="text-sm text-white/80">Questions:</label>
          <input
            type="number"
            min={1}
            max={20}
            className="w-20 rounded-xl border border-white/10 bg-white/10 px-3 py-2 outline-none"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white/90 disabled:opacity-60 transition"
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 rounded-lg border border-red-400/40 bg-red-500/20 px-3 py-2 text-sm">
          {error}
        </p>
      )}
    </section>
  );
}
