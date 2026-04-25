import UnauthorizedPage from '@/components/Unauthorized';
import { Suspense } from 'react';

// Force dynamic rendering to avoid prerendering
export const dynamic = 'force-dynamic';

export default function UnauthorizedPageContent({ params }) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white">Loading...</div>
        </div>}>
            <UnauthorizedPage searchParams={params}/>
        </Suspense>
    );
}