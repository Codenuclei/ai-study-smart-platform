'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, LogOut, Settings, Menu, X } from 'lucide-react';

export function DashboardHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            StudyAI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition">
            Dashboard
          </Link>
          <Link href="/dashboard/materials" className="text-sm font-medium hover:text-primary transition">
            Materials
          </Link>
          <Link href="/dashboard/analytics" className="text-sm font-medium hover:text-primary transition">
            Analytics
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                {session?.user?.name || 'Account'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOut({ redirectTo: '/auth/login' })}
                className="cursor-pointer text-destructive focus:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background px-4 py-4 sm:px-6 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition">
              Dashboard
            </Link>
            <Link href="/dashboard/materials" className="text-sm font-medium hover:text-primary transition">
              Materials
            </Link>
            <Link href="/dashboard/analytics" className="text-sm font-medium hover:text-primary transition">
              Analytics
            </Link>
            <div className="border-t border-border/40 pt-3 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => signOut({ redirectTo: '/auth/login' })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
