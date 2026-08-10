import { motion } from 'framer-motion';
import { CalendarDays, Users } from 'lucide-react';
import { GlobeIcon } from './GlobeIcon';

/** Decorative connection points sitting on the outer ring. Percentages are polar
 *  coordinates on that ring (centre 50%, radius 42%) resolved to left/top. */
const NODES = [
    { left: '86.4%', top: '29%' },
    { left: '13.6%', top: '29%' },
    { left: '50%', top: '92%' },
];

/** Everything stated here is verifiable: six-plus months of monthly meetups, the
 *  Station Austin venue partnership, and the Reuneo speed-networking format. No
 *  counts, no photographs of people, nothing that cannot be checked. */
const PROOF = [
    {
        icon: CalendarDays,
        eyebrow: 'Meetups',
        title: 'Six months of monthly meetups',
        detail: 'In person, hosted at Station Austin.',
    },
    {
        icon: Users,
        eyebrow: 'Format',
        title: 'Speed networking by Reuneo',
        detail: 'Founders are paired for one-to-one conversations.',
    },
];

export function HeroVisual() {
    return (
        <div className="relative w-full max-w-lg mx-auto">
            {/* Medallion. Static: no rotating rings, no breathing globe. DESIGN.md
                allows one piece of ambient motion on this page and it belongs to the
                headline. */}
            <div className="relative mx-auto aspect-square w-full max-w-[18rem] sm:max-w-[22rem] lg:max-w-[26rem]">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full bg-ink/10 blur-[90px]"
                />

                <div className="relative flex h-full w-full items-center justify-center rounded-full border border-rule bg-paper">
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,var(--paper),transparent_70%)]"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-[8%] rounded-full border border-dashed border-rule"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-[22%] rounded-full border border-rule"
                    />

                    {/* Connection points replace what used to be three stock photographs
                        of strangers presented as members. Abstract on purpose: the
                        composition should not imply people IFN cannot name. */}
                    {NODES.map((node) => (
                        <span
                            key={node.left + node.top}
                            aria-hidden="true"
                            style={{ left: node.left, top: node.top }}
                            className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-rule bg-paper"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                        </span>
                    ))}

                    <div className="relative z-10 rounded-full border border-rule bg-paper p-8 sm:p-10">
                        <GlobeIcon className="h-24 w-24 text-ink sm:h-28 sm:w-28" />
                    </div>
                </div>
            </div>

            {/* Proof. Visible at every breakpoint. These used to be `hidden xl:block`,
                which meant every phone and most laptops saw no evidence at all. */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {PROOF.map(({ icon: Icon, eyebrow, title, detail }, i) => {
                    const onDark = i === 1;

                    return (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            className={
                                onDark
                                    ? 'rounded-2xl border border-rule bg-band p-6'
                                    : 'rounded-2xl border border-rule bg-paper p-6'
                            }
                        >
                            <div className="flex items-start gap-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-band text-ink">
                                    <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted">
                                        {eyebrow}
                                    </p>
                                    <p className="mt-1 text-base font-bold text-ink">{title}</p>
                                    <p className="mt-1 text-sm text-muted">{detail}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
