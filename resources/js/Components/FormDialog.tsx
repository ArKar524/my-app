import { useState, type FormEventHandler, type ReactNode } from 'react';
import { DialogShell } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';

type FormDialogProps = {
    title: string;
    description?: string;
    triggerLabel?: string;
    submitLabel?: string;
    cancelLabel?: string;
    children: ReactNode;
    onSubmit: FormEventHandler<HTMLFormElement>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    footerExtras?: ReactNode;
};

export default function FormDialog({
    title,
    description,
    triggerLabel,
    submitLabel = 'Save',
    cancelLabel = 'Cancel',
    children,
    onSubmit,
    open: controlledOpen,
    onOpenChange,
    footerExtras,
}: FormDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;

    const handleOpenChange = (next: boolean) => {
        setInternalOpen(next);
        onOpenChange?.(next);
    };

    return (
        <>
            {triggerLabel !== undefined && (
                <Button type="button" onClick={() => handleOpenChange(true)}>
                    {triggerLabel}
                </Button>
            )}
            <DialogShell
                open={open}
                onOpenChange={handleOpenChange}
                title={title}
                description={description}
                footer={
                    <>
                        {footerExtras}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            {cancelLabel}
                        </Button>
                        <Button type="submit" form="dialog-form">
                            {submitLabel}
                        </Button>
                    </>
                }
            >
                <form
                    id="dialog-form"
                    onSubmit={(e) => {
                        onSubmit(e);
                    }}
                    className="space-y-4"
                >
                    {children}
                </form>
            </DialogShell>
        </>
    );
}
