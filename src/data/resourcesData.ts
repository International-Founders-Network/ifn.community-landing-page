import { FileText, Download, PlayCircle, Shield, Globe, Users, Briefcase, Zap, LineChart, Scale, Compass } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Stage = {
    id: string;
    name: string;
    description: string;
};

export type Resource = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tag: 'Guide' | 'Template' | 'Video' | 'Checklist' | 'Tool' | 'Article';
    link?: string;
    isComingSoon?: boolean;
};

export type Segment = {
    id: string;
    name: string;
    description: string;
    stages: Stage[];
    resources: Record<string, Resource[]>; // Stage ID to Resources mapping
};

export const RESOURCES_DATA: Record<string, Segment> = {
    startups: {
        id: 'startups',
        name: 'Tech Startups',
        description: 'Scalable tech companies looking for high growth and venture funding.',
        stages: [
            { id: 'ideation', name: 'Ideation', description: 'Refining the problem and solution.' },
            { id: 'mvp', name: 'MVP', description: 'Building the first version of your product.' },
            { id: 'growth', name: 'Seed & Growth', description: 'Finding PMF and scaling users.' },
            { id: 'exit', name: 'IPO / Exit', description: 'Preparing for a major liquidity event.' }
        ],
        resources: {
            ideation: [
                {
                    id: 'playbook',
                    title: 'Startup Playbook',
                    description: 'A comprehensive guide to building your company from zero to one.',
                    icon: PlayCircle,
                    tag: 'Guide'
                },
                {
                    id: 'pitch-deck',
                    title: 'Seed Pitch Deck',
                    description: 'Template for reaching out to your first angel investors.',
                    icon: Download,
                    tag: 'Template'
                }
            ],
            mvp: [
                {
                    id: 'product-roadmap',
                    title: 'MVP Roadmap',
                    description: 'How to prioritize features for your first release.',
                    icon: Compass,
                    tag: 'Guide',
                    isComingSoon: true
                }
            ],
            growth: [
                {
                    id: 'growth-engine',
                    title: 'Growth Flywheel',
                    description: 'Models for sustainable user acquisition and retention.',
                    icon: Zap,
                    tag: 'Video',
                    isComingSoon: true
                }
            ],
            exit: [
                {
                    id: 'due-diligence',
                    title: 'Due Diligence Checklist',
                    description: 'Get your legal and financial house in order for exit.',
                    icon: Shield,
                    tag: 'Checklist',
                    isComingSoon: true
                }
            ]
        }
    },
    smbs: {
        id: 'smbs',
        name: 'Small Businesses (SMB)',
        description: 'Sustainable, profitable businesses serving local or niche markets.',
        stages: [
            { id: 'concept', name: 'Concept', description: 'Market research and business planning.' },
            { id: 'launch', name: 'Launch', description: 'Setting up operations and first customers.' },
            { id: 'profit', name: 'Profitability', description: 'Focusing on unit economics and cash flow.' },
            { id: 'legacy', name: 'Legacy', description: 'Building long-term value or family business.' }
        ],
        resources: {
            concept: [
                {
                    id: 'smb-plan',
                    title: 'Business Plan Template',
                    description: 'Traditional business plan tailored for SMB lenders and partners.',
                    icon: FileText,
                    tag: 'Template'
                }
            ],
            launch: [
                {
                    id: 'local-seo',
                    title: 'Local SEO Guide',
                    description: 'How to get found by customers in your immediate area.',
                    icon: Globe,
                    tag: 'Guide',
                    isComingSoon: true
                }
            ],
            profit: [
                {
                    id: 'cash-flow-mgr',
                    title: 'Cash Flow Manager',
                    description: 'Keep track of your burn and bridge to profitability.',
                    icon: LineChart,
                    tag: 'Tool',
                    isComingSoon: true
                }
            ],
            legacy: [
                {
                    id: 'hiring-guide',
                    title: 'SMB Hiring Framework',
                    description: 'Building a team that can run the business without you.',
                    icon: Users,
                    tag: 'Guide',
                    isComingSoon: true
                }
            ]
        }
    },
    global: {
        id: 'global',
        name: 'International Expansion',
        description: 'Immigrant founders and operators navigating the US and global markets.',
        stages: [
            { id: 'visa', name: 'Visa & Immigration', description: 'Legal paths to live and work in the US.' },
            { id: 'us-entry', name: 'US Market Entry', description: 'Penetrating the United States market.' },
            { id: 'global-scale', name: 'Global Scale', description: 'Expanding from the US to other regions.' }
        ],
        resources: {
            visa: [
                {
                    id: 'visa-options',
                    title: 'Founder Visa Guide',
                    description: 'Overview of O-1, E-2, and H-1B paths for entrepreneurs.',
                    icon: Scale,
                    tag: 'Guide'
                },
                {
                    id: 'immigration-lawyers',
                    title: 'Attorney Directory',
                    description: 'Vetted list of immigration attorneys for founders.',
                    icon: Users,
                    tag: 'Checklist',
                    isComingSoon: true
                }
            ],
            'us-entry': [
                {
                    id: 'us-entity-setup',
                    title: 'US Entity Roadmap',
                    description: 'LLC vs C-Corp and how to incorporate from abroad.',
                    icon: Briefcase,
                    tag: 'Guide'
                }
            ],
            'global-scale': [
                {
                    id: 'international-tax',
                    title: 'Cross-Border Tax 101',
                    description: 'Managing tax implications for international operations.',
                    icon: Globe,
                    tag: 'Video',
                    isComingSoon: true
                }
            ]
        }
    }
};
