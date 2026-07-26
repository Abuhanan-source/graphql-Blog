import { useLazyQuery, useMutation } from '@apollo/client/react';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { DASHBOARAD_QUARY } from '../services/queries';
import { DELETEBLOG } from '../services/mutations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface BlogPost {
  _id: string;
  ProjectName: string;
  Describtion: string;
  createdAt: string;
  image: string;
  BlogViews: {
    user: string;
    timestamps: number;
  }[];
}

interface BlogsQueryData {
  BlogDashboard: BlogPost[];
}

const parseDate = (createdAt: string): Date => {
  const asNumber = Number(createdAt);
  return isNaN(asNumber) ? new Date(createdAt) : new Date(asNumber);
};

const BAR_COLORS = [
  'rgba(139,92,246,0.85)',
  'rgba(99,102,241,0.85)',
  'rgba(168,85,247,0.85)',
  'rgba(79,70,229,0.85)',
  'rgba(124,58,237,0.85)',
  'rgba(109,40,217,0.85)',
];

const BAR_HOVER_COLORS = [
  'rgba(167,139,250,1)',
  'rgba(129,140,248,1)',
  'rgba(192,132,252,1)',
  'rgba(99,102,241,1)',
  'rgba(167,139,250,1)',
  'rgba(139,92,246,1)',
];

const PILL_COLORS = [
  'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
];

