import { Transition } from '@headlessui/react';
import { Link, type InertiaLinkProps } from '@inertiajs/react';
import {
    createContext,
    useContext,
    useState,
    type Dispatch,
    type FC,
    type PropsWithChildren,
    type SetStateAction,
} from 'react';

type DropdownContextValue = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
};

const DropDownContext = createContext<DropdownContextValue | null>(null);

const useDropdown = () => {
    const context = useContext(DropDownContext);

    if (!context) {
        throw new Error('Dropdown components must be used within Dropdown');
    }

    return context;
};

const Trigger = ({ children }: PropsWithChildren) => {
    const { open, setOpen, toggleOpen } = useDropdown();

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

type ContentProps = PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48';
    contentClasses?: string;
}>;

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-card text-foreground',
    children,
}: ContentProps) => {
    const { open, setOpen } = useDropdown();

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-md ring-1 ring-border/70 ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

type DropdownLinkProps = PropsWithChildren<
    InertiaLinkProps & {
        className?: string;
    }
>;

const DropdownLink = ({
    className = '',
    children,
    ...props
}: DropdownLinkProps) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-muted-foreground transition duration-150 ease-in-out hover:bg-muted focus:bg-muted focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

type DropdownComponent = FC<PropsWithChildren> & {
    Trigger: typeof Trigger;
    Content: typeof Content;
    Link: typeof DropdownLink;
};

const DropdownBase = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Dropdown = DropdownBase as DropdownComponent;
Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
