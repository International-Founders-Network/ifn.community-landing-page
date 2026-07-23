import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { QrCode, Layers } from 'lucide-react';
import { Generator } from './pages/Generator';
import { Bulk } from './pages/Bulk';
import { Manage } from './pages/Manage';

function Shell() {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-extrabold text-primary text-lg">
                        <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center">
                            <QrCode size={18} />
                        </span>
                        IFN&nbsp;QR
                    </Link>
                    <nav className="flex items-center gap-1">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                                }`
                            }
                        >
                            Generator
                        </NavLink>
                        <NavLink
                            to="/bulk"
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${isActive ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                                }`
                            }
                        >
                            <Layers size={15} />
                            Bulk
                        </NavLink>
                        <a
                            href="https://ifn.community"
                            className="ml-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors hidden sm:block"
                        >
                            ifn.community &rarr;
                        </a>
                    </nav>
                </div>
            </header>
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Generator />} />
                    <Route path="/bulk" element={<Bulk />} />
                    <Route path="/manage/:token" element={<Manage />} />
                </Routes>
            </main>
            <footer className="py-8 text-center text-sm text-slate-400">
                Built by International Founders Network
            </footer>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Shell />
        </BrowserRouter>
    );
}

export default App;
