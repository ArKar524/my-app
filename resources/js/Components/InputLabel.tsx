import type { LabelHTMLAttributes, PropsWithChildren } from 'react';

type InputLabelProps = PropsWithChildren<
    LabelHTMLAttributes<HTMLLabelElement> & {
        value?: string;
    }
>;

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: InputLabelProps) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-gray-700 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
