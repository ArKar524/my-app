import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import route from 'ziggy-js';
import type { Ziggy } from 'ziggy-js';

export type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
};

export type SharedProps = {
    auth: {
        user: User;
    };
    ziggy: Ziggy;
    flash?: {
        status?: string;
        message?: string;
    };
};

export type PageProps<
    TProps extends Record<string, unknown> = Record<string, unknown>,
> = SharedProps & InertiaPageProps & TProps;

declare global {
    // Provided by Ziggy's @routes helper
    // eslint-disable-next-line no-var
    var route: typeof route;
}

export {};
