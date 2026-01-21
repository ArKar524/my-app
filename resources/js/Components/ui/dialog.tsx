import * as React from 'react';
import { Dialog } from '@headlessui/react';
import { cn } from '@/lib/utils';

type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
};

const maxWidthClass: Record<NonNullable<DialogProps['maxWidth']>, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
};

export function DialogShell({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    maxWidth = 'lg',
}: DialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onOpenChange}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-0"
        >
            <div className="fixed inset-0 bg-foreground/60" aria-hidden />
            <Dialog.Panel
                className={cn(
                    'z-50 w-full transform overflow-hidden rounded-lg bg-card text-foreground shadow-xl transition-all sm:w-full',
                    maxWidthClass[maxWidth],
                )}
            >
                <div className="p-6">
                    {(title || description) && (
                        <div className="space-y-1 pb-4">
                            {title && (
                                <Dialog.Title className="text-lg font-semibold">
                                    {title}
                                </Dialog.Title>
                            )}
                            {description && (
                                <Dialog.Description className="text-sm text-muted-foreground">
                                    {description}
                                </Dialog.Description>
                            )}
                        </div>
                    )}
                    <div className="space-y-4">{children}</div>
                </div>
                {footer && (
                    <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                        {footer}
                    </div>
                )}
            </Dialog.Panel>
        </Dialog>
    );
}
