// app/dashboard/layout.js
'use client';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import { CsrfProvider } from '@/context/CsrfContext';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <CsrfProvider>
            <div className="flex h-screen bg-neutral-900">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <main className="flex-1 overflow-auto">
                    <div className="max-sm:pt-16 bg-neutral-950">
                        {children}
                    </div>
                </main>
            </div>
        </CsrfProvider>
    );
}