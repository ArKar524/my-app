import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from './ui/sonner';
import type { PageProps } from '@/types';

type FlashPayload = {
    status?: string;
    message?: string;
    type?: 'success' | 'error' | 'info' | 'warning';
};

export function FlashToaster() {
    const { flash } = usePage<PageProps>().props;
    const lastMessage = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!flash) {
            return;
        }

        const payload: FlashPayload = {
            status: flash.status as string | undefined,
            message: flash.message as string | undefined,
            type: flash.type as FlashPayload['type'],
        };

        const content = payload.message ?? payload.status;
        if (!content) {
            return;
        }

        if (lastMessage.current === content) {
            return;
        }

        lastMessage.current = content;

        const variant = payload.type ?? 'success';

        switch (variant) {
            case 'error':
                toast.error(content);
                break;
            case 'info':
                toast.info(content);
                break;
            case 'warning':
                toast.warning(content);
                break;
            default:
                toast.success(content);
        }
    }, [flash]);

    return null;
}
