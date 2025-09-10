import clsx from "clsx"

export default function Input({
    type = "text",
    placeholder = "Enter text...",
    label,
    value,
    onChange,
    className = "",
    ...props
}) {
    return (<div className="w-full">
        {label && <label className="block mb-1 text-sm font-light text-white/50">
            {label}
        </label>}
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={clsx(
                "bg-white/10 px-3 py-1.5 text-sm outline-none w-full",
                className
            )}
            {...props}
        />
    </div>);
};