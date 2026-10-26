import { Link } from 'react-router-dom';
import { Clock, MessageSquare, Heart } from 'lucide-react';
import { formatDate } from './ui.jsx';

/** Editorial card used on the home feed. */
export default function PostRow({ post, onCategory }) {
  return (
    <article className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      {/* Card Header: Category and Date */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onCategory?.(post.category)}
          className="text-xs font-bold uppercase tracking-wider text-brand hover:opacity-80 transition-opacity"
        >
          {post.category}
        </button>
        <span className="text-xs font-medium text-gray-400">
          {formatDate(post.createdAt)}
        </span>
      </div>

      {/* Card Body: Title and Excerpt */}
      <h2 className="mb-3 text-xl font-bold leading-snug text-gray-900 group-hover:text-brand transition-colors">
        <Link to={`/posts/${post.id}`} className="block">
          {post.title}
        </Link>
      </h2>

      <p className="mb-6 font-serif text-[1rem] leading-relaxed text-gray-600 flex-grow">
        {post.excerpt}
      </p>

      {/* Card Footer: Author and Stats */}
      <div className="mt-auto pt-4 border-t border-gray-50 flex flex-wrap items-center justify-between text-sm text-gray-500">
        <span className="font-medium text-gray-800">
          {post.authorUsername}
        </span>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5" title={`${post.readTimeMinutes} min read`}>
            <Clock className="h-4 w-4" aria-hidden="true" /> {post.readTimeMinutes}
          </span>
          <span className="flex items-center gap-1.5" title={`${post.commentCount} comments`}>
            <MessageSquare className="h-4 w-4" aria-hidden="true" /> {post.commentCount}
          </span>
          <span className="flex items-center gap-1.5" title={`${post.likeCount || 0} likes`}>
            <Heart className="h-4 w-4" aria-hidden="true" /> {post.likeCount || 0}
          </span>
        </div>
      </div>
    </article>
  );
}