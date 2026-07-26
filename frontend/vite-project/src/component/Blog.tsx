import { useLazyQuery } from '@apollo/client/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useDebounce from '../hooks/Usedebounce.ts';
import { BLOGS_QUERY } from '../services/queries.ts';

interface BlogPost {
  _id: string;
  ProjectName: string;
  Describtion: string;
  createdAt: string;
  image: string;
  totalComment: number;
  totalViews:number
}

interface BlogQueryResponse {
  Blogs: BlogPost[];
}

function Blog() {
  
  const [execute, { loading, data, error }] = useLazyQuery<BlogQueryResponse>(BLOGS_QUERY);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const Navigate = useNavigate();

  // Navbar se '?search=...' ke zariye aa sakta hai, ya user seedha yahan
  // is page ke apne search box mein type kar sakta hai.
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') ?? '');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Agar navbar se URL update ho (naya search param), local input bhi sync ho jaye.
  useEffect(() => {
    const paramValue = searchParams.get('search') ?? '';
    setSearchTerm((current) => (current === paramValue ? current : paramValue));
  }, [searchParams]);

  // Debounce hone ke baad hi URL update karo — har keystroke par nahi.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearchTerm.trim()) {
      next.set('search', debouncedSearchTerm);
    } else {
      next.delete('search');
    }
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const filteredBlogs = useMemo(() => {
    const blogs = data?.Blogs ?? [];
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (!term) return blogs;
    return blogs.filter(
      (b) =>
        b.ProjectName?.toLowerCase().includes(term) ||
        b.Describtion?.toLowerCase().includes(term)
    );
  }, [data, debouncedSearchTerm]);

  useEffect(() => {
    const fetchBlogs = async (): Promise<void> => {
      try {
        setIsLoading(true);
        await execute();
        
      } catch (err: any) {
        console.error('Error fetching blogs:', error);
        alert(err.message || 'Failed to fetch blogs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [execute]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-purple-400 mx-auto mb-5"></div>
          <p className="text-slate-300 text-lg">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_30%_70%,rgba(139,92,246,0.16),transparent_25%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-10 shadow-[0_20px_80px_-40px_rgba(148,163,184,0.35)] backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="uppercase tracking-[0.35em] text-blue-300/80 font-semibold mb-4">Latest insights</p>
                <h1 className="text-5xl font-black text-white sm:text-6xl">Build, learn, and ship better with every post.</h1>
                <p className="mt-6 max-w-2xl text-slate-300 text-base sm:text-lg leading-8">
                  Discover curated tutorials, project stories, and design tips for modern web development—all packaged in a clean, immersive reading experience.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Published</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{data?.Blogs?.length ?? 0}</p>
                  <p className="mt-2 text-sm text-slate-400">Total posts available today</p>
                </div>
                <div className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Experience</p>
                  <p className="mt-4 text-3xl font-semibold text-white">Fast access</p>
                  <p className="mt-2 text-sm text-slate-400">Browse insights without distraction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-12 flex flex-col gap-4 rounded-4xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-[0_24px_80px_-40px_rgba(148,163,184,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Filter</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Find the posts that matter most.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-full border border-slate-700/80 bg-slate-800/90 px-5 py-2 text-sm text-slate-200 transition hover:bg-slate-700/90">All</button>
              <button
                className="rounded-full border border-slate-700/80 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
                style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))', boxShadow: '0 10px 30px rgba(124,58,237,0.12)'}}
              >
                Featured
              </button>
            </div>
          </div>
          <p className="text-slate-400 max-w-2xl">Browse through our latest posts with rich visuals and clear summaries for a faster discovery experience.</p>

          <div className="relative max-w-md">
            <input
              type="text"
              aria-label="Search blogs"
              placeholder="Search blogs by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-slate-700/80 bg-slate-950/90 px-5 py-3 text-slate-100 placeholder:text-slate-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
            />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((content: BlogPost) => (
              <article
                key={content._id}
                className="group flex h-full flex-col overflow-hidden rounded-4xl border border-slate-700/60 bg-slate-950/80 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.7)] transition duration-300 hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-purple-500/20"
              >
                <div className="relative h-56 overflow-hidden bg-slate-800">
                  {content.image ? (
                    <img
                      src={content.image}
                      alt={content.ProjectName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-700 to-slate-800 text-slate-400">
                      <span>No image available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-slate-950/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 shadow-lg shadow-black/20">
                    Blog post
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-purple-300">
                      {content.ProjectName}
                    </h3>
                    <p className="mt-4 text-slate-300 leading-7 line-clamp-4">{content.Describtion}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      Published
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      💬 {content.totalComment} comment{content.totalComment === 1 ? '' : 's'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                       👁️ {content.totalViews} Views{content.totalViews === 1 ? '' : 's'}
                    </span>
                    <span>{new Date(Number(content.createdAt)).toLocaleDateString()}</span>
                  </div>

                  <button
                    onClick={() => Navigate(`/Blogs/${content._id}`)}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.01]"
                    style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))', boxShadow: '0 12px 40px rgba(6,182,212,0.08)'}}
                  >
                    Read more
                    <span className="text-lg">→</span>
                  </button>

                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-4xl border border-slate-700/60 bg-slate-900/90 p-16 text-center shadow-xl shadow-slate-950/40">
              <h3 className="text-3xl font-semibold text-white mb-4">No blogs found</h3>
              <p className="max-w-lg mx-auto text-slate-400">
                {debouncedSearchTerm.trim()
                  ? `No blog posts match "${debouncedSearchTerm}". Try a different search term.`
                  : 'There are no blog posts to show right now. Check back later or add new content to keep your feed fresh.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-800/80 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.14),transparent_35%)] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-blue-300/80">Stay updated</p>
          <h2 className="mt-4 text-4xl font-bold text-white sm:text-5xl">Never miss the next article.</h2>
          <p className="mt-4 text-slate-300 leading-8">Subscribe to receive fresh tutorials, product stories, and developer tips directly in your inbox.</p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row items-center justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full min-w-65 rounded-3xl border border-slate-700/80 bg-slate-950/90 px-5 py-4 text-slate-100 placeholder:text-slate-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
            />
            <button
              className="w-full min-w-45 rounded-3xl px-6 py-4 text-sm font-semibold text-white shadow-lg transition duration-300 hover:opacity-95"
              style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))', boxShadow: '0 12px 40px rgba(124,58,237,0.08)'}}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blog;