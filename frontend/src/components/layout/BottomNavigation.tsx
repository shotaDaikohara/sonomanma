import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Home, Search, MessageCircle, Calendar, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'ホーム',
      active: router.pathname === '/',
    },
    {
      href: '/search',
      icon: Search,
      label: '検索',
      active: router.pathname === '/search',
    },
    ...(isAuthenticated ? [
      {
        href: '/messages',
        icon: MessageCircle,
        label: 'メッセージ',
        active: router.pathname === '/messages',
      },
      {
        href: '/bookings',
        icon: Calendar,
        label: '予約',
        active: router.pathname === '/bookings',
      },
      {
        href: '/profile',
        icon: User,
        label: 'プロフィール',
        active: router.pathname === '/profile',
      },
    ] : [
      {
        href: '/login',
        icon: User,
        label: 'ログイン',
        active: router.pathname === '/login' || router.pathname === '/register',
      },
    ]),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 touch-manipulation no-tap-highlight ${
                item.active
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${item.active ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-xs truncate ${item.active ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;