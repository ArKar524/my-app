import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/Components/ui/sonner';
import { useEffect } from 'react';

const appName = import.meta.env.VITE_APP_NAME ?? 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const ServiceWorkerWrapper = () => {
            useEffect(() => {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker
                        .register('/sw.js')
                        .catch((error) => console.error('SW registration failed', error));
                }
            }, []);

            return (
                <>
                    <App {...props} />
                    <Toaster />
                </>
            );
        };

        root.render(
            <ServiceWorkerWrapper />
        );
    },
    progress: {
        color: '#4B5563',
    },
});
