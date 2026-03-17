'use client';

import Link from 'next/link';
import { Building2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/properties', label: 'Tất cả bất động sản' },
  { href: '/about', label: 'Về chúng tôi' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const isAdmin = true;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-blue-900" />
          <span className="text-xl font-bold text-slate-900">BĐS Premium</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-700 hover:text-blue-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin/properties">
              <Button className="bg-blue-900 hover:bg-blue-800">Quản lý</Button>
            </Link>
          )}
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-slate-700 hover:text-blue-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin/properties" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-blue-900 hover:bg-blue-800">Quản lý</Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
