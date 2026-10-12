import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FFF9EF] px-5 py-12 text-[#193D2B]">
      <div className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-5xl flex-col items-center justify-center text-center">
        <div className="mb-7 grid h-24 w-24 place-items-center rounded-[1.8rem] border-[3px] border-[#193D2B] bg-[#34784A] shadow-[0_7px_0_#193D2B] animate-scale-in" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" className="h-16 w-16">
            <path d="M49 12C31 12.5 18 18.5 15 31c-1.7 6.8 2.1 11.8 8.2 11.8C36 42.8 45.5 29.5 49 12Z" fill="#F7D76B" />
            <path d="M12 52c7-11.2 15.5-18.2 28.5-25" stroke="#FFF9EF" strokeLinecap="round" strokeWidth="3.5" />
          </svg>
        </div>

        <p className="mb-2 text-sm font-extrabold uppercase tracking-[0.18em] text-[#34784A]">A little more outside</p>
        <h1 className="font-[family-name:var(--font-heading)] text-5xl font-extrabold tracking-tight sm:text-7xl">Touch Grass</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#5F6B5E] sm:text-xl">
          The phone is the scoreboard. The game happens outside.
        </p>

        <div className="mt-9 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <Link
            href="/login?mode=register"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border-2 border-[#193D2B] bg-[#34784A] px-6 py-3 font-bold text-white shadow-[0_4px_0_#193D2B] transition-transform hover:-translate-y-0.5"
          >
            Get started
          </Link>
          <Link
            href="/login?mode=login"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border-2 border-[#193D2B] bg-[#F5EDDF] px-6 py-3 font-bold text-[#193D2B] shadow-[0_4px_0_#193D2B] transition-transform hover:-translate-y-0.5"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-12 max-w-lg text-sm leading-relaxed text-[#687365]">
          Choose a vibe, take on a real-world mission, and log what you discovered.
        </p>
      </div>
    </main>
  );
}
