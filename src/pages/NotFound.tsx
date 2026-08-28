import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { Emphasis } from '../components/Emphasis';

/**
 * The four onward links are the whole point of this page, so they are the one
 * place its type ladder steps up rather than down.
 *
 * They were 18px/600 hovering to the retired Welcome Amber `#f97316`, which
 * measured 2.803:1 on white. Hover states are text too, and 18px/600 is *not*
 * WCAG large text (that needs 18.66px **bold**), so the hovered link had to
 * clear 4.5:1 and did not.
 *
 * Two things fix it together, and both are needed:
 *   - the hover moves to `--accent`, 7.054:1 on `--paper` in light and 5.517:1
 *     in dark, both recomputed here against REDESIGN-PLAN.md section 4.2;
 *   - the link sits at 20px/700, which is genuine WCAG large text and therefore
 *     requires 3:1, not 4.5:1.
 *
 * `#ea580c` at 18px/600 would still have failed. The size step is the other half
 * of the repair, not decoration.
 *
 * Phase 3 owns one open violation here, repointed rather than resolved because
 * resolving it is a design change. Section 4.2 licenses `--accent` to the mark,
 * the primary action and the wordmark period, and a link hover is none of the
 * three; it also measures 2.547:1 against surrounding `--ink` body text in light
 * (WCAG technique G183), and this link carries no underline to fall back on.
 */
const ONWARD_LINK =
    'text-xl font-bold text-ink hover:text-accent transition-colors ' +
    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ink ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-sm';

export function NotFound() {
    return (
        <Container className="pt-32 pb-24">
            <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted mb-4">
                    Page not found
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-ink tracking-tight mb-6">
                    We couldn&rsquo;t find that <Emphasis>page</Emphasis>
                </h1>
                <p className="text-lg text-muted leading-relaxed mb-10">
                    The link may be out of date, or the address may have a typo in it.
                    Here is where most people are heading:
                </p>
                <ul className="space-y-4">
                    <li>
                        <Link to="/" className={ONWARD_LINK}>
                            Home
                        </Link>
                        <p className="text-muted">What IFN is and who it is for.</p>
                    </li>
                    <li>
                        <Link to="/events" className={ONWARD_LINK}>
                            Upcoming meetups
                        </Link>
                        <p className="text-muted">Our monthly gathering in Austin.</p>
                    </li>
                    <li>
                        <Link to="/resources" className={ONWARD_LINK}>
                            Resources
                        </Link>
                        <p className="text-muted">Practical notes on visas, banking, and hiring.</p>
                    </li>
                    <li>
                        <Link to="/contact" className={ONWARD_LINK}>
                            Contact us
                        </Link>
                        <p className="text-muted">Ask us anything directly.</p>
                    </li>
                </ul>
            </div>
        </Container>
    );
}
