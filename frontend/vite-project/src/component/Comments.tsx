import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { COMMENTS_QUERY } from '../services/queries';
import { ADD_COMMENT_MUTATION } from '../services/mutations';


interface Comment {
  _id: string;
  Comment: string;
  createdAt: string;
  UserComment?: { _id: string; username: string; email: string } | null;
}

interface CommentsData {
  getCurrentUserComment: Comment[];
}

function Comments({ blogId }: { blogId: string }) {
  const user = useSelector((state: any) => state.auth?.user);
  const [text, setText] = useState('');

  const { data, loading, error, refetch } = useQuery<CommentsData>(COMMENTS_QUERY, {
    variables: { blogId },
    fetchPolicy: 'network-only',
  });
  const [addComment, { loading: posting, error: postError }] = useMutation(ADD_COMMENT_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await addComment({
        variables: {
          comment: text,
          blogOwner: blogId,
        },
      });
      setText('');
      await refetch();
    } catch (err: any) {
      console.error('Error adding comment:', err);
    }
  };

  const comments = data?.getCurrentUserComment ?? [];

  

  

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.02)] p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">
        Comments {comments.length > 0 && <span className="text-slate-400">({comments.length})</span>}
      </h2>

      {user?._id ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
          />
          {postError && <p className="text-sm text-red-400">{postError.message}</p>}
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow transition disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg,var(--primary-color),var(--secondary-color))' }}
          >
            {posting ? 'Posting...' : 'Post comment'}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          <Link to="/login" className="font-semibold text-violet-400 hover:text-violet-300">Log in</Link> to leave a comment.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-slate-400">Loading comments...</p>
        ) : error ? (
          <p className="text-sm text-slate-500">
            Comments aren't available right now.
          </p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-400">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments?.map((c) => (
            <div key={c._id} className="rounded-xl border border-white/6 bg-[rgba(255,255,255,0.02)] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{c.UserComment?.username || 'Anonymous'}</span>
                <span className="text-xs text-slate-400">
                  {c.createdAt ? new Date(Number(c.createdAt)).toLocaleDateString() : ''}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{c.Comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Comments;
