import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    children: React.ReactNode;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
        primary: "bg-accent hover:bg-accent-hover text-white focus:ring-accent",
        secondary: "bg-primary hover:bg-primary-light text-white focus:ring-primary",
        outline: "border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary",
        ghost: "text-slate-600 hover:text-primary hover:bg-slate-100 focus:ring-slate-400",
    };

    const sizes = {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth ? "w-full" : "",
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
}
