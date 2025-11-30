import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Search, BarChart3, Users, RotateCcw } from 'lucide-react';

const Layout: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-600">
                        <LayoutDashboard size={24} />
                        <span>MarketTracker</span>
                    </Link>

                    <nav className="flex items-center gap-1">
                        <Link
                            to="/"
                            className={`p-2 rounded-lg transition-colors ${isActive('/') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            title="Dashboard"
                        >
                            <LayoutDashboard size={20} />
                        </Link>
                        <Link
                            to="/add"
                            className={`p-2 rounded-lg transition-colors ${isActive('/add') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            title="Add Product"
                        >
                            <PlusCircle size={20} />
                        </Link>
                        <Link
                            to="/search"
                            className={`p-2 rounded-lg transition-colors ${isActive('/search') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            title="Search"
                        >
                            <Search size={20} />
                        </Link>
                        <Link
                            to="/suppliers"
                            className={`p-2 rounded-lg transition-colors ${isActive('/suppliers') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            title="Suppliers"
                        >
                            <Users size={20} />
                        </Link>
                        <Link
                            to="/stats"
                            className={`p-2 rounded-lg transition-colors ${isActive('/stats') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            title="Statistics"
                        >
                            <BarChart3 size={20} />
                        </Link>
                        <Link
                            to="/returns"
                            className={`p-2 rounded-lg transition-colors ${isActive('/returns') ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'}`}
                            title="Returns"
                        >
                            <RotateCcw size={20} />
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
