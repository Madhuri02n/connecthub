import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
    <div className="w-full max-w-sm">
      <Link to="/login" className="mb-8 block text-center font-display text-3xl font-semibold text-paper-100">
        Connect<span className="text-safelight-500">Hub</span>
      </Link>
      <div className="contact-frame p-6">
        <Outlet />
      </div>
    </div>
  </div>
);
