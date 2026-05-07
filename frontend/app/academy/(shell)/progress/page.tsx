const TRACKS = [
  { name: "Linux Fundamentals", progress: 65 },
  { name: "Offensive Networks", progress: 20 },
  { name: "Applied Cryptography", progress: 0 },
  { name: "Web Security", progress: 80 },
];

export default function AcademyProgressPage() {
  return (
    <div className="px-10 py-10">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Skill Index
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Progress
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Tu dominio por área. Los porcentajes reflejan módulos completados,
        ejercicios resueltos y evaluaciones aprobadas.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
        {TRACKS.map((t) => (
          <article
            key={t.name}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
          >
            <div className="flex items-center justify-between text-sm">
              <h3 className="font-semibold text-zinc-100">{t.name}</h3>
              <span className="font-mono text-orange-300">{t.progress}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-orange-500"
                style={{ width: `${t.progress}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
