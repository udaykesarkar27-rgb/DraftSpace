import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Clock, Pencil, Trash2, ArrowLeft, Share2, Heart } from 'lucide-react';
import { commentApi, postApi } from '../api/services.js';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner, ErrorNote, formatDate } from '../components/ui.jsx';

export default function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [shareText, setShareText] = useState('Share');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, c] = await Promise.all([postApi.get(id), commentApi.list(id)]);
      setPost(p);
      setComments(c);

      setLikeCount(p.likeCount || 0);
      setIsLiked(p.likedByCurrentUser || false);
    } catch (e) {
      setError(e.response?.status === 404 ? 'This post does not exist or was removed.' : getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = user && post && user.id === post.authorId;
  const canDeletePost = isOwner || isAdmin;

  const deletePost = async () => {
    if (!window.confirm('Delete this post and all of its comments?')) return;
    try {
      await postApi.remove(post.id);
      navigate('/');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosting(true);
    setCommentError('');
    try {
      const c = await commentApi.add(id, draft.trim());
      setComments((prev) => [...prev, c]);
      setDraft('');
    } catch (err) {
      setCommentError(getErrorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentApi.remove(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setCommentError(getErrorMessage(err));
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareText('Copied!');
      setTimeout(() => setShareText('Share'), 2000);
    } catch (err) {
      console.error('Failed to copy the link: ', err);
      alert('Failed to copy link. Please copy the URL from your address bar.');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert("Please log in to like this post.");
      navigate('/login', { state: { from: `/posts/${id}` } });
      return;
    }

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      await postApi.toggleLike(id);
    } catch (error) {
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
      console.error("Failed to toggle like", error);
      setError("Failed to like the post. Please try again.");
    }
  };

  if (loading) return <Spinner label="Loading post" />;

  if (error) {
    return (
      <div className="max-w-xl">
        <ErrorNote>{error}</ErrorNote>
        <Link to="/" className="btn-ghost mt-4">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to all posts
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl">
      <Link to="/" className="btn-quiet -ml-2 mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All posts
      </Link>

      <p className="text-sm font-medium text-brand">{post.category}</p>
      <h1 className="mt-1 text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-faint">
        <span>
          By <span className="text-ink-soft">{post.authorUsername}</span> on {formatDate(post.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {post.readTimeMinutes} min read
        </span>
        {post.updatedAt !== post.createdAt && <span>Updated {formatDate(post.updatedAt)}</span>}
      </div>

      {(isOwner || canDeletePost) && (
        <div className="mt-4 flex gap-2">
          {isOwner && (
            <Link to={`/dashboard/edit/${post.id}`} className="btn-ghost">
              <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
            </Link>
          )}
          {canDeletePost && (
            <button onClick={deletePost} className="btn-ghost text-danger">
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
            </button>
          )}
        </div>
      )}

      <div className="prose prose-lg prose-slate mt-8 max-w-none font-serif prose-headings:font-sans prose-headings:tracking-tight prose-a:text-brand">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Action Buttons: Like and Share */}
      <div className="mt-8 flex gap-4 border-t border-line pt-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
            isLiked
              ? 'text-red-500 bg-red-50 hover:bg-red-100'
              : 'btn-quiet hover:bg-gray-100 text-ink-soft'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
          {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
        </button>

        <button
          onClick={handleShare}
          className="btn-quiet flex items-center gap-2 rounded-md hover:bg-gray-100 px-3 py-2 transition-colors text-ink-soft"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" /> {shareText}
        </button>
      </div>

      <section className="mt-8 border-t border-line pt-8" aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="text-xl font-bold">
          Comments ({comments.length})
        </h2>

        {isAuthenticated ? (
          <form onSubmit={submitComment} className="mt-4">
            <label htmlFor="comment" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="comment"
              rows={3}
              maxLength={2000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add to the conversation"
              className="input"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-faint">{draft.length}/2000</span>
              <button className="btn-primary" disabled={posting || !draft.trim()}>
                {posting ? 'Posting' : 'Post comment'}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 rounded-md bg-white px-4 py-3 text-sm text-ink-soft">
            <Link to="/login" state={{ from: `/posts/${id}` }} className="font-medium text-brand hover:underline">
              Log in
            </Link>{' '}
            or{' '}
            <Link to="/register" className="font-medium text-brand hover:underline">
              create an account
            </Link>{' '}
            to join the discussion.
          </p>
        )}
        {commentError && <div className="mt-3"><ErrorNote>{commentError}</ErrorNote></div>}

        <ul className="mt-6 divide-y divide-line">
          {comments.length === 0 && <li className="py-4 text-sm text-ink-faint">No comments yet. Be the first to reply.</li>}
          {comments.map((c) => (
            <li key={c.id} className="py-4">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-medium">{c.authorUsername}</span>{' '}
                  <span className="text-ink-faint">on {formatDate(c.createdAt)}</span>
                </span>
                {(isAdmin || user?.id === c.authorId) && (
                  <button onClick={() => deleteComment(c.id)} className="btn-quiet text-danger" aria-label="Delete comment">
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                  </button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[0.95rem] leading-relaxed">{c.content}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}