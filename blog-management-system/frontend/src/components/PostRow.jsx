import { Link } from 'react-router-dom';
import { Clock, MessageSquare } from 'lucide-react';
import { formatDate } from './ui.jsx';

/** Editorial list row used on the home feed. */
export default function PostRow({ post, onCategory }) {
  return (
    <article className="border-b border-line py-7 first:pt-0">
      <button
        type="button"
        onClick={() => onCategory?.(post.category)}
        className="text-sm font-medium text-brand hover:underline"
      >
        {post.category}
      </button>
      <h2 className="mt-1 text-2xl font-bold leading-snug sm:text-3xl">
        <Link to={`/posts/${post.id}`} className="hover:text-brand">
          {post.title}
        </Link>
      </h2>
      <p className="mt-2 max-w-2xl font-serif text-[1.05rem] leading-relaxed text-ink-soft">{post.excerpt}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-faint">
        <span>
          <span className="text-ink-soft">{post.authorUsername}</span> on {formatDate(post.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {post.readTimeMinutes} min read
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> {post.commentCount}
        </span>
      </div>
    </article>
  );
}
