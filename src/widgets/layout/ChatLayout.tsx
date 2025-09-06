'use client';

import { ReactNode } from 'react';
import DefaultLayout from './DefaultLayout';

interface ChatLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function ChatLayout({ children, sidebar }: ChatLayoutProps) {
  return (
    <DefaultLayout>
      <div className="h-screen bg-white flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {sidebar}
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </DefaultLayout>
  );
}
