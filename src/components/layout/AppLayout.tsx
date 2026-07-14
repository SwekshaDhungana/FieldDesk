import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F5FAFD]">
      <Sidebar />
      <main className="ml-56 min-h-screen p-6">
        <Outlet />
      </main>
    </div>
  );
}
