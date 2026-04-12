'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  FileText,
  BookMarked,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/materials', label: 'Study Materials', icon: FileText },
  { href: '/dashboard/summaries', label: 'Summaries', icon: BookMarked },
  { href: '/dashboard/quizzes', label: 'Quizzes', icon: FileText },
  { href: '/dashboard/flashcards', label: 'Flashcards', icon: BookMarked },
  { href: '/dashboard/chatbot', label: 'Study Chatbot', icon: MessageSquare },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border/40 bg-muted/30">
      <div className="flex-1 overflow-auto py-6 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-l-2 border-l-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border/40 p-4">
        <div className="text-xs text-muted-foreground text-center">
          <p className="font-semibold mb-1">Pro Tip</p>
          <p>Upload your notes to get instant AI summaries and quizzes!</p>
        </div>
      </div>
    </aside>
  );
}
