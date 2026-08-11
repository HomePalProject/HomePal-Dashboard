import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@components/layout/Sidebar';
import { Header } from '@components/layout/Header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="font-sans flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-16 md:p-32">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
