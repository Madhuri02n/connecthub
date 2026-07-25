import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const MainLayout = () => (
  <div className="min-h-screen bg-paper-100 dark:bg-ink-950">
    <Navbar />
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Outlet />
    </main>
  </div>
);
