import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { User, LogOut, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { isMobile } = useResponsive();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StayConnect</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="text-gray-600 hover:text-gray-900">
              宿主を探す
            </Link>
            <Link href="/become-host" className="text-gray-600 hover:text-gray-900">
              宿主になる
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/messages" className="text-gray-600 hover:text-gray-900">
                  メッセージ
                </Link>
                <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
                  予約管理
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                  <User className="w-5 h-5" />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    新規登録
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* モバイルメニューボタン */}
          {!isMobile && (
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/search" className="text-gray-600 hover:text-gray-900">
                宿主を探す
              </Link>
              <Link href="/become-host" className="text-gray-600 hover:text-gray-900">
                宿主になる
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/messages" className="text-gray-600 hover:text-gray-900">
                    メッセージ
                  </Link>
                  <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
                    予約管理
                  </Link>
                  <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                    プロフィール
                  </Link>
                  <button
                    onClick={logout}
                    className="text-left text-gray-600 hover:text-gray-900"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900">
                    ログイン
                  </Link>
                  <Link href="/register" className="text-gray-600 hover:text-gray-900">
                    新規登録
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;