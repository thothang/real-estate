'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, Chrome as Home, FileText, MessageSquare, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { clearAccessToken, getAccessToken } from '@/lib/apiClient';

const sidebarLinks = [
  { href: '/admin/properties', label: 'Quản lý tin đăng', icon: FileText },
  { href: '/admin/contacts', label: 'Yêu cầu liên hệ', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    clearAccessToken();
    router.replace('/admin/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 text-white transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold">Admin Panel</span>
          </Link>
          <Button
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="space-y-2 px-3 py-6">
          <Link href="/">
            <Button
              className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Home className="mr-3 h-5 w-5" />
              Trang chủ
            </Button>
          </Link>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);

            return (
              <Link key={link.href} href={link.href}>
                <Button
                  className={cn(
                    'w-full justify-start',
                    isActive
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <Button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600">
              Xin chào, <span className="font-semibold text-slate-900">Admin</span>
            </div>
            <Button onClick={handleLogout} className="border border-input bg-background text-black-600 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
              Đăng xuất
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
