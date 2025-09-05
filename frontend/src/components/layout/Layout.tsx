import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import { useResponsive } from '@/hooks/useResponsive';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  showBottomNav = true
}) => {
  const { isMobile } = useResponsive();

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className={`flex-1 ${isMobile && showBottomNav ? 'pb-16' : ''}`}>
        {children}
      </main>
      {showFooter && !isMobile && <Footer />}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};

export default Layout;