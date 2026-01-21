import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

type ErrorStateProps = {
    message?: string;
    onRetry?: () => void;
    className?: string;
};

export default function ErrorState({
    message = 'Something went wrong.',
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                'flex h-full min-h-[160px] flex-col items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center text-destructive',
                className,
            )}
        >
            <div className="text-lg font-semibold text-destructive">Error</div>
            <div className="max-w-md text-sm text-destructive/90">{message}</div>
            {onRetry && (
                <Button variant="destructive" onClick={onRetry}>
                    Retry
                </Button>
            )}
        </div>
    );
}
