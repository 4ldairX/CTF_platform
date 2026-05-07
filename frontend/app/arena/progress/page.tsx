const PATHS = [
  { name: "Web Exploitation", value: 88 },
  { name: "Binary PWN", value: 64 },
  { name: "Cryptography", value: 92 },
  { name: "OSINT", value: 51 },
];

export default function ArenaProgressPage() {
  return (
    <div className="px-10 py-8">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-orange-400">
        Specialization Index
      </span>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-50">
        Progress
      </h1>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">
        Distribución de skill points obtenidos por categoría táctica.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
        {PATHS.map((p) => (
          <article
            key={p.name}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
          >
            <div className="flex items-center justify-between text-sm">
              <h3 className="font-semibold text-zinc-100">{p.name}</h3>
              <span className="font-mono text-orange-300">{p.value}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full bg-orange-500"
                style={{ width: `${p.value}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
