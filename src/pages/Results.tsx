import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

type Item = { q: string; a: string[]; correct: number };

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function shuffleQuestion(it: Item): Item {
  const perm = shuffle([0, 1, 2, 3]);
  const shuffled = perm.map((idx) => it.a[idx]);
  const newCorrect = perm.indexOf(it.correct);
  return { q: it.q, a: shuffled, correct: newCorrect };
}

export default function Results() {
  const location = useLocation();
  const topic = (location.state as any)?.topic ?? "general knowledge";
  const original = (location.state?.items as Item[]) ?? [];

  const [items, setItems] = useState<Item[]>(() =>
    shuffle(original).map(shuffleQuestion)
  );
  const [selected, setSelected] = useState<number[]>(() =>
    items.map(() => -1)
  );
  const [submitted, setSubmitted] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = useMemo(
    () => selected.filter((x) => x !== -1).length,
    [selected]
  );

  const score = useMemo(() => {
    if (!submitted) return { correct: 0, total: items.length, pct: 0 };
    const correct = items.reduce(
      (acc, it, idx) => acc + (selected[idx] === it.correct ? 1 : 0),
      0
    );
    const total = items.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return { correct, total, pct };
  }, [submitted, items, selected]);

  function choose(qIdx: number, oIdx: number) {
    if (submitted) return;
    setSelected((prev) => {
      const next = [...prev];
      next[qIdx] = oIdx;
      return next;
    });
  }

  function handleSubmit() {
    setSubmitted(true);
  }
  function handleReset() {
    setSelected(items.map(() => -1));
    setSubmitted(false);
  }
  function handleReshuffle() {
    const reshuffled = shuffle(items).map(shuffleQuestion);
    setItems(reshuffled);
    setSelected(reshuffled.map(() => -1));
    setSubmitted(false);
  }

  async function handleMoreQuestions() {
    try {
      setError(null);
      setLoadingMore(true);
      const res = await fetch("http://localhost:8787/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          count: 3, // number of *new* questions to add
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
      const data = (await res.json()) as { items: Item[] };
      const fresh = (data.items ?? []).map(shuffleQuestion);

      // Append new questions
      setItems((prev) => [...prev, ...fresh]);
      setSelected((prev) => [...prev, ...fresh.map(() => -1)]);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load more questions.");
    } finally {
      setLoadingMore(false);
    }
  }

  if (items.length === 0)
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Results</h2>
        <p className="mt-2 text-white/70">No quiz yet. Go to Generate.</p>
      </section>
    );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold">
          {submitted ? "Your Score" : "Answer the Quiz"}
        </h2>
        {submitted && (
          <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm">
            <span className="font-semibold">{score.correct}</span>/
            {score.total} • {score.pct}%
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-400/40 bg-red-500/20 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-5">
        {items.map((it, qIdx) => (
          <li key={qIdx} className="rounded-2xl border border-white/10 p-4">
            <p className="font-medium">
              {qIdx + 1}. {it.q}
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {it.a.map((opt, oIdx) => {
                const isChosen = selected[qIdx] === oIdx;
                const isCorrect = it.correct === oIdx;

                let cls =
                  "rounded-lg px-3 py-2 text-left text-sm transition border";
                if (!submitted) {
                  cls += isChosen
                    ? " bg-white text-gray-900 border-white"
                    : " bg-white/10 text-white border-white/10 hover:bg-white/15";
                } else {
                  if (isCorrect) cls += " bg-green-600/30 border-green-400/40";
                  else if (isChosen) cls += " bg-red-600/30 border-red-400/40";
                  else cls += " bg-white/10 border-white/10 text-white/90";
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => choose(qIdx, oIdx)}
                    className={cls}
                  >
                    <span className="font-semibold mr-2">
                      {String.fromCharCode(65 + oIdx)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        {!submitted ? (
          <>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-white/90 disabled:opacity-60 transition"
            >
              Submit ({answeredCount}/{items.length})
            </button>
            <button
              type="button"
              onClick={handleReshuffle}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              Reshuffle
            </button>
            <button
              type="button"
              onClick={handleMoreQuestions}
              disabled={loadingMore}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "More Questions"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleMoreQuestions}
              disabled={loadingMore}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "More Questions"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
