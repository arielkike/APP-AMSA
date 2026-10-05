import React, { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { TopAppBar } from './TopAppBar';
import { BottomNav } from './BottomNav';
import { StorageService } from '../../utils/storage';

interface AppLayoutProps {
  showBottomNav?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ showBottomNav = true }) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref') || searchParams.get('referido') || searchParams.get('promotor');
    if (refCode) {
      StorageService.set('referral_code', refCode.trim().toUpperCase());
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col antialiased">
      <TopAppBar />
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3 pb-24">
        <Outlet />
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