function Dashboard() {
  const user = useSelector((state: any) => state.auth?.user);
  const [execute, { loading }] = useLazyQuery<BlogsQueryData>(DASHBOARAD_QUARY);
  const [deleteExecute] = useMutation<any>(DELETEBLOG);
  const [myBlogs, setMyBlogs] = useState<BlogPost[]>([]);
  const navigator = useNavigate();

  const DeleteBlog = async (blogid: string) => {
    try {
      await deleteExecute({
        variables: { blogId: blogid },
      });

      // Delete confirm hote hi list se turant hata do — refetch ki zaroorat nahi
      setMyBlogs((prev) => prev.filter((b) => b._id !== blogid));
    } catch (error: any) {
      console.log(error);
      alert(error?.message || 'Network error');
    }
  };

  useEffect(() => {
    const blogexecute = async () => {
      const { data } = await execute();
      setMyBlogs(data?.BlogDashboard ?? []);
    };

    blogexecute();
  }, [user]);

  const totalViews = myBlogs.reduce(
    (sum, blog) => sum + (blog.BlogViews?.length || 0), 0
  );

  const mostViewedBlog = myBlogs.reduce(
    (max, blog) =>
      (blog.BlogViews?.length || 0) > (max?.BlogViews?.length || 0) ? blog : max,
    myBlogs[0]
  );

  const activityData = useMemo(() => ({
    labels: myBlogs.map((blog) =>
      blog.ProjectName.length > 12
        ? blog.ProjectName.slice(0, 12) + '…'
        : blog.ProjectName
    ),
    datasets: [
      {
        label: 'Views',
        data: myBlogs.map((blog) => blog.BlogViews?.length || 0),
        backgroundColor: myBlogs.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
        hoverBackgroundColor: myBlogs.map((_, i) => BAR_HOVER_COLORS[i % BAR_HOVER_COLORS.length]),
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 52,
        barThickness: 'flex' as const,
      },
    ],
  }), [myBlogs]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeInOutQuart' as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,18,36,0.97)',
        borderColor: 'rgba(139,92,246,0.35)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 12,
        titleColor: '#a78bfa',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyColor: '#94a3b8',
        bodyFont: { size: 12 },
        callbacks: {
          title: (items: any) => myBlogs[items[0]?.dataIndex]?.ProjectName ?? '',
          label: (context: any) => {
            const blog = myBlogs[context.dataIndex];
            const date = blog?.createdAt
              ? parseDate(blog.createdAt).toLocaleDateString('en-GB')
              : '';
            return [
              `  👁  Views : ${blog?.BlogViews?.length || 0}`,
              `  📅 Created : ${date}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 11 }, padding: 8 },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...myBlogs.map((b) => b.BlogViews?.length || 0), 1) + 2,
        ticks: { color: '#64748b', stepSize: 1, precision: 0, font: { size: 11 }, padding: 10 },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false, dash: [4, 4] },
      },
    },
  };

  return (
    <div
      className="min-h-screen px-4 pt-24 py-10 sm:px-6 lg:px-8"
      style={{ background: 'var(--bg-color)' }}
    >
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── Profile Header ── */}
        <section className="rounded-4xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-8 backdrop-blur-2xl sm:p-10"
          style={{ boxShadow: '0 0 0 1px rgba(139,92,246,0.08), 0 30px 80px rgba(2,6,23,0.5)' }}>
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=6C5CE7&color=fff&size=128`}
                  alt="avatar"
                  className="h-20 w-20 rounded-2xl object-cover"
                  style={{ boxShadow: '0 0 0 3px rgba(139,92,246,0.3)' }}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-(--bg-color)" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
                  Dashboard
                </p>
                <h1 className="mt-1.5 text-2xl font-bold text-white sm:text-3xl">
                  {user?.username || 'friend'} 👋
                </h1>
                <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/Create-Blog"
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,var(--primary-color),var(--secondary-color))' }}
              >
                + New Blog
              </Link>
              <Link
                to="/Blogs"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
              >
                Browse Blogs
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats Cards ── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Posts */}
          <div className="rounded-2xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-6 relative overflow-hidden group hover:border-violet-500/30 transition">
            <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Total Posts
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              {loading ? '—' : myBlogs.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Published blogs</p>
            <div className="mt-4 h-1 w-12 rounded-full bg-violet-500/60" />
          </div>

          {/* Total Views */}
          <div className="rounded-2xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-6 relative overflow-hidden group hover:border-indigo-500/30 transition">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Total Views
            </p>
            <p className="mt-3 text-4xl font-bold text-white">
              {loading ? '—' : totalViews}
            </p>
            <p className="mt-1 text-xs text-slate-500">Across all blogs</p>
            <div className="mt-4 h-1 w-12 rounded-full bg-indigo-500/60" />
          </div>

          {/* Most Viewed */}
          <div className="rounded-2xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-6 relative overflow-hidden group hover:border-fuchsia-500/30 transition">
            <div className="absolute inset-0 bg-linear-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Top Blog
            </p>
            <p className="mt-3 text-lg font-bold text-white line-clamp-1">
              {loading ? '—' : mostViewedBlog?.ProjectName || '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {loading ? '' : `${mostViewedBlog?.BlogViews?.length || 0} views`}
            </p>
            <div className="mt-4 h-1 w-12 rounded-full bg-fuchsia-500/60" />
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-6 relative overflow-hidden group hover:border-emerald-500/30 transition">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Status
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-2xl font-bold text-emerald-400">Active</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">{user?.username}</p>
            <div className="mt-4 h-1 w-12 rounded-full bg-emerald-500/60" />
          </div>
        </section>

        {/* ── Chart ── */}
        <section className="rounded-[28px] border border-white/6 bg-[rgba(255,255,255,0.02)] p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-white">Blog Views Overview</h2>
              <p className="text-sm mt-1 text-slate-500">
                Unique view count per blog post
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/6 bg-white/2 w-fit">
              <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
              <span className="text-xs text-slate-400 font-medium">Total views</span>
              <span className="ml-1 text-xs font-bold text-white">
                {loading ? '—' : totalViews}
              </span>
            </div>
          </div>

          <div className="relative h-70 rounded-2xl border border-white/4 bg-[rgba(255,255,255,0.01)] px-4 pt-4 pb-2">
            {loading ? (
              <div className="flex items-center justify-center h-full gap-3">
                <div className="w-3 h-3 rounded-full bg-violet-500 animate-bounce [animation-delay:0ms]" />
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms]" />
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce [animation-delay:300ms]" />
              </div>
            ) : activityData.labels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="text-4xl">📊</div>
                <p className="text-sm text-slate-400 text-center">
                  No data yet.{' '}
                  <Link to="/Create-Blog" className="text-violet-400 hover:underline">
                    Create your first blog
                  </Link>{' '}
                  to see the chart.
                </p>
              </div>
            ) : (
              <Bar data={activityData} options={chartOptions} />
            )}
          </div>

          {/* Pills */}
          {!loading && myBlogs.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {myBlogs.map((blog, i) => (
                <Link
                  key={blog._id}
                  to={`/Blogs/${blog._id}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition hover:opacity-80 ${PILL_COLORS[i % PILL_COLORS.length]}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {blog.ProjectName.length > 18
                    ? blog.ProjectName.slice(0, 18) + '…'
                    : blog.ProjectName}
                  <span className="ml-1 opacity-60">
                    {blog.BlogViews?.length || 0} views
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Recent Posts ── */}
        <section className="rounded-[28px] border border-white/6 bg-[rgba(255,255,255,0.02)] p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Posts</h2>
            <Link
              to="/Blogs"
              className="text-xs text-violet-400 hover:text-violet-300 transition font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-white/6 bg-white/2 p-4 animate-pulse">
                    <div className="h-4 w-3/4 bg-white/5 rounded mb-3" />
                    <div className="h-3 w-full bg-white/5 rounded mb-2" />
                    <div className="h-3 w-2/3 bg-white/5 rounded" />
                  </div>
                ))}
              </>
            ) : myBlogs.length === 0 ? (
              <div className="col-span-3 text-center py-10">
                <p className="text-4xl mb-3">✍️</p>
                <p className="text-sm text-slate-400">No posts yet.</p>
                <Link to="/Create-Blog" className="text-violet-400 text-sm hover:underline mt-1 inline-block">
                  Create your first blog →
                </Link>
              </div>
            ) : (
              myBlogs.slice(0, 6).map((b, i) => (
                <div
        key={b._id}
        className="rounded-2xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-4 sm:p-5 transition hover:border-violet-500/40 hover:bg-white/4 group"
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PILL_COLORS[i % PILL_COLORS.length]}`}>
            #{i + 1}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            👁 {b.BlogViews?.length || 0}
          </span>
        </div>

        <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition line-clamp-1">
          {b.ProjectName}
        </h3>
        <p className="mt-2 text-xs leading-5 line-clamp-2 text-slate-500">
          {b.Describtion}
        </p>
        <p className="mt-3 text-xs text-slate-600">
          {b.createdAt ? parseDate(b.createdAt).toLocaleDateString('en-GB') : ''}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
          <button
            className="flex-1 min-w-20 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg transition hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,var(--primary-color),var(--secondary-color))' }}
            onClick={() => navigator(`/Blogs/${b._id}`)}
          >
            View
          </button>
          <button
            className="flex-1 min-w-20 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg transition hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,var(--primary-color),var(--secondary-color))' }}
            onClick={() => navigator(`/UpdateBlog/${b._id}`)}
          >
            Update
          </button>
          <button
            className="flex-1 min-w-20 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg transition hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,var(--primary-color),var(--secondary-color))' }}
            onClick={() => DeleteBlog(b._id.toString())}
          >
            Delete
          </button>
        </div>

      </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;