function BanedUser() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-gray-100">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-rose-500 to-purple-600 shadow-lg shadow-rose-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-8 w-8 text-white">
            <circle cx="12" cy="12" r="9" />
            <path d="M5.5 5.5l13 13" strokeLinecap="round" />
          </svg>
        </div>

        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-rose-400">Account suspended</p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">You've been banned</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          Your account was restricted for violating our community guidelines. If you think this is a
          mistake, you can reach out to support and we'll take a look.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="mailto:support@graphblog.com"
            className="w-full rounded-lg bg-linear-to-r from-blue-500 to-purple-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition hover:opacity-90 sm:w-auto"
          >
            Contact support
          </a>
          <a
            href="/"
            className="w-full rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-gray-800 sm:w-auto"
          >
            Back to home
          </a>
        </div>

        <p className="mt-10 font-mono text-[11px] text-gray-600">Error code: 403 · ACCOUNT_BANNED</p>
      </div>
    </div>
  );
}

export default BanedUser;