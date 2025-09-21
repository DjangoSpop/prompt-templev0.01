'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Library,
  Users,
  CreditCard,
  LogOut,
  Settings,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    name: 'AI Assistant',
    href: '/assistant-full',
    icon: Bot,
  },
  {
    name: 'Library',
    href: '/library',
    icon: Library,
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users,
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout API fails
      router.push('/auth/login');
    }
  };

  return (
    <div className={cn('flex h-full w-64 flex-col bg-bg-secondary', className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-brand flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-text-primary font-semibold text-lg">Forge</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-bg-floating text-text-primary'
                      : 'text-interactive-normal hover:text-interactive-hover hover:bg-bg-tertiary'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-interactive-normal hover:text-interactive-hover"
            asChild
          >
            <Link href="/settings">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-interactive-normal hover:text-red"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}