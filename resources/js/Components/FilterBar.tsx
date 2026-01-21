import type { PropsWithChildren, ReactNode } from 'react';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { DatePicker } from '@/Components/ui/date-picker';
import { cn } from '@/lib/utils';
import { parseISO } from 'date-fns';

type FilterBarProps = PropsWithChildren<{
    actions?: ReactNode;
    className?: string;
}>;

export function FilterBar({ children, actions, className }: FilterBarProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
        >
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}

type DateRangeProps = {
    from: string;
    to: string;
    onChange: (range: { from: string; to: string }) => void;
};

export function DateRangeFilter({ from, to, onChange }: DateRangeProps) {
    const fromDate = from ? parseISO(from) : undefined;
    const toDate = to ? parseISO(to) : undefined;

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
                Date range
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <DatePicker
                    value={fromDate}
                    onChange={(date) =>
                        onChange({
                            from: date ? date.toISOString().slice(0, 10) : '',
                            to,
                        })
                    }
                    placeholder="From"
                />
                <span className="text-sm text-muted-foreground text-center sm:px-1">
                    to
                </span>
                <DatePicker
                    value={toDate}
                    onChange={(date) =>
                        onChange({
                            from,
                            to: date ? date.toISOString().slice(0, 10) : '',
                        })
                    }
                    placeholder="To"
                />
            </div>
        </div>
    );
}

type SelectFilterProps = {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    options: { value: string | number; label: string }[];
};

export function SelectFilter({
    label,
    value,
    onChange,
    options,
}: SelectFilterProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">{label}</label>
            <Select value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </Select>
        </div>
    );
}

type SubmitResetProps = {
    onReset: () => void;
    submitLabel?: string;
};

export function FilterActions({
    onReset,
    submitLabel = 'Apply',
}: SubmitResetProps) {
    return (
        <div className="flex items-center gap-2">
            <Button type="submit">{submitLabel}</Button>
            <Button type="button" variant="outline" onClick={onReset}>
                Reset
            </Button>
        </div>
    );
}
