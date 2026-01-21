import { Spinner } from '@/Components/ui/spinner';
import { cn } from '@/lib/utils';

type LoadingStateProps = {
    message?: string;
    className?: string;
};

export default function LoadingState({
    message = 'Loading...',
    className,
}: LoadingStateProps) {
    return (
        <div
            className={cn(
                'flex h-full min-h-[140px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-6 text-muted-foreground',
                className,
            )}
        >
            <Spinner />
            <span className="text-sm">{message}</span>
        </div>
    );
}
