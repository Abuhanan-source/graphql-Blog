
import { Link } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { BLOGS_QUERY } from '../services/queries';

const highlights = [
  {
    title: 'Lightning fast',
    text: 'Launch your workflow in seconds with instantly responsive screens.',
  },
  {
    title: 'Elegant UI',
    text: 'Thoughtful spacing, rich gradients, and polished components.',
  },
  {
    title: 'Built to impress',
    text: 'Designed to feel premium from the very first interaction.',
  },
];

interface BlogPost {
  _id: string;
  ProjectName: string;
  Describtion: string;
  image: string;
  createdAt: string;
}

function Home() {
  const [execute, { loading, data }] = useLazyQuery<{ Blogs: BlogPost[] }>(BLOGS_QUERY);

  useEffect(() => {
    execute();
  }, [execute]);

  return (
    <div className="min-h-screen px-4 pt-24 py-6 text-slate-100 sm:px-6 lg:px-8" style={{ background: 'var(--bg-color)' }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <main className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[36px] border border-white/6 bg-[rgba(255,255,255,0.02)] p-8 shadow-[0_30px_80px_rgba(2,6,23,0.6)] backdrop-blur-2xl sm:p-10 lg:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
              <span className="text-base">✨</span>
              New experience
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Make every interaction feel effortless.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8" style={{ color: 'var(--muted-color)' }}>
              From elegant onboarding to delightfully smooth experiences, this UI turns simple tasks into something truly memorable.
            </p>

            {/* Summary Card */}
            <div className="mt-6 rounded-2xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm uppercase tracking-wide text-white/90">Summary</h3>
                  <p className="mt-2 text-sm" style={{ color: 'var(--muted-color)' }}>
                    Quick overview: explore recent posts, see project highlights, and create your own entries with ease.
                  </p>
                </div>
                <div className="text-sm text-slate-300">
                  <div>Posts: {data?.Blogs?.length ?? '—'}</div>
                  <div className="mt-1">Last updated: {data?.Blogs && data.Blogs.length ? new Date(Number(data.Blogs[0].createdAt)).toLocaleDateString() : '—'}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link
                  to="/Blogs"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow transition"
                  style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
                >
                  View posts
                </Link>
                <Link to="/Create-Blog" className="rounded-full px-4 py-2 text-sm font-medium text-slate-200 bg-[rgba(255,255,255,0.01)] border border-white/6">Create post</Link>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
              >
                Start free
              </Link>
              <Link
                to="/login"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
              >
                View dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-4">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted-color)' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[36px] border border-white/6 bg-[rgba(255,255,255,0.01)] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.6)]">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top right, rgba(96,165,250,0.06), transparent 30%), radial-gradient(circle at bottom left, rgba(192,132,252,0.06), transparent 35%)' }} />
            <div className="relative rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.01)] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em]" style={{ color: 'var(--muted-color)' }}>Recent posts</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Latest from the blog</h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
                  Live
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="text-sm text-slate-400">Loading posts...</div>
                ) : (
                  (data?.Blogs ?? []).slice(0, 3).map((b: any) => (
                    <article key={b._id} className="rounded-2xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-24 overflow-hidden rounded-lg bg-slate-800">
                          {b.image ? <img src={b.image} alt={b.ProjectName} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white">{b.ProjectName}</h3>
                          <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted-color)' }}>{b.Describtion?.slice(0, 110)}{b.Describtion && b.Describtion.length > 110 ? '...' : ''}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                            <span>{b.createdAt ? new Date(Number(b.createdAt)).toLocaleDateString() : ''}</span>
                            <Link to={`/Blogs/${b._id}`} className="text-sm font-semibold" style={{ color: 'var(--primary-color)' }}>Read →</Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Home;

