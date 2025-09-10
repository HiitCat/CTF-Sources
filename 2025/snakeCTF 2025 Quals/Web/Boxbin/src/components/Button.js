import clsx from "clsx";

export default function Button({
    children,
    className,
    ...props
}) {
    return (
        <button
            className={clsx(
                "bg-white/10 px-3 py-1.5 text-sm",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}