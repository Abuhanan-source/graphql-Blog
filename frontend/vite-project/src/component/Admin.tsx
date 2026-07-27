import { useEffect, useState } from "react";

/* ---------------------------------- API ---------------------------------- */

const ENDPOINT = `${import.meta.env.VITE_API_URL}/graphql`;

async function gql<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // sends the uid cookie set by Login
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message || "Request failed");
  return json.data;
}

/* --------------------------------- Types ---------------------------------- */

interface UserRow {
  _id: string;
  username: string;
  email: string;
  Role: string;
  Isbaned: boolean | null;
  createdAt: string;
}

interface BlogRow {
  _id: string;
  ProjectName: string;
  Describtion: string;
  ProjectLink: string;
  GithubLink: string;
  image?: string;
  BlogViews: { timestamps: string }[];
  createdAt: string;
}

interface CommentRow {
  _id: string;
  Comment: string;
  createdAt: string;
  UserComment?: { username: string; email: string };
}

interface ClickRecord {
  timestamps: number;
}

/* ------------------------------ Small pieces ------------------------------ */

function Badge({ label, value, tone = "neutral" }: { label: string; value: any; tone?: "neutral" | "success" | "danger" }) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      : tone === "danger"
      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
      : "bg-gray-500/10 text-gray-400 border-gray-500/30";
  const dotColor = tone === "success" ? "bg-emerald-400" : tone === "danger" ? "bg-rose-400" : "bg-gray-400";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono ${toneClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}:{String(value)}
    </span>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  tone = "neutral",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
}) {
  const toneClasses =
    tone === "accent"
      ? "border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
      : tone === "success"
      ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
      : tone === "warning"
      ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
      : tone === "danger"
      ? "border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
      : "border-gray-700 text-gray-200 hover:bg-gray-800";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${toneClasses}`}
    >
      {children}
    </button>
  );
}

function PanelHeader({ title, stat, right }: { title: string; stat: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 font-mono text-xs text-gray-500">{stat}</p>
      </div>
      {right}
    </div>
  );
}

const inputClasses =
  "rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

/* --------------------------------- Users ----------------------------------- */

const USERS_QUERY = `query Query { users { createdAt email updatedAt username _id Role Isbaned } }`;

const UPDATE_ROLE = `mutation UpdateUserRole($userId: String!, $Role: String!) {
  UpdateUserRole(userId: $userId, Role: $Role)
}`;
 
const BAN_USER = `mutation BanUser($userId: String!, $Isbaned: Boolean!) {
  UpdateBanedStatus(userId: $userId, Baned: $Isbaned)
}`;


function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    gql<{ users: UserRow[] }>(USERS_QUERY)
      .then((data) => setUsers(data.users ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (userId: string, Role: string) => {
    setPending(userId);
    try {
      await gql(UPDATE_ROLE, { userId, Role });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, Role } : u)));
    } catch (err: any) {
      alert(`Couldn't update role — backend mutation may be missing.\n${err.message}`);
    } finally {
      setPending(null);
    }
  };

  const toggleBan = async (u: UserRow) => {
    const next = !u.Isbaned;
    setPending(u._id);
    try {
      await gql(BAN_USER, { userId: u._id, Isbaned: next });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, Isbaned: next } : x)));
    } catch (err: any) {
      alert(`Couldn't update ban status — backend mutation may be missing.\n${err.message}`);
    } finally {
      setPending(null);
    }
  };

  const filtered = users.filter(
    (u) => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PanelHeader
        title="Users"
        stat={loading ? "loading…" : `${users.length} total · ${users.filter((u) => u.Isbaned).length} banned`}
        right={
          <input
            className={inputClasses}
            placeholder="Search username or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
          Couldn't load users: {error}
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">User</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Role</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-900/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-100">{u.username}</div>
                    <div className="font-mono text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={`${inputClasses} py-1.5`}
                      value={u.Role}
                      disabled={pending === u._id}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label="banned" value={!!u.Isbaned} tone={u.Isbaned ? "danger" : "success"} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Btn tone={u.Isbaned ? "success" : "warning"} disabled={pending === u._id} onClick={() => toggleBan(u)}>
                      {u.Isbaned ? "Unban" : "Ban"}
                    </Btn>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    No users match that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Blogs ----------------------------------- */

const BLOGS_QUERY = `
  query Blogs {
    Blogs { _id ProjectName Describtion ProjectLink GithubLink image BlogViews { timestamps } createdAt }
  }
`;
const DELETE_BLOG = `mutation DeleteUserBlog($BlogID: String!) { DeleteUserBlog(BlogID: $BlogID) }`;

function BlogsTab({ onViewAnalytics }: { onViewAnalytics: (id: string, name: string) => void }) {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    gql<{ Blogs: BlogRow[] }>(BLOGS_QUERY)
      .then((data) => setBlogs(data.Blogs ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (blog: BlogRow) => {
    if (!confirm(`Delete "${blog.ProjectName}"? This can't be undone.`)) return;
    setPending(blog._id);
    try {
      await gql(DELETE_BLOG, { BlogID: blog._id });
      setBlogs((prev) => prev.filter((b) => b._id !== blog._id));
    } catch (err: any) {
      alert(`Couldn't delete project.\n${err.message}`);
    } finally {
      setPending(null);
    }
  };

  const filtered = blogs.filter((b) => b.ProjectName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PanelHeader
        title="Blogs / Projects"
        stat={loading ? "loading…" : `${blogs.length} total`}
        right={
          <input className={inputClasses} placeholder="Search projects" value={search} onChange={(e) => setSearch(e.target.value)} />
        }
      />

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
          Couldn't load projects: {error}
        </p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <div key={b._id} className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50">
              {b.image && <img src={b.image} alt="" className="h-32 w-full object-cover" />}
              <div className="p-4">
                <h3 className="font-semibold text-gray-100">{b.ProjectName}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-400">{b.Describtion}</p>
                <div className="mt-2 flex gap-3 font-mono text-xs">
                  <a href={b.GithubLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                    github
                  </a>
                  <a href={b.ProjectLink} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                    live
                  </a>
                </div>
                <p className="mt-2 font-mono text-xs text-gray-500">
                  {b.BlogViews?.length ?? 0} views · added {new Date(b.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                  <Btn tone="accent" onClick={() => onViewAnalytics(b._id, b.ProjectName)}>
                    View stats
                  </Btn>
                  <Btn tone="danger" disabled={pending === b._id} onClick={() => remove(b)}>
                    Delete
                  </Btn>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-500">No projects match that search.</p>}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Comments --------------------------------- */

const BLOGS_LIST_QUERY = `query Blogs { Blogs { _id ProjectName } }`;
const COMMENTS_QUERY = `
  query Comments($BlogID: String!) {
    getCurrentUserComment(BlogID: $BlogID) { _id Comment createdAt UserComment { username email } }
  }
`;


// NOTE: not in the schema yet — see the bottom of this file.
const DELETE_COMMENT = `mutation DeleteComment($commentId: String!) {
  CommentDeleted(CommentId: $commentId)
}`;


function CommentsTab() {
  const [blogs, setBlogs] = useState<{ _id: string; ProjectName: string }[]>([]);
  const [blogId, setBlogId] = useState("");
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    gql<{ Blogs: { _id: string; ProjectName: string }[] }>(BLOGS_LIST_QUERY).then((data) => {
      const list = data.Blogs ?? [];
      setBlogs(list);
      if (list.length) setBlogId(list[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!blogId) return;
    setLoading(true);
    setError("");
    gql<{ getCurrentUserComment: CommentRow[] }>(COMMENTS_QUERY, { BlogID: blogId })
      .then((data) => setComments(data.getCurrentUserComment ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [blogId]);

  const remove = async (commentId: string) => {
    if (!confirm("Remove this comment?")) return;
    setPending(commentId);
    try {
      await gql(DELETE_COMMENT, { commentId });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err: any) {
      alert(`Couldn't remove comment — backend mutation may be missing.\n${err.message}`);
    } finally {
      setPending(null);
    }
  };

  return (
    <div>
      <PanelHeader
        title="Comments"
        stat={loading ? "loading…" : `${comments.length} on this project`}
        right={
          <select className={inputClasses} value={blogId} onChange={(e) => setBlogId(e.target.value)}>
            {blogs.map((b) => (
              <option key={b._id} value={b._id}>
                {b.ProjectName}
              </option>
            ))}
          </select>
        }
      />

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
          Couldn't load comments: {error}
        </p>
      )}

      {!loading && !error && (
        <ul className="flex flex-col gap-3">
          {comments.map((c) => (
            <li
              key={c._id}
              className="flex items-start justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3"
            >
              <div>
                <div className="font-medium text-gray-100">{c.UserComment?.username ?? "Unknown user"}</div>
                <p className="mt-1 text-sm text-gray-300">{c.Comment}</p>
                <p className="mt-1 font-mono text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
              </div>
              <Btn tone="danger" disabled={pending === c._id} onClick={() => remove(c._id)}>
                Remove
              </Btn>
            </li>
          ))}
          {comments.length === 0 && <p className="text-sm text-gray-500">No comments on this project yet.</p>}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------- Analytics --------------------------------- */

const VIEWS_QUERY = `
  query Views($id: String!) {
    getViews(id: $id) { projecturlClickHistory { timestamps } giturlClickHistory { timestamps } }
  }
`;

function groupByDay(records: ClickRecord[]): [string, number][] {
  const counts: Record<string, number> = {};
  for (const r of records) {
    const d = new Date(r.timestamps);
    const key = isNaN(d.getTime()) ? "unknown" : d.toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
}

function Bars({ data, tone }: { data: [string, number][]; tone: "blue" | "purple" }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  const barColor = tone === "blue" ? "bg-blue-500" : "bg-purple-500";

  return (
    <div className="mt-3 flex h-32 items-end gap-1.5">
      {data.length === 0 && <p className="text-sm text-gray-500">No clicks recorded yet.</p>}
      {data.map(([day, n]) => (
        <div key={day} className="flex h-full flex-1 flex-col items-center justify-end">
          <div
            className={`w-full rounded-t ${barColor}`}
            style={{ height: `${(n / max) * 100}%`, minHeight: 2 }}
            title={`${n} on ${day}`}
          />
          <span className="mt-1 font-mono text-[9px] text-gray-500">{day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsTab({ selected, onSelect }: { selected: { id: string; name: string }; onSelect: (id: string, name: string) => void }) {
  const [blogs, setBlogs] = useState<{ _id: string; ProjectName: string }[]>([]);
  const [data, setData] = useState<{ projecturlClickHistory: ClickRecord[]; giturlClickHistory: ClickRecord[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    gql<{ Blogs: { _id: string; ProjectName: string }[] }>(BLOGS_LIST_QUERY).then((res) => {
      const list = res.Blogs ?? [];
      setBlogs(list);
      if (!selected?.id && list.length) onSelect(list[0]._id, list[0].ProjectName);
    });
  }, []);

  useEffect(() => {
    if (!selected?.id) return;
    setLoading(true);
    setError("");
    gql<{ getViews: any }>(VIEWS_QUERY, { id: selected.id })
      .then((res) => setData(res.getViews))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selected?.id]);

  return (
    <div>
      <PanelHeader
        title="Click analytics"
        stat={selected?.name ?? "select a project"}
        right={
          <select
            className={inputClasses}
            value={selected?.id ?? ""}
            onChange={(e) => {
              const b = blogs.find((x) => x._id === e.target.value);
              if (b) onSelect(b._id, b.ProjectName);
            }}
          >
            {blogs.map((b) => (
              <option key={b._id} value={b._id}>
                {b.ProjectName}
              </option>
            ))}
          </select>
        }
      />

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
          Couldn't load analytics: {error}
        </p>
      )}

      {!loading && !error && data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
            <h3 className="text-sm font-medium text-gray-200">Project link clicks</h3>
            <p className="font-mono text-xs text-gray-500">{data.projecturlClickHistory.length} total</p>
            <Bars data={groupByDay(data.projecturlClickHistory)} tone="blue" />
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
            <h3 className="text-sm font-medium text-gray-200">GitHub link clicks</h3>
            <p className="font-mono text-xs text-gray-500">{data.giturlClickHistory.length} total</p>
            <Bars data={groupByDay(data.giturlClickHistory)} tone="purple" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- Admin ----------------------------------- */

const NAV = [
  { key: "users", label: "Users" },
  { key: "blogs", label: "Blogs" },
  { key: "comments", label: "Comments" },
  { key: "analytics", label: "Analytics" },
] as const;

function Admin() {
  const [tab, setTab] = useState<(typeof NAV)[number]["key"]>("users");
  const [analyticsTarget, setAnalyticsTarget] = useState({ id: "", name: "" });

  const goToAnalytics = (id: string, name: string) => {
    setAnalyticsTarget({ id, name });
    setTab("analytics");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full bg-gray-950 text-gray-100">
      <aside className="w-56 shrink-0 border-r border-gray-800 bg-gray-900/40 p-4">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-linear-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
            A
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-gray-400">Admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                tab === n.key
                  ? "bg-linear-to-r from-blue-500/15 to-purple-500/15 text-white ring-1 ring-inset ring-blue-500/30"
                  : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {tab === "users" && <UsersTab />}
        {tab === "blogs" && <BlogsTab onViewAnalytics={goToAnalytics} />}
        {tab === "comments" && <CommentsTab />}
        {tab === "analytics" && (
          <AnalyticsTab selected={analyticsTarget} onSelect={(id, name) => setAnalyticsTarget({ id, name })} />
        )}
      </main>
    </div>
  );
}

export default Admin;

/* --------------------------------------------------------------------------
   Backend note: your resolvers/schema cover everything this file calls
   except three mutations — UpdateUserRole, BanUser, DeleteComment — which
   aren't defined yet. Those buttons will show an error toast until you add:

   schema.js (inside `type Mutation { ... }`):
     UpdateUserRole(userId: String!, Role: String!): String!
     BanUser(userId: String!, Isbaned: Boolean!): String!
     DeleteComment(commentId: String!): String!

   resolvers.js (inside `Mutation: { ... }`):
     UpdateUserRole: async (_, { userId, Role }, { user }) => {
       if (!user || user.role !== "Admin") throw new Error("Unauthorized!");
       await User.findByIdAndUpdate(userId, { Role });
       return "Role updated!";
     },
     BanUser: async (_, { userId, Isbaned }, { user }) => {
       if (!user || user.role !== "Admin") throw new Error("Unauthorized!");
       await User.findByIdAndUpdate(userId, { Isbaned });
       return Isbaned ? "User banned!" : "User unbanned!";
     },
     DeleteComment: async (_, { commentId }, { user }) => {
       if (!user) throw new Error("Unauthorized!");
       await Comment.findByIdAndDelete(commentId);
       return "Comment deleted!";
     },

   Also fix the Isbaned-null crash you're seeing: your schema marks
   `Isbaned: Boolean!` (non-nullable) but some user documents in the DB
   don't have that field set, so GraphQL throws instead of returning data.
   Either backfill the data:
     db.users.updateMany({ Isbaned: { $exists: false } }, { $set: { Isbaned: false } })
   and add `Isbaned: { type: Boolean, default: false }` to UserSchema.js,
   or make the schema field nullable (`Isbaned: Boolean`) as a quick fix.
-------------------------------------------------------------------------- */