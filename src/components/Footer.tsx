import { Twitter, Linkedin, Instagram, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { GlobeIcon } from './GlobeIcon';

export function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        Company: [
            { name: 'About Us', href: '/about' },
            { name: 'Contact', href: '/contact' },
        ],
        Resources: [
            { name: 'Events Calendar', href: '/#events' },
            { name: 'Founders Toolkit', href: '/#resources' },
        ],
        Community: [
            { name: 'Code of Conduct', href: '/code-of-conduct' },
        ],
        Legal: [
            { name: 'Privacy Policy', href: '/privacy-policy' },
            { name: 'Terms of Service', href: '/terms-and-conditions' },
        ],
    };

    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
                    {/* Brand & Newsletter */}
                    <div className="lg:col-span-5 space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-primary text-white p-2 rounded-lg">
                                <GlobeIcon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-primary">
                                IFN<span className="text-accent">.community</span>
                            </span>
                        </Link>
                        <p className="text-slate-600 max-w-sm">
                            Connecting founders worldwide to build, grow, and succeed together. Join the global network of changemakers.
                        </p>


                    </div>

                    {/* Links Grid */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category}>
                                <h3 className="font-bold text-slate-900 mb-4">{category}</h3>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <li key={link.name}>
                                            <Link to={link.href} className="text-slate-600 hover:text-primary transition-colors text-sm">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © {currentYear} IFN Global LLC. All rights reserved.
                    </p>

                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <span>Built with</span>
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        <span>from Austin</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                            <Linkedin size={20} />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                            <Mail size={20} />
                        </a>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
