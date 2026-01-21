import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export type DatePickerProps = {
    value?: Date | null;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
};

export function DatePicker({
    value,
    onChange,
    placeholder = 'Pick a date',
    disabled,
}: DatePickerProps) {
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(
        value ?? undefined,
    );

    React.useEffect(() => {
        if (value !== undefined) {
            setInternalDate(value ?? undefined);
        }
    }, [value]);

    const selected = value ?? internalDate;

    const handleSelect = (date?: Date) => {
        if (!onChange) {
            setInternalDate(date);
        } else {
            onChange(date);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !selected && 'text-muted-foreground',
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selected ? format(selected, 'PPP') : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={handleSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
