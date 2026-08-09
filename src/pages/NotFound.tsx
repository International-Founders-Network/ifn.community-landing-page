import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { Emphasis } from '../components/Emphasis';

/**
 * The four onward links are the whole point of this page, so they are the one
 * place its type ladder steps up rather than down.
 *
 * They were `text-lg font-semibold` (18px/600) hovering to Welcome Amber
 * `#f97316`. Hover states are text too, and 18px/600 is *not* WCAG large text —
 * that needs 18.66px **bold** — so the hovered link had to clear 4.5:1 and
 * measured 2.80:1 on white.
 *
 * Two things fix it together, and both are needed:
 *   - the hover moves to Welcome Amber Deep `#ea580c` (`text-accent-on-light`),
 *     3.56:1 on white, which is already a token so no new hue enters the system;
 *   - the link sits at DESIGN.md's Title step, 20px/700, which is genuine WCAG
 *     large text and therefore requires 3:1, not 4.5:1.
 *
 * `#ea580c` at 18px/600 would still have failed. The size step is the other half
 * of the repair, not decoration.
 */
const ONWARD_LINK =
    'text-xl font-bold text-primary hover:text-accent-on-light transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm';

export function NotFound() {
    return (
        <Container className="pt-32 pb-24">
            <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 mb-4">
                    Page not found
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
                    We couldn&rsquo;t find that <Emphasis>page</Emphasis>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed mb-10">
                    The link may be out of date, or the address may have a typo in it.
                    Here is where most people are heading:
                </p>
                <ul className="space-y-4">
                    <li>
                        <Link to="/" className={ONWARD_LINK}>
                            Home
                        </Link>
                        <p className="text-slate-600">What IFN is and who it is for.</p>
                    </li>
                    <li>
                        <Link to="/events" className={ONWARD_LINK}>
                            Upcoming meetups
                        </Link>
                        <p className="text-slate-600">Our monthly gathering in Austin.</p>
                    </li>
                    <li>
                        <Link to="/resources" className={ONWARD_LINK}>
                            Resources
                        </Link>
                        <p className="text-slate-600">Practical notes on visas, banking, and hiring.</p>
                    </li>
                    <li>
                        <Link to="/contact" className={ONWARD_LINK}>
                            Contact us
                        </Link>
                        <p className="text-slate-600">Ask us anything directly.</p>
                    </li>
                </ul>
            </div>
        </Container>
    );
}
