export default function PublicFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-[10px] uppercase tracking-[0.32em] text-zinc-600 md:flex-row">
        <span className="font-mono">
          © 2026 CYBERQUEST · OPERATING COMMAND // EMI
        </span>
        <div className="flex items-center gap-5 font-mono">
          <a href="#" className="hover:text-zinc-300">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-zinc-300">
            Terms of Service
          </a>
          <a href="#" className="hover:text-zinc-300">
            Status
          </a>
          <a href="#" className="hover:text-zinc-300">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
