import ApplicationLogo from '@/Components/ApplicationLogo';
import { FlashToaster } from '@/Components/FlashToaster';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, type PropsWithChildren, type ReactNode } from 'react';
import type { PageProps } from '@/types';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react';

type AppLayoutProps = PropsWithChildren<{
    header?: ReactNode;
}>;

type NavItem = {
    label: string;
    routeName: string;
};

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', routeName: 'dashboard' },
    { label: 'Accounts', routeName: 'accounts.index' },
    { label: 'Categories', routeName: 'categories.index' },
    { label: 'Transactions', routeName: 'transactions.index' },
    { label: 'Reports', routeName: 'reports.index' },
    { label: 'Pages', routeName: 'facebook.pages' },
    { label: 'Inbox', routeName: 'facebook.inbox' },
    { label: 'Webhook Events', routeName: 'facebook.webhook-events' },
];

const getPreferredTheme = (): 'light' | 'dark' => {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') return stored;
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

export default function AppLayout({ header, children }: AppLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>(getPreferredTheme());

    const navLinks = useMemo(() => {
        const router = route();

        return NAV_ITEMS.map((item) => {
            const available = router.has(item.routeName);
            return {
                ...item,
                href: available ? route(item.routeName) : '#',
                active: available ? router.current(item.routeName) : false,
                disabled: !available,
            };
        });
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-muted text-foreground">
            <FlashToaster />

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-30 w-64 transform border-r border-border bg-card shadow-sm transition-transform duration-200',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    'sm:translate-x-0',
                )}
            >
                <div className="flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <ApplicationLogo className="h-9 w-auto fill-current text-primary" />
                        <span className="text-base font-semibold text-foreground">
                            Ledger
                        </span>
                    </Link>
                    <button
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted sm:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <span className="sr-only">Close menu</span>
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="px-3 pb-6">
                    <div className="space-y-1">
                        {navLinks.map((item) => {
                            const classes = cn(
                                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                                item.active
                                    ? 'bg-primary/10 text-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                item.disabled && 'pointer-events-none opacity-50',
                            );
                            return (
                                <Link
                                    key={item.routeName}
                                    href={item.href}
                                    className={classes}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 sm:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex w-full flex-col sm:pl-64">
                <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
                    <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 md:justify-end">
                        <button
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted sm:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open menu</span>
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="inline-flex items-center justify-center rounded-md border border-input bg-card p-2 text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex items-center rounded-md border border-transparent bg-card px-3 py-2 text-sm font-medium leading-4 text-muted-foreground transition duration-150 ease-in-out hover:text-foreground focus:outline-none"
                                    >
                                        {user.name}
                                        <svg
                                            className="-me-0.5 ms-2 h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {user.email}
                                            </span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={route('profile.edit')}>Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {header && (
                    <header className="border-b border-border bg-card/90 px-4 py-3 text-foreground sm:px-6 lg:px-8">
                        {header}
                    </header>
                )}

                <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    {children}
                </main>
            </div>
        </div>
    );
}
