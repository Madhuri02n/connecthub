import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
    <p className="label-mono mb-2">Frame not found</p>
    <h1 className="mb-4 font-display text-6xl font-semibold">404</h1>
    <p className="mb-6 text-sm text-ink-600 dark:text-paper-300/60">
      This page doesn't exist, or it may have been moved.
    </p>
    <Link to="/" className="btn-primary">Back to feed</Link>
  </div>
);
