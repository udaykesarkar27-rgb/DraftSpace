import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-20">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="mt-2 text-ink-soft">The address may be mistyped, or the page may have moved.</p>
      <Link to="/" className="btn-primary mt-6">
        Go to the home feed
      </Link>
    </div>
  );
}
