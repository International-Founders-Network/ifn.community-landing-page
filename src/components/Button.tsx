import { motion, type HTMLMotionProps } from 'framer-motion';
import { buttonClasses, type ButtonStyleOptions } from '../lib/buttonStyles';

interface ButtonProps extends HTMLMotionProps<'button'>, ButtonStyleOptions {
    children: React.ReactNode;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    onDark = false,
    children,
    ...props
}: ButtonProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={buttonClasses({ variant, size, fullWidth, onDark, className })}
            {...props}
        >
            {children}
        </motion.button>
    );
}
