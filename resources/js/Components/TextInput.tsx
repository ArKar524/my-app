import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    type InputHTMLAttributes,
} from 'react';

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
    isFocused?: boolean;
    className?: string;
};

type TextInputHandle = {
    focus: () => void;
};

export default forwardRef<TextInputHandle, TextInputProps>(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props }: TextInputProps,
    ref,
) {
    const localRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md border-input bg-background text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:ring-primary ' +
                className
            }
            ref={localRef}
        />
    );
});
