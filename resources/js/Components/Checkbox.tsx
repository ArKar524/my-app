import type { InputHTMLAttributes } from 'react';

type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export default function Checkbox({ className = '', ...props }: CheckboxProps) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-input text-primary shadow-sm focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ' +
                className
            }
        />
    );
}
