import ApplicationLogo from '@/Components/ApplicationLogo';
import { FlashToaster } from '@/Components/FlashToaster';
import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-muted pt-6 text-foreground sm:justify-center sm:pt-0">
            <FlashToaster />
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-primary" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-card px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
