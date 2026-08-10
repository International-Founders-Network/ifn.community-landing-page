import { Link } from 'react-router-dom';
import { buttonClasses, type ButtonStyleOptions } from '../lib/buttonStyles';

interface CommonProps extends ButtonStyleOptions {
    children: React.ReactNode;
}

interface InternalProps extends CommonProps {
    /** Client-side route. Renders a react-router <Link>. */
    to: string;
    href?: never;
    external?: never;
}

interface ExternalProps extends CommonProps {
    /** Absolute URL or mailto:. Renders a plain <a>. */
    href: string;
    to?: never;
    /**
     * Opens in a new tab with rel="noopener noreferrer" and an appended
     * screen-reader hint. Defaults to true for http(s) URLs, false for mailto:.
     */
    external?: boolean;
}

type ButtonLinkProps = InternalProps | ExternalProps;

/**
 * A link that looks like a button, sharing `buttonClasses` with `Button` so the
 * two can never drift. Use this instead of hand-writing button classes onto an
 * anchor. Navigation must be a real link so it can be opened in a new tab,
 * copied, and announced as a link rather than a button.
 *
 * No class list is written here and none should ever be. Every token, the pill
 * radius, the two layer focus ring and the `:active` press feedback all arrive
 * through `buttonClasses`, which is why this component gained the press state
 * in Phase 1 without being edited for it.
 *
 * The `target="_blank"` plus `rel="noopener noreferrer"` pair and the sr-only
 * "(opens in a new tab)" text below are an accessibility floor item, not a
 * convenience. A link that changes context without warning is WCAG 3.2.5, and
 * the hint has to be inside the anchor so it is announced with the link name.
 */
export function ButtonLink(props: ButtonLinkProps) {
    const { children, variant, size, fullWidth, onDark, className } = props;
    const classes = buttonClasses({ variant, size, fullWidth, onDark, className });

    if ('to' in props && props.to !== undefined) {
        return (
            <Link to={props.to} className={classes}>
                {children}
            </Link>
        );
    }

    const { href } = props as ExternalProps;
    const opensNewTab = props.external ?? /^https?:/i.test(href);

    return (
        <a
            href={href}
            {...(opensNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={classes}
        >
            {children}
            {opensNewTab && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
    );
}
