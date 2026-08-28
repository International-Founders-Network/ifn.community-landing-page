import { motion, type HTMLMotionProps } from 'framer-motion';
import { buttonClasses, type ButtonStyleOptions } from '../lib/buttonStyles';

interface ButtonProps extends HTMLMotionProps<'button'>, ButtonStyleOptions {
    children: React.ReactNode;
}

/**
 * Press feedback moved from Framer Motion's `whileTap` to CSS `:active`, which
 * now lives in `BASE` inside `buttonStyles.ts` as
 * `active:translate-y-px active:scale-[0.985]` (plan section 6, behaviour 6).
 *
 * Two reasons it had to move rather than be duplicated. `ButtonLink` renders a
 * plain <a> and never mounted a motion component, so `whileTap` could never
 * reach it and half the page's controls had no press state. And an inline
 * `transform` written by Framer would have fought the CSS rule for the same
 * element, so keeping both would have been a conflict rather than a belt.
 *
 * The element tree is otherwise untouched on purpose: `motion.button`,
 * `HTMLMotionProps<'button'>` and the `...props` spread all stay, because
 * `JoinModal.tsx:346` passes `ref={submitRef}` through this component and the
 * `role="alert"` submit error path returns focus to that exact node.
 */
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
            className={buttonClasses({ variant, size, fullWidth, onDark, className })}
            {...props}
        >
            {children}
        </motion.button>
    );
}
