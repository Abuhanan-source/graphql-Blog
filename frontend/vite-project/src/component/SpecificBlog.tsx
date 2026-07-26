import { useLazyQuery, useMutation } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Comments from './Comments';
import { CURRENT_BLOGS_QUERY, viewCounter } from '../services/queries';
import { linkQuery, projectQuery } from '../services/mutations';

function SpecificBlog() {
  const { BlogId } = useParams<{ BlogId: string }>();
  

  const [blog, setBlog] = useState<{
    ProjectName: string;
    Describtion: string;
    GithubLink: string;
    image: string;
    ProjectLink: string;
    createdAt: string;
    BlogOwner :{
      _id:String
      username:String
    }
  } | null>(null);


  const [BlogTrigger,{loading,error}] = useLazyQuery<any>(CURRENT_BLOGS_QUERY);
  const [ViewMeasure] = useLazyQuery<any>(viewCounter);
   const [GitAddviewExecute] = useMutation<any>(linkQuery);
   const [ProjectAddviewExecute] = useMutation<any>(projectQuery);
   const [gitView,setgitView] = useState([])
   const [projectView,setprojectView] = useState([])

   const myprojectview = async ()=>{
    try {
      const {data} = await ViewMeasure({ variables: { getViewsId: BlogId } });
      setgitView(data.getViews.giturlClickHistory)
      setprojectView(data.getViews.projecturlClickHistory)
    } catch (error:any) {
      alert(error?.message)
      console.log(error);
    }
   }


  useEffect(() => {
    const fetchCurrentBlog = async (): Promise<void> => {
      if (!BlogId) return;

      try {
        myprojectview()

        const result = await BlogTrigger({ variables: { id: BlogId } });
        const data = result && 'data' in result ? result.data : undefined;
        console.log(data);
        

        if (data && data.CurrentBlog) {
          setBlog(data.CurrentBlog);
        }
      } catch (err: any) {
        console.error('Error fetching current blog:', err);
        alert(err.message || 'Failed to fetch current blog');
      }
    };

    fetchCurrentBlog();
  }, [BlogId, BlogTrigger]);

  const formatDate = (value: string) => {
    if (!value) return 'Recently added';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Recently added';

    return date.toLocaleDateString('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen px-4 pt-24 py-10 sm:px-6 lg:px-8" style={{ background: 'var(--bg-color)' }}>
      <div className="mx-auto max-w-4xl">
        {blog ? (
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)]">
            <div style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }} className="px-8 py-10 sm:px-10">
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
                Project Spotlight
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {blog.ProjectName}
              </h1>
              <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Author - {blog.BlogOwner.username}
              </h3>
              <p className="mt-3 text-sm text-white/90">
                Published on {formatDate(blog.createdAt)}
              </p>
            </div>

            <div className="space-y-8 p-8 sm:p-10" style={{ background: 'var(--bg-color)' }}>
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <div className="relative h-72 overflow-hidden sm:h-80" style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_45%)]" />
                  <div className="absolute right-6 top-6 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                    Featured Image
                  </div>
                  {(blog?.image)
                  ?
                  <img src={blog?.image} width={"100%"} alt={blog?.ProjectName} />:
                  <svg viewBox="0 0 600 400" className="relative h-full w-full p-6">
                    <rect x="70" y="90" width="460" height="220" rx="24" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                    <rect x="100" y="120" width="180" height="110" rx="16" fill="rgba(255,255,255,0.95)" />
                    <rect x="310" y="120" width="170" height="24" rx="10" fill="rgba(255,255,255,0.9)" />
                    <rect x="310" y="156" width="140" height="16" rx="8" fill="rgba(255,255,255,0.7)" />
                    <rect x="310" y="182" width="120" height="16" rx="8" fill="rgba(255,255,255,0.7)" />
                    <rect x="100" y="250" width="380" height="32" rx="16" fill="rgba(15,23,42,0.22)" />
                    <circle cx="460" cy="180" r="56" fill="rgba(255,255,255,0.2)" />
                    <path d="M430 182l20 20 38-42" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>}
                </div>
                <div className="flex items-center justify-between border-t border-white/6 px-5 py-4" style={{ background: 'var(--bg-color)' }}>
                  <div>
                    <p className="text-sm font-semibold text-white">Project preview</p>
                    <p className="text-sm text-slate-400">{blog.ProjectName}</p>
                  </div>
                  <span className="rounded-full bg-[rgba(255,255,255,0.03)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    Visual Story
                  </span>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white">About this project</h2>
                <p className="mt-3 whitespace-pre-line text-base leading-8 text-slate-400">
                  {blog.Describtion}
                </p>
              </section>

              <div className="flex flex-wrap gap-3">
                {blog.ProjectLink ? (
                  <>
                  <span className="inline-flex items-center gap-1.5">
                       👁️ {projectView.length} Views{projectView.length === 1 ? '' : 's'}
                  </span>
                  <a
                    href={blog.ProjectLink}
                    target="_blank"
                    onClick={()=>(ProjectAddviewExecute({
                      variables:{
                        link:blog.ProjectLink
                      }
                    }))}
                    rel="noreferrer"
                    className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition"
                    style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
                  >
                    View Project
                  </a>
                  </>
                ) : null}

                {blog.GithubLink ? (
                  <>
                  <a
                    href={blog.GithubLink}
                    onClick={()=>(GitAddviewExecute({
                      variables:{
                        link:blog.GithubLink
                      }
                    }))}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/6 px-5 py-2.5 text-sm font-medium text-white transition"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    GitHub Repository
                  </a>
                  <span className="inline-flex items-center gap-1.5">
                      👁️ {gitView.length} comment{gitView.length === 1 ? '' : 's'}
                    </span>
                  
                  </>
                ) : null}
              </div>

              {BlogId && <Comments blogId={BlogId} />}
            </div>
          </article>
        ) : loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-medium text-slate-700">Loading blog...</p>
            <p className="mt-2 text-sm text-slate-500">Please wait while the project details load.</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-medium text-slate-700">{error?.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpecificBlog;