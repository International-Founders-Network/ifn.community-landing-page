import {
    FileText, Download, PlayCircle, Shield, Globe, Users, Briefcase, Zap,
    LineChart, Scale, CheckSquare, Layout, PieChart,
    GraduationCap, Map, MessageSquare, Calculator, Layers,
    TrendingUp, Handshake, Heart, Rocket, Building, Landmark, List
} from 'lucide-react';
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
    tag: 'Checklist' | 'Guide' | 'Template' | 'Toolkit' | 'Video' | 'Worksheet' | 'Directory';
    link?: string;
    isComingSoon?: boolean;
    isMembersOnly?: boolean;
};

export type Segment = {
    id: string;
    name: string;
    description: string;
    stages: Stage[];
    resources: Record<string, Resource[]>; // Stage ID to Resources mapping
};

export const RESOURCES_DATA: Record<string, Segment> = {
    aspiring: {
        id: 'aspiring',
        name: 'Aspiring Founders',
        description: 'Individuals exploring entrepreneurship and looking to validate their first idea.',
        stages: [
            { id: 'exploration', name: 'Exploration', description: 'Discovering if entrepreneurship is right for you.' },
            { id: 'validation', name: 'Validation', description: 'Testing your idea before you build.' },
            { id: 'commitment', name: 'Commitment', description: 'Making the leap and setting up foundations.' },
            { id: 'launch-readiness', name: 'Launch Readiness', description: 'Everything you need before Day 1.' }
        ],
        resources: {
            exploration: [
                {
                    id: 'founder-assessment',
                    title: 'Founder Self-Assessment Quiz',
                    description: 'Evaluate your readiness, risk tolerance, and motivations for starting a company.',
                    icon: CheckSquare,
                    tag: 'Worksheet'
                },
                {
                    id: 'austin-ecosystem-map',
                    title: 'Startup Ecosystem Map: Austin',
                    description: 'Understand the key players, programs, and resources in Austin\'s founder ecosystem.',
                    icon: Map,
                    tag: 'Guide'
                },
                {
                    id: 'problem-solving-framework',
                    title: 'Problem Worth Solving Framework',
                    description: 'A structured approach to identifying and evaluating problems that could become businesses.',
                    icon: Layout,
                    tag: 'Template'
                },
                {
                    id: 'founder-spotlight',
                    title: 'International Founder Spotlight Series',
                    description: 'Hear from IFN community members about their journey from idea to company.',
                    icon: PlayCircle,
                    tag: 'Video'
                },
                {
                    id: 'leap-decision-matrix',
                    title: 'Entrepreneurship vs. Employment Decision Matrix',
                    description: 'A framework for evaluating whether and when to make the leap.',
                    icon: PieChart,
                    tag: 'Worksheet'
                }
            ],
            validation: [
                {
                    id: 'customer-discovery-guide',
                    title: 'Customer Discovery Interview Guide',
                    description: 'How to talk to potential customers and extract real insights, not just validation.',
                    icon: MessageSquare,
                    tag: 'Guide'
                },
                {
                    id: 'landing-page-mvp',
                    title: 'Landing Page MVP Toolkit',
                    description: 'Tools and templates to test your idea with a simple landing page before building anything.',
                    icon: Layers,
                    tag: 'Toolkit'
                },
                {
                    id: 'market-sizing-calc',
                    title: 'Market Sizing Calculator',
                    description: 'Estimate your TAM, SAM, and SOM with this step-by-step spreadsheet.',
                    icon: Calculator,
                    tag: 'Template'
                },
                {
                    id: 'comp-analysis',
                    title: 'Competitive Analysis Template',
                    description: 'Map your competitive landscape to find your differentiated position.',
                    icon: Layout,
                    tag: 'Template'
                },
                {
                    id: 'validation-tracker',
                    title: 'Validation Metrics Tracker',
                    description: 'Track the signals that tell you whether your idea has legs.',
                    icon: TrendingUp,
                    tag: 'Worksheet'
                }
            ],
            commitment: [
                {
                    id: 'runway-calc',
                    title: 'Financial Runway Calculator',
                    description: 'Figure out how long you can sustain yourself while building your startup.',
                    icon: Calculator,
                    tag: 'Template'
                },
                {
                    id: 'co-founder-scorecard',
                    title: 'Co-Founder Evaluation Scorecard',
                    description: 'Assess potential co-founders across skills, values, and commitment alignment.',
                    icon: Users,
                    tag: 'Worksheet'
                },
                {
                    id: 'entity-selection',
                    title: 'Business Entity Selection Guide',
                    description: 'LLC vs. C-Corp vs. S-Corp — which structure is right for your situation.',
                    icon: Building,
                    tag: 'Guide'
                },
                {
                    id: 'founder-prenup',
                    title: 'Founder Prenup Template',
                    description: 'A co-founder agreement template covering equity splits, roles, vesting, and exit scenarios.',
                    icon: FileText,
                    tag: 'Template'
                },
                {
                    id: 'transition-playbook',
                    title: 'Side Project to Full-Time Transition Playbook',
                    description: 'A step-by-step plan for going full-time on your startup.',
                    icon: PlayCircle,
                    tag: 'Guide'
                }
            ],
            'launch-readiness': [
                {
                    id: 'registration-checklist',
                    title: 'Business Registration Checklist by State',
                    description: 'State-specific requirements for registering your business in Texas and beyond.',
                    icon: CheckSquare,
                    tag: 'Checklist'
                },
                {
                    id: 'banking-setup',
                    title: 'Startup Banking Setup Guide',
                    description: 'How to choose and set up your business bank account, with recommendations for international founders.',
                    icon: Landmark,
                    tag: 'Guide'
                },
                {
                    id: 'tech-stack-starter',
                    title: 'Tech Stack Starter Kit',
                    description: 'Curated list of essential tools for email, project management, design, and development.',
                    icon: Zap,
                    tag: 'Toolkit'
                },
                {
                    id: 'first-30-days',
                    title: 'First 30 Days Action Plan',
                    description: 'Day-by-day checklist for your first month as an official founder.',
                    icon: List,
                    tag: 'Checklist'
                },
                {
                    id: 'network-building',
                    title: 'Network Building Starter Guide',
                    description: 'How to build your first 50 meaningful connections in Austin\'s startup ecosystem.',
                    icon: Heart,
                    tag: 'Guide'
                }
            ]
        }
    },
    startups: {
        id: 'startups',
        name: 'Tech Startups',
        description: 'Scalable tech companies looking for high growth and venture funding.',
        stages: [
            { id: 'ideation', name: 'Ideation', description: 'Refining the problem and solution.' },
            { id: 'mvp', name: 'MVP', description: 'Building the first version of your product.' },
            { id: 'pmf', name: 'Product-Market Fit', description: 'Proving people want what you\'ve built.' },
            { id: 'growth', name: 'Seed & Growth', description: 'Raising capital and scaling users.' },
            { id: 'scale', name: 'Scale', description: 'Building the machine that builds the company.' },
            { id: 'exit', name: 'IPO / Exit', description: 'Preparing for a major liquidity event.' }
        ],
        resources: {
            ideation: [
                {
                    id: 'biz-model-canvas',
                    title: 'Business Model Canvas Template',
                    description: 'Map your value proposition, channels, revenue streams, and cost structure.',
                    icon: Layout,
                    tag: 'Template'
                },
                {
                    id: 'problem-solution-fit',
                    title: 'Problem-Solution Fit Worksheet',
                    description: 'Validate that your solution actually addresses a real, painful problem.',
                    icon: CheckSquare,
                    tag: 'Worksheet'
                },
                {
                    id: 'market-opp-guide',
                    title: 'TAM/SAM/SOM Analysis Guide',
                    description: 'How to credibly estimate your market opportunity for investors and yourself.',
                    icon: PieChart,
                    tag: 'Guide'
                },
                {
                    id: 'comp-mapping',
                    title: 'Competitive Landscape Mapping Tool',
                    description: 'Visualize where competitors sit and identify your whitespace opportunity.',
                    icon: Map,
                    tag: 'Template'
                },
                {
                    id: 'ideation-milestones',
                    title: 'Ideation to Validation Milestone Tracker',
                    description: 'Know exactly when you\'re ready to move from thinking to building.',
                    icon: List,
                    tag: 'Checklist'
                }
            ],
            mvp: [
                {
                    id: 'mvp-scoping',
                    title: 'MVP Scoping Framework',
                    description: 'Define the minimum feature set that tests your core hypothesis.',
                    icon: Layout,
                    tag: 'Template'
                },
                {
                    id: 'build-vs-buy',
                    title: 'Build vs. Buy Decision Matrix',
                    description: 'When to code it yourself vs. use existing tools and platforms.',
                    icon: Scale,
                    tag: 'Worksheet'
                },
                {
                    id: 'user-testing-scripts',
                    title: 'User Testing Script Library',
                    description: 'Ready-to-use scripts for moderated and unmoderated user testing sessions.',
                    icon: MessageSquare,
                    tag: 'Toolkit'
                },
                {
                    id: 'first-100-users',
                    title: 'First 100 Users Playbook',
                    description: 'Proven tactics for acquiring your first users when you have zero brand.',
                    icon: Rocket,
                    tag: 'Guide'
                },
                {
                    id: 'tech-arch-guide',
                    title: 'Technical Architecture Decision Guide',
                    description: 'Choosing your tech stack based on your product type, scale expectations, and team skills.',
                    icon: Briefcase,
                    tag: 'Guide'
                },
                {
                    id: 'mvp-budget',
                    title: 'MVP Budget Planner',
                    description: 'Estimate costs for development, design, hosting, and tools for your first version.',
                    icon: Calculator,
                    tag: 'Template'
                }
            ],
            pmf: [
                {
                    id: 'pmf-dashboard',
                    title: 'PMF Metrics Dashboard Template',
                    description: 'Track retention, NPS, engagement, and revenue signals in one place.',
                    icon: Layout,
                    tag: 'Template'
                },
                {
                    id: 'pivot-framework',
                    title: 'The Pivot Decision Framework',
                    description: 'How to know when to iterate, pivot, or persevere based on data.',
                    icon: Scale,
                    tag: 'Guide'
                },
                {
                    id: 'cohort-analysis',
                    title: 'User Cohort Analysis Guide',
                    description: 'Understand how different user groups behave over time to find your best customers.',
                    icon: PieChart,
                    tag: 'Guide'
                },
                {
                    id: 'monetization-playbook',
                    title: 'Early Monetization Testing Playbook',
                    description: 'Strategies for testing willingness-to-pay before you\'ve built the billing system.',
                    icon: LineChart,
                    tag: 'Guide'
                },
                {
                    id: 'pmf-survey',
                    title: 'Sean Ellis PMF Survey Template',
                    description: 'The \'how would you feel if you could no longer use this product\' survey, ready to deploy.',
                    icon: MessageSquare,
                    tag: 'Template'
                }
            ],
            growth: [
                {
                    id: 'fundraising-101',
                    title: 'Fundraising Mechanics 101',
                    description: 'SAFE notes, convertible notes, priced rounds — what they are and when to use each.',
                    icon: Landmark,
                    tag: 'Guide'
                },
                {
                    id: 'pitch-deck-template',
                    title: 'Pitch Deck Template & Examples',
                    description: 'A proven 12-slide structure with real examples from successful raises.',
                    icon: Download,
                    tag: 'Template'
                },
                {
                    id: 'investor-tracker',
                    title: 'Investor Targeting Spreadsheet',
                    description: 'Organize your investor outreach with tracking for stage, thesis fit, and warm intros.',
                    icon: List,
                    tag: 'Template'
                },
                {
                    id: 'cap-table-guide',
                    title: 'Cap Table Management Guide',
                    description: 'Understand dilution, option pools, and how to keep your cap table clean.',
                    icon: Layers,
                    tag: 'Guide'
                },
                {
                    id: 'first-10-hires',
                    title: 'First 10 Hires Playbook',
                    description: 'Who to hire first, how to structure compensation, and equity allocation best practices.',
                    icon: Users,
                    tag: 'Guide'
                },
                {
                    id: 'term-sheet-decoder',
                    title: 'Term Sheet Decoder',
                    description: 'Understand every clause in a term sheet and what\'s negotiable.',
                    icon: Scale,
                    tag: 'Guide'
                }
            ],
            scale: [
                {
                    id: 'series-a-ready',
                    title: 'Series A Readiness Assessment',
                    description: 'Evaluate whether your metrics, team, and story are ready for institutional funding.',
                    icon: CheckSquare,
                    tag: 'Checklist'
                },
                {
                    id: 'scaling-ops',
                    title: 'Scaling Operations Playbook',
                    description: 'Systems, processes, and org design for going from 10 to 100 people.',
                    icon: Layout,
                    tag: 'Guide'
                },
                {
                    id: 'enterprise-sales',
                    title: 'Enterprise Sales Motion Guide',
                    description: 'How to build a repeatable sales process for B2B enterprise customers.',
                    icon: Handshake,
                    tag: 'Guide'
                },
                {
                    id: 'eng-scaling',
                    title: 'Engineering Team Scaling Guide',
                    description: 'From 3 engineers to 30 — hiring, culture, and technical debt management.',
                    icon: Users,
                    tag: 'Guide'
                },
                {
                    id: 'board-toolkit',
                    title: 'Board Management Toolkit',
                    description: 'Templates for board decks, meeting agendas, and investor update emails.',
                    icon: Briefcase,
                    tag: 'Toolkit'
                }
            ],
            exit: [
                {
                    id: 'due-diligence',
                    title: 'Due Diligence Checklist',
                    description: 'Get your legal and financial house in order for exit.',
                    icon: Shield,
                    tag: 'Checklist'
                },
                {
                    id: 'ma-overview',
                    title: 'M&A Process Overview',
                    description: 'What to expect when a company wants to acquire you, from LOI to close.',
                    icon: Handshake,
                    tag: 'Guide'
                },
                {
                    id: 'secondary-sales',
                    title: 'Secondary Sales Guide',
                    description: 'Options for founder and employee liquidity before an IPO.',
                    icon: LineChart,
                    tag: 'Guide'
                },
                {
                    id: 'ipo-roadmap',
                    title: 'IPO Readiness Roadmap',
                    description: '18-month timeline for preparing your company for public markets.',
                    icon: Map,
                    tag: 'Checklist'
                },
                {
                    id: 'post-exit-planning',
                    title: 'Exit Financial Planning Guide',
                    description: 'Tax implications, wealth management, and financial planning post-exit.',
                    icon: Calculator,
                    tag: 'Guide'
                }
            ]
        }
    },
    smbs: {
        id: 'smbs',
        name: 'Small Businesses (SMB)',
        description: 'Sustainable, profitable businesses serving local or niche markets.',
        stages: [
            { id: 'planning', name: 'Planning', description: 'Laying the groundwork for your business.' },
            { id: 'launch', name: 'Launch', description: 'Opening your doors and getting first customers.' },
            { id: 'establish', name: 'Establish', description: 'Building systems, team, and repeat revenue.' },
            { id: 'optimize', name: 'Optimize', description: 'Improving margins, efficiency, and growth.' },
            { id: 'expand', name: 'Expand', description: 'Growing to new locations, products, or markets.' }
        ],
        resources: {
            planning: [
                {
                    id: 'biz-plan-builder',
                    title: 'Business Plan Builder Template',
                    description: 'A streamlined business plan format that works for loans, partners, and clarity.',
                    icon: Layout,
                    tag: 'Template'
                },
                {
                    id: 'licensing-checklist',
                    title: 'Licensing & Permits Checklist by Industry',
                    description: 'Federal, state, and local requirements organized by business type.',
                    icon: CheckSquare,
                    tag: 'Checklist'
                },
                {
                    id: 'smb-entity-guide',
                    title: 'Business Structure Comparison Guide',
                    description: 'LLC, S-Corp, C-Corp, Sole Prop — pros, cons, and tax implications for each.',
                    icon: Building,
                    tag: 'Guide'
                },
                {
                    id: 'sba-loan-guide',
                    title: 'SBA Loan Application Guide',
                    description: 'Step-by-step walkthrough of the SBA loan process with tips for approval.',
                    icon: Landmark,
                    tag: 'Guide'
                },
                {
                    id: 'startup-cost-est',
                    title: 'Startup Cost Estimator',
                    description: 'Calculate your one-time and recurring costs to determine funding needs.',
                    icon: Calculator,
                    tag: 'Template'
                },
                {
                    id: 'smb-funding-options',
                    title: 'Funding Options for Small Businesses',
                    description: 'From SBA loans to microloans to community grants — all your options in one place.',
                    icon: LineChart,
                    tag: 'Guide'
                }
            ],
            launch: [
                {
                    id: 'grand-opening-mktg',
                    title: 'Grand Opening Marketing Checklist',
                    description: 'Everything you need to create buzz for your launch, online and offline.',
                    icon: Rocket,
                    tag: 'Checklist'
                },
                {
                    id: 'local-seo-setup',
                    title: 'Local SEO Setup Guide',
                    description: 'Get found on Google Maps, Yelp, and local directories from day one.',
                    icon: Globe,
                    tag: 'Guide'
                },
                {
                    id: 'pricing-worksheet',
                    title: 'Pricing Strategy Worksheet',
                    description: 'Frameworks for cost-plus, value-based, and competitive pricing.',
                    icon: Calculator,
                    tag: 'Worksheet'
                },
                {
                    id: 'vendor-eval',
                    title: 'Vendor & Supplier Evaluation Template',
                    description: 'Compare and select vendors based on price, reliability, and terms.',
                    icon: Handshake,
                    tag: 'Template'
                },
                {
                    id: 'smb-customer-acq',
                    title: 'First Customer Acquisition Playbook',
                    description: 'Practical tactics for getting your first 50 paying customers.',
                    icon: Users,
                    tag: 'Guide'
                }
            ],
            establish: [
                {
                    id: 'cash-flow-template',
                    title: 'Cash Flow Management Template',
                    description: 'Weekly and monthly cash flow tracking to avoid surprises.',
                    icon: LineChart,
                    tag: 'Template'
                },
                {
                    id: 'hiring-checklist',
                    title: 'Employee Hiring Checklist',
                    description: 'From job posting to onboarding — everything for your first hire.',
                    icon: Users,
                    tag: 'Checklist'
                },
                {
                    id: 'sop-template',
                    title: 'Standard Operating Procedures Template',
                    description: 'Document your processes so your business can run without you.',
                    icon: List,
                    tag: 'Template'
                },
                {
                    id: 'bookkeeping-setup',
                    title: 'Bookkeeping & Accounting Setup Guide',
                    description: 'Choose the right tools and system for tracking your finances from the start.',
                    icon: Calculator,
                    tag: 'Guide'
                },
                {
                    id: 'retention-playbook',
                    title: 'Customer Retention Playbook',
                    description: 'Strategies for turning one-time buyers into repeat customers and referral sources.',
                    icon: Heart,
                    tag: 'Guide'
                }
            ],
            optimize: [
                {
                    id: 'ops-audit',
                    title: 'Operational Efficiency Audit',
                    description: 'Identify bottlenecks, waste, and automation opportunities in your business.',
                    icon: CheckSquare,
                    tag: 'Worksheet'
                },
                {
                    id: 'smb-tax-strategy',
                    title: 'Tax Strategy Guide for Small Businesses',
                    description: 'Deductions, entity optimization, and quarterly planning to minimize tax burden.',
                    icon: Landmark,
                    tag: 'Guide'
                },
                {
                    id: 'mktg-automation',
                    title: 'Marketing Automation Starter Kit',
                    description: 'Set up email sequences, social scheduling, and lead nurturing on a budget.',
                    icon: Zap,
                    tag: 'Toolkit'
                },
                {
                    id: 'financial-health',
                    title: 'Financial Health Scorecard',
                    description: 'Key ratios and metrics every small business owner should track monthly.',
                    icon: PieChart,
                    tag: 'Template'
                },
                {
                    id: 'tech-roadmap',
                    title: 'Technology Adoption Roadmap',
                    description: 'Which tools to adopt and when, based on your business stage and budget.',
                    icon: Map,
                    tag: 'Guide'
                }
            ],
            expand: [
                {
                    id: 'multi-location',
                    title: 'Multi-Location Expansion Playbook',
                    description: 'How to replicate your success in a second location without losing quality.',
                    icon: Map,
                    tag: 'Guide'
                },
                {
                    id: 'franchise-eval',
                    title: 'Franchising Feasibility Assessment',
                    description: 'Evaluate whether franchising is the right growth model for your business.',
                    icon: Scale,
                    tag: 'Worksheet'
                },
                {
                    id: 'product-expansion',
                    title: 'New Product/Service Line Evaluation',
                    description: 'Framework for deciding whether to expand your offerings.',
                    icon: Layout,
                    tag: 'Template'
                },
                {
                    id: 'partnership-guide',
                    title: 'Strategic Partnership Development Guide',
                    description: 'How to identify, approach, and structure partnerships for growth.',
                    icon: Handshake,
                    tag: 'Guide'
                },
                {
                    id: 'succession-toolkit',
                    title: 'Succession Planning Toolkit',
                    description: 'Prepare your business for leadership transition, sale, or family succession.',
                    icon: Briefcase,
                    tag: 'Toolkit'
                }
            ]
        }
    },
    global: {
        id: 'global',
        name: 'US Market Entry',
        description: 'Immigrant founders and operators navigating the US market.',
        stages: [
            { id: 'pre-arrival', name: 'Pre-Arrival', description: 'Preparing to enter the US market from abroad.' },
            { id: 'landing', name: 'Landing', description: 'Setting up your legal, financial, and physical presence.' },
            { id: 'establishing', name: 'Establishing', description: 'Building credibility and operations in the US.' },
            { id: 'growing', name: 'Growing', description: 'Scaling your US business and team.' },
            { id: 'thriving', name: 'Thriving', description: 'Long-term success and giving back.' }
        ],
        resources: {
            'pre-arrival': [
                {
                    id: 'visa-pathways',
                    title: 'US Visa Pathways for Entrepreneurs',
                    description: 'O-1, E-2, L-1, H-1B, EB-5 — which visa fits your situation and timeline.',
                    icon: Scale,
                    tag: 'Guide'
                },
                {
                    id: 'market-research-abroad',
                    title: 'US Market Research from Abroad',
                    description: 'How to validate US market opportunity without being physically present.',
                    icon: Globe,
                    tag: 'Guide'
                },
                {
                    id: 'remote-entity',
                    title: 'Remote US Entity Formation Guide',
                    description: 'How to register a US company from your home country, step by step.',
                    icon: Building,
                    tag: 'Guide'
                },
                {
                    id: 'us-biz-culture',
                    title: 'Understanding US Business Culture',
                    description: 'Communication styles, negotiation norms, and relationship-building in American business.',
                    icon: MessageSquare,
                    tag: 'Guide'
                },
                {
                    id: 'pre-arrival-financial',
                    title: 'Pre-Arrival Financial Checklist',
                    description: 'Banking, credit, tax, and financial setup you can begin before you land.',
                    icon: CheckSquare,
                    tag: 'Checklist'
                },
                {
                    id: 'city-selection',
                    title: 'US City Selection Guide for Founders',
                    description: 'Compare Austin, SF, NYC, Miami, and other hubs for your specific business type.',
                    icon: Map,
                    tag: 'Guide'
                }
            ],
            landing: [
                {
                    id: 'ssn-itin-guide',
                    title: 'SSN & ITIN Acquisition Guide',
                    description: 'How to get your Social Security Number or Individual Taxpayer ID as a foreign national.',
                    icon: FileText,
                    tag: 'Guide'
                },
                {
                    id: 'banking-non-citizens',
                    title: 'US Business Banking Setup for Non-Citizens',
                    description: 'Which banks work with international founders and how to open accounts.',
                    icon: Landmark,
                    tag: 'Guide'
                },
                {
                    id: 'legal-counsel-eval',
                    title: 'Finding Legal Counsel Checklist',
                    description: 'How to find and evaluate immigration, corporate, and tax attorneys.',
                    icon: CheckSquare,
                    tag: 'Checklist'
                },
                {
                    id: 'state-env-compare',
                    title: 'State-by-State Business Environment Comparison',
                    description: 'Tax rates, regulations, and incentives across key states for your business type.',
                    icon: Scale,
                    tag: 'Guide'
                },
                {
                    id: 'austin-relocation',
                    title: 'Relocation & Housing Guide: Austin',
                    description: 'Neighborhoods, costs, transportation, and practical tips for settling in Austin.',
                    icon: Building,
                    tag: 'Guide'
                },
                {
                    id: 'ein-registration',
                    title: 'EIN & Tax Registration Walkthrough',
                    description: 'Step-by-step instructions for getting your Employer Identification Number.',
                    icon: FileText,
                    tag: 'Guide'
                }
            ],
            establishing: [
                {
                    id: 'credit-building',
                    title: 'US Credit Building Playbook for Immigrants',
                    description: 'How to build business and personal credit from zero as a non-citizen.',
                    icon: LineChart,
                    tag: 'Guide'
                },
                {
                    id: 'employment-law',
                    title: 'US Employment Law Basics for Foreign Founders',
                    description: 'What you need to know about hiring, payroll, and compliance in the US.',
                    icon: Briefcase,
                    tag: 'Guide'
                },
                {
                    id: 'gtm-strategy',
                    title: 'US Go-to-Market Strategy Guide',
                    description: 'How marketing, sales, and customer acquisition differ in the American market.',
                    icon: Rocket,
                    tag: 'Guide'
                },
                {
                    id: 'ip-protection',
                    title: 'US Intellectual Property Protection Guide',
                    description: 'Trademarks, patents, copyrights — protecting your IP in the US system.',
                    icon: Shield,
                    tag: 'Guide'
                },
                {
                    id: 'regulatory-env',
                    title: 'Navigating US Regulatory Environment',
                    description: 'Industry-specific regulations and compliance requirements you need to know.',
                    icon: GraduationCap,
                    tag: 'Guide'
                },
                {
                    id: 'service-directory',
                    title: 'IFN Vetted Service Provider Directory',
                    description: 'Curated list of immigration lawyers, CPAs, and business services trusted by our community.',
                    icon: List,
                    tag: 'Directory'
                }
            ],
            growing: [
                {
                    id: 'intl-fundraising',
                    title: 'Fundraising as an International Founder',
                    description: 'Unique challenges, investor concerns, and strategies for non-US-born founders raising capital.',
                    icon: Landmark,
                    tag: 'Guide'
                },
                {
                    id: 'professional-network',
                    title: 'Building an American Professional Network',
                    description: 'Strategies for networking, relationship-building, and social capital in the US.',
                    icon: Heart,
                    tag: 'Guide'
                },
                {
                    id: 'tax-obligations',
                    title: 'US Tax Obligations for Foreign Nationals',
                    description: 'Federal, state, and international tax considerations for non-citizen founders.',
                    icon: Calculator,
                    tag: 'Guide'
                },
                {
                    id: 'dual-entity',
                    title: 'Dual-Entity Structure Guide',
                    description: 'How to structure operations across your US company and home-country entity.',
                    icon: Layers,
                    tag: 'Guide'
                },
                {
                    id: 'scaling-states',
                    title: 'Scaling Across US States',
                    description: 'Nexus, registration, and compliance when you operate in multiple states.',
                    icon: Map,
                    tag: 'Guide'
                },
                {
                    id: 'green-card-sponsorship',
                    title: 'H-1B to Green Card Employer Sponsorship',
                    description: 'How to sponsor yourself and employees for permanent residency through your company.',
                    icon: FileText,
                    tag: 'Guide'
                }
            ],
            thriving: [
                {
                    id: 'business-gc-pathways',
                    title: 'Green Card Through Business Pathways',
                    description: 'EB-1, EB-2 NIW, and other routes to permanent residency for successful founders.',
                    icon: GraduationCap,
                    tag: 'Guide'
                },
                {
                    id: 'intl-estate-planning',
                    title: 'International Estate & Asset Planning',
                    description: 'Managing assets across countries, estate planning, and cross-border tax optimization.',
                    icon: Calculator,
                    tag: 'Guide'
                },
                {
                    id: 'mentorship-framework',
                    title: 'Giving Back: Mentorship Framework',
                    description: 'How to structure your time and expertise to help the next wave of international founders.',
                    icon: Heart,
                    tag: 'Toolkit'
                },
                {
                    id: 'multi-country-ops',
                    title: 'Multi-Country Operations Playbook',
                    description: 'Managing teams, finances, and compliance across multiple countries.',
                    icon: Globe,
                    tag: 'Guide'
                },
                {
                    id: 'ambassador-program',
                    title: 'IFN Ambassador Program Guide',
                    description: 'How to lead an IFN chapter in your city and grow the international founder community.',
                    icon: Users,
                    tag: 'Guide'
                }
            ]
        }
    },
    global_expansion: {
        id: 'global_expansion',
        name: 'International Expansion',
        description: 'Scaling your business beyond your home market across the globe.',
        stages: [
            { id: 'market-research', name: 'Market Research', description: 'Evaluating which international markets fit your product.' },
            { id: 'market-selection', name: 'Market Selection', description: 'Choosing your first expansion market and entry strategy.' },
            { id: 'entity-compliance', name: 'Entity & Compliance', description: 'Setting up legal and regulatory infrastructure abroad.' },
            { id: 'launch-localization', name: 'Launch & Localization', description: 'Adapting your product and brand for new markets.' },
            { id: 'scale-optimize', name: 'Scale & Optimize', description: 'Building repeatable operations across multiple countries.' }
        ],
        resources: {
            'market-research': [
                {
                    id: 'market-eval-framework',
                    title: 'Market Evaluation Framework',
                    description: 'A structured approach to comparing and scoring potential international markets.',
                    icon: Map,
                    tag: 'Template'
                }
            ],
            'market-selection': [
                {
                    id: 'entry-strategy-guide',
                    title: 'Market Entry Strategy Guide',
                    description: 'Direct sales, partnerships, or joint ventures—choosing the right model.',
                    icon: Map,
                    tag: 'Guide'
                }
            ],
            'entity-compliance': [
                {
                    id: 'global-entity-structures',
                    title: 'Global Entity Structures Comparison',
                    description: 'Pros, cons, and costs of forming subsidiaries vs branches globally.',
                    icon: Building,
                    tag: 'Guide'
                }
            ],
            'launch-localization': [
                {
                    id: 'localization-checklist',
                    title: 'Product Localization Checklist',
                    description: 'Beyond translation—adapting your product for local culture and regulations.',
                    icon: CheckSquare,
                    tag: 'Checklist'
                }
            ],
            'scale-optimize': [
                {
                    id: 'global-team-ops',
                    title: 'Global Team Operations Playbook',
                    description: 'Managing asynchronous teams, compensation, and culture across timezones.',
                    icon: Globe,
                    tag: 'Guide'
                }
            ]
        }
    }
};

// Add isComingSoon and isMembersOnly to all resources except 3 flagship ones per audience
Object.keys(RESOURCES_DATA).forEach(segmentKey => {
    const segment = RESOURCES_DATA[segmentKey];
    let liveCount = 0;
    Object.keys(segment.resources).forEach(stageKey => {
        segment.resources[stageKey].forEach(resource => {
            if (liveCount < 3) {
                resource.isComingSoon = false;
                liveCount++;
            } else {
                resource.isComingSoon = true;
            }
            // Add custom flags for specific items if needed
            if (resource.id === 'service-directory') resource.isMembersOnly = true;
            if (resource.id === 'mvp-budget') resource.isMembersOnly = true;
        });
    });
});
